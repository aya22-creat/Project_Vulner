using Hangfire;
using Hangfire.Dashboard;
using Microsoft.EntityFrameworkCore;
using ProjectVuln.Application.Interfaces;
using ProjectVuln.Application.Services;
using ProjectVuln.Application.Jobs;
using ProjectVuln.Infrastructure.Data;
using ProjectVuln.Infrastructure.Repositories;
using ProjectVuln.Infrastructure.Services;
using ProjectVuln.API.Middleware;
using Scalar.AspNetCore;
using Swashbuckle.AspNetCore.SwaggerGen;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddOpenApi();
builder.Services.AddSwaggerGen();

// ============================================
// CORS Configuration - Allow Frontend Access
// ============================================
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policyBuilder =>
    {
        policyBuilder
            .WithOrigins(
                "http://localhost:3000",
                "http://localhost:3001",
                "http://127.0.0.1:3000",
                "http://127.0.0.1:3001"
            )
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials();
    });
});

// ============================================
// Dependency Injection Registration
// ============================================
builder.Services.AddScoped<ICodeScanService, CodeScanService>();
builder.Services.AddScoped<ICodeScanRepository, CodeScanRepository>();

// AI Scanner typed HttpClient
builder.Services.AddHttpClient<IAiScanner, AiScanner>(client =>
{
    var aiServiceUrl = builder.Configuration["AiService:BaseUrl"] ?? "http://localhost:8000";
    client.BaseAddress = new Uri(aiServiceUrl);
    client.Timeout = TimeSpan.FromSeconds(int.Parse(builder.Configuration["AiService:TimeoutSeconds"] ?? "60"));
});

// Additional AI client with retry policy (if used elsewhere)
builder.Services.AddHttpClient<AiClientWithRetry>(client =>
{
    var aiServiceUrl = builder.Configuration["AiService:BaseUrl"] ?? "http://localhost:8000";
    client.BaseAddress = new Uri(aiServiceUrl);
    client.Timeout = TimeSpan.FromSeconds(int.Parse(builder.Configuration["AiService:TimeoutSeconds"] ?? "60"));
});
builder.Services.AddTransient<ProjectVuln.Application.Jobs.CodeScanJob>();

// User auth services
builder.Services.AddScoped<ProjectVuln.Application.Interfaces.IUserRepository, ProjectVuln.Infrastructure.Repositories.UserRepository>();
builder.Services.AddScoped<ProjectVuln.Application.Interfaces.IUserService, ProjectVuln.Application.Services.UserService>();

// ============================================
// Database Configuration
// ============================================
if (builder.Environment.IsDevelopment())
{
    // Use SQLite for development
    builder.Services.AddDbContext<AppDbContext>(options =>
        options.UseSqlite("Data Source=ProjectVuln.db"));
}
else
{
    // Use SQL Server for production
    builder.Services.AddDbContext<AppDbContext>(options =>
        options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));
}

// ============================================
// Background Job Configuration (Hangfire)
// ============================================
// Enable Hangfire in all environments
builder.Services.AddHangfire(config =>
{
    if (builder.Environment.IsDevelopment())
    {
        // Use in-memory storage for development
        config.UseInMemoryStorage();
    }
    else
    {
        config.UseSqlServerStorage(builder.Configuration.GetConnectionString("DefaultConnection"));
    }
});
builder.Services.AddHangfireServer();

// ============================================
// Logging Configuration
// ============================================
builder.Services.AddLogging(options =>
{
    options.ClearProviders();
    options.AddConsole();
    options.AddDebug();
});

var app = builder.Build();

// ============================================
// Middleware Pipeline Configuration
// ============================================

// Swagger/OpenAPI in Development
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
    app.MapScalarApiReference();
    app.MapOpenApi();
}

// Hangfire Dashboard
app.UseHangfireDashboard("/hangfire", new DashboardOptions
{
    Authorization = new[] { new HangfireAuthorizationFilter() }
});

// CORS - Enable all environments
app.UseCors("AllowFrontend");

// Custom Middleware - Error Handling & Rate Limiting
app.UseMiddleware<ErrorHandlingMiddleware>();
app.UseMiddleware<RateLimitingMiddleware>();

app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();

// ============================================
// Database Migration & Initialization
// ============================================
using (var scope = app.Services.CreateScope())
{
    try
    {
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        db.Database.Migrate();
        EnsureSqliteCompatibilityColumns(db);
        Console.WriteLine("✓ Database migration completed successfully");
        
        // Set up Hangfire recurring job for processing pending scans
        var recurringJobManager = scope.ServiceProvider.GetRequiredService<IRecurringJobManager>();
        recurringJobManager.AddOrUpdate<CodeScanJob>(
            "process-pending-scans",
            job => job.ProcessPendingScansAsync(),
            Cron.Minutely); // Run every minute
        Console.WriteLine("✓ Hangfire recurring job configured: process-pending-scans");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"✗ Database migration failed: {ex.Message}");
    }
}

Console.WriteLine("🚀 API Server starting on https://localhost:5284");
app.Run();

static void EnsureSqliteCompatibilityColumns(AppDbContext db)
{
    if (!db.Database.IsSqlite())
    {
        return;
    }

    // Legacy local DBs can miss columns added after the first migration.
    // Add them defensively so runtime queries do not fail with "no such column".
    var expectedColumns = new[]
    {
        "UserId",
        "TargetUrl",
        "ZapScanId",
        "ResultsJson",
        "ErrorMessage",
        "CompletedAt"
    };

    var existingColumns = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
    var connection = db.Database.GetDbConnection();
    var shouldCloseConnection = connection.State != System.Data.ConnectionState.Open;
    if (shouldCloseConnection)
    {
        connection.Open();
    }

    try
    {
        using var pragmaCommand = connection.CreateCommand();
        pragmaCommand.CommandText = "PRAGMA table_info('CodeScans');";
        using var reader = pragmaCommand.ExecuteReader();

        while (reader.Read())
        {
            var columnName = reader.GetString(1);
            existingColumns.Add(columnName);
        }

        foreach (var columnName in expectedColumns)
        {
            if (!existingColumns.Contains(columnName))
            {
                // Execute fixed statements to avoid SQL interpolation warnings.
                switch (columnName)
                {
                    case "UserId":
                        db.Database.ExecuteSqlRaw("ALTER TABLE CodeScans ADD COLUMN UserId TEXT NULL;");
                        break;
                    case "TargetUrl":
                        db.Database.ExecuteSqlRaw("ALTER TABLE CodeScans ADD COLUMN TargetUrl TEXT NULL;");
                        break;
                    case "ZapScanId":
                        db.Database.ExecuteSqlRaw("ALTER TABLE CodeScans ADD COLUMN ZapScanId TEXT NULL;");
                        break;
                    case "ResultsJson":
                        db.Database.ExecuteSqlRaw("ALTER TABLE CodeScans ADD COLUMN ResultsJson TEXT NULL;");
                        break;
                    case "ErrorMessage":
                        db.Database.ExecuteSqlRaw("ALTER TABLE CodeScans ADD COLUMN ErrorMessage TEXT NULL;");
                        break;
                    case "CompletedAt":
                        db.Database.ExecuteSqlRaw("ALTER TABLE CodeScans ADD COLUMN CompletedAt TEXT NULL;");
                        break;
                }
            }
        }
    }
    finally
    {
        if (shouldCloseConnection)
        {
            connection.Close();
        }
    }
}

// Simple authorization filter for Hangfire dashboard
public class HangfireAuthorizationFilter : IDashboardAuthorizationFilter
{
    public bool Authorize(DashboardContext context) => true; // Allow all in dev
}
