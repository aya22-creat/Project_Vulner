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

// HttpClient for AI Service calls
builder.Services.AddHttpClient<AiClientWithRetry>(client =>
{
    var aiServiceUrl = builder.Configuration["AiService:BaseUrl"] ?? "http://localhost:8000";
    client.BaseAddress = new Uri(aiServiceUrl);
    client.Timeout = TimeSpan.FromSeconds(int.Parse(builder.Configuration["AiService:TimeoutSeconds"] ?? "60"));
});

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

// Simple authorization filter for Hangfire dashboard
public class HangfireAuthorizationFilter : IDashboardAuthorizationFilter
{
    public bool Authorize(DashboardContext context) => true; // Allow all in dev
}
