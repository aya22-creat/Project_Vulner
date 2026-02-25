using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Polly;
using Polly.Extensions.Http;
using System.Net.Http;
using System.Text;
using System.Text.Json;

namespace ProjectVuln.Infrastructure.Services;

public interface IAiClientWithRetry
{
    Task<AiScanResult> ScanCodeAsync(string code);
}

public class AiScanResult
{
    public string Label { get; set; } = string.Empty;
    public double Confidence { get; set; }
    public string RawResponse { get; set; } = string.Empty;
}

public class AiClientWithRetry : IAiClientWithRetry
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<AiClientWithRetry> _logger;
    private readonly string _aiServiceUrl;
    private readonly IAsyncPolicy<HttpResponseMessage> _retryPolicy;

    public AiClientWithRetry(
        HttpClient httpClient,
        IConfiguration configuration,
        ILogger<AiClientWithRetry> logger)
    {
        _httpClient = httpClient;
        _logger = logger;
        _aiServiceUrl = configuration["AiService:BaseUrl"] ?? "http://localhost:8000";
        _httpClient.Timeout = TimeSpan.FromSeconds(
            int.Parse(configuration["AiService:TimeoutSeconds"] ?? "60"));

        // Retry policy: 3 retries with exponential backoff
        _retryPolicy = HttpPolicyExtensions
            .HandleTransientHttpError()
            .WaitAndRetryAsync(
                3,
                retryAttempt => TimeSpan.FromSeconds(Math.Pow(2, retryAttempt)),
                onRetry: (outcome, timespan, retryCount, context) =>
                {
                    _logger.LogWarning(
                        "Retry {RetryCount} after {Delay}s due to {Exception}",
                        retryCount,
                        timespan.TotalSeconds,
                        outcome.Exception?.Message ?? outcome.Result.StatusCode.ToString());
                });
    }

    public async Task<AiScanResult> ScanCodeAsync(string code)
    {
        try
        {
            _logger.LogInformation("Sending code to AI service for scanning");

            var request = new { code };
            var content = new StringContent(
                JsonSerializer.Serialize(request),
                Encoding.UTF8,
                "application/json");

            var response = await _retryPolicy.ExecuteAsync(async () =>
                await _httpClient.PostAsync($"{_aiServiceUrl}/scan", content));

            response.EnsureSuccessStatusCode();

            var responseBody = await response.Content.ReadAsStringAsync();
            var aiResponse = JsonSerializer.Deserialize<AiApiResponse>(responseBody);

            if (aiResponse == null)
            {
                throw new InvalidOperationException("Invalid AI response");
            }

            _logger.LogInformation(
                "AI scan completed: Label={Label}, Confidence={Confidence}",
                aiResponse.label,
                aiResponse.confidence);

            return new AiScanResult
            {
                Label = aiResponse.label,
                Confidence = aiResponse.confidence,
                RawResponse = responseBody
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error calling AI service");
            throw;
        }
    }

    private class AiApiResponse
    {
        public string label { get; set; } = string.Empty;
        public double confidence { get; set; }
    }
}
