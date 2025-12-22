using Hangfire;
using Microsoft.EntityFrameworkCore;
using ProjectVuln.Application.Interfaces;
using ProjectVuln.Application.Services;
using ProjectVuln.Infrastructure.Data;
using ProjectVuln.Infrastructure.Repositories;
using Scalar.AspNetCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
// Add services to the container.
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

builder.Services.AddScoped<ICodeScanService, CodeScanService>();
builder.Services.AddScoped<ICodeScanRepository, CodeScanRepository>();

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddHangfire(config =>
    config.UseSqlServerStorage(builder.Configuration.GetConnectionString("DefaultConnection")));
builder.Services.AddHangfireServer();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    // app.MapOpenApi();
}



app.UseHangfireDashboard("/hangfire");

app.MapScalarApiReference();
app.MapOpenApi();
app.UseHttpsRedirection();
app.MapControllers();




app.Run();

