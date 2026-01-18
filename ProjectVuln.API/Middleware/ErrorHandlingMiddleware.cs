using System.Net;
using System.Text.Json;

namespace ProjectVuln.API.Middleware;

public class ErrorHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ErrorHandlingMiddleware> _logger;

    public ErrorHandlingMiddleware(RequestDelegate next, ILogger<ErrorHandlingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (OperationCanceledException ex)
        {
            _logger.LogWarning($"Operation cancelled: {ex.Message}");
            await HandleExceptionAsync(context, ex, HttpStatusCode.RequestTimeout);
        }
        catch (ArgumentNullException ex)
        {
            _logger.LogWarning($"Argument null exception: {ex.Message}");
            await HandleExceptionAsync(context, ex, HttpStatusCode.BadRequest);
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning($"Argument exception: {ex.Message}");
            await HandleExceptionAsync(context, ex, HttpStatusCode.BadRequest);
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning($"Unauthorized access: {ex.Message}");
            await HandleExceptionAsync(context, ex, HttpStatusCode.Unauthorized);
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning($"Invalid operation: {ex.Message}");
            await HandleExceptionAsync(context, ex, HttpStatusCode.BadRequest);
        }
        catch (HttpRequestException ex)
        {
            _logger.LogWarning($"HTTP request exception: {ex.Message}");
            await HandleExceptionAsync(context, ex, HttpStatusCode.ServiceUnavailable);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unhandled exception occurred");
            await HandleExceptionAsync(context, ex, HttpStatusCode.InternalServerError);
        }
    }

    private static Task HandleExceptionAsync(HttpContext context, Exception exception, HttpStatusCode statusCode)
    {
        context.Response.ContentType = "application/json";
        context.Response.StatusCode = (int)statusCode;

        var response = new
        {
            success = false,
            error = exception.Message,
            exceptionType = exception.GetType().Name,
            statusCode = (int)statusCode,
            timestamp = DateTime.UtcNow,
            traceId = context.TraceIdentifier
        };

        var options = new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };
        var json = JsonSerializer.Serialize(response, options);

        return context.Response.WriteAsync(json);
    }
}

public static class ErrorHandlingMiddlewareExtensions
{
    public static IApplicationBuilder UseErrorHandling(this IApplicationBuilder builder)
    {
        return builder.UseMiddleware<ErrorHandlingMiddleware>();
    }
}
