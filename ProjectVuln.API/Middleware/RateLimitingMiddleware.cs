using System.Collections.Concurrent;
using System.Text.Json;

namespace ProjectVuln.API.Middleware;

public class RateLimitingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<RateLimitingMiddleware> _logger;
    private static readonly ConcurrentDictionary<string, ClientRequestInfo> _clients = new();
    private readonly int _requestLimitPerMinute;
    private readonly int _requestLimitPerHour;

    public RateLimitingMiddleware(
        RequestDelegate next, 
        ILogger<RateLimitingMiddleware> logger,
        IConfiguration configuration)
    {
        _next = next;
        _logger = logger;
        _requestLimitPerMinute = int.Parse(configuration["RateLimiting:RequestsPerMinute"] ?? "100");
        _requestLimitPerHour = int.Parse(configuration["RateLimiting:RequestsPerHour"] ?? "1000");
    }

    public async Task InvokeAsync(HttpContext context)
    {
        var clientIp = GetClientIp(context);
        var clientInfo = _clients.AddOrUpdate(clientIp, 
            _ => new ClientRequestInfo(), 
            (_, info) => info);

        var now = DateTime.UtcNow;

        // Evaluate limits within a lock, but defer I/O outside the lock
        bool limitExceeded = false;
        string? responsePayload = null;
        int responseStatusCode = StatusCodes.Status200OK;

        lock (clientInfo)
        {
            // Clean up old requests outside the 1-hour window
            clientInfo.RequestTimestamps.RemoveAll(t => t < now.AddHours(-1));

            // Check rate limits
            var requestsInLastMinute = clientInfo.RequestTimestamps.Count(t => t >= now.AddMinutes(-1));
            var requestsInLastHour = clientInfo.RequestTimestamps.Count;

            if (requestsInLastMinute >= _requestLimitPerMinute)
            {
                _logger.LogWarning($"Rate limit exceeded for IP {clientIp}: {requestsInLastMinute} requests in last minute");
                var response = new
                {
                    success = false,
                    error = "Too many requests. Rate limit exceeded.",
                    retryAfter = 60,
                    message = $"Maximum {_requestLimitPerMinute} requests per minute allowed"
                };

                responseStatusCode = StatusCodes.Status429TooManyRequests;
                responsePayload = JsonSerializer.Serialize(response);
                limitExceeded = true;
            }
            else if (requestsInLastHour >= _requestLimitPerHour)
            {
                _logger.LogWarning($"Hourly rate limit exceeded for IP {clientIp}: {requestsInLastHour} requests in last hour");
                var response = new
                {
                    success = false,
                    error = "Hourly rate limit exceeded.",
                    retryAfter = 3600,
                    message = $"Maximum {_requestLimitPerHour} requests per hour allowed"
                };

                responseStatusCode = StatusCodes.Status429TooManyRequests;
                responsePayload = JsonSerializer.Serialize(response);
                limitExceeded = true;
            }
            else
            {
                // Add current request timestamp only if not limited
                clientInfo.RequestTimestamps.Add(now);
            }
        }

        if (limitExceeded)
        {
            context.Response.StatusCode = responseStatusCode;
            context.Response.ContentType = "application/json";
            if (responsePayload is not null)
            {
                await context.Response.WriteAsync(responsePayload);
            }
            return;
        }

        // Clean up old clients (not accessed for 24 hours)
        if (_clients.Count > 10000)
        {
            var oldClients = _clients
                .Where(kvp => kvp.Value.LastAccessTime < now.AddHours(-24))
                .Select(kvp => kvp.Key)
                .Take(1000)
                .ToList();

            foreach (var oldClient in oldClients)
            {
                _clients.TryRemove(oldClient, out _);
            }
        }

        await _next(context);
    }

    private string GetClientIp(HttpContext context)
    {
        // Check for X-Forwarded-For header (for proxies)
        if (context.Request.Headers.TryGetValue("X-Forwarded-For", out var forwardedFor))
        {
            var ips = forwardedFor.ToString().Split(',');
            if (ips.Length > 0)
                return ips[0].Trim();
        }

        // Fall back to remote address
        return context.Connection.RemoteIpAddress?.ToString() ?? "unknown";
    }

    private class ClientRequestInfo
    {
        public List<DateTime> RequestTimestamps { get; } = new();
        public DateTime LastAccessTime { get; set; } = DateTime.UtcNow;
    }
}

public static class RateLimitingMiddlewareExtensions
{
    public static IApplicationBuilder UseRateLimiting(this IApplicationBuilder builder)
    {
        return builder.UseMiddleware<RateLimitingMiddleware>();
    }
}
