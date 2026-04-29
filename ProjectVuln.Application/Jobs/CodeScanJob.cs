using System.Diagnostics;
using System.Text.Json;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using ProjectVuln.Application.Interfaces;
using ProjectVuln.Domain.entity;
using ProjectVuln.Domain.enums;

namespace ProjectVuln.Application.Jobs;

public class CodeScanJob
{
    private readonly ICodeScanRepository _repository;
    private readonly IAiScanner _aiScanner;
    private readonly IConfiguration _configuration;
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly ILogger<CodeScanJob> _logger;

    public CodeScanJob(
        ICodeScanRepository repository,
        IAiScanner aiScanner,
        IConfiguration configuration,
        IHttpClientFactory httpClientFactory,
        ILogger<CodeScanJob> logger)
    {
        _repository = repository;
        _aiScanner = aiScanner;
        _configuration = configuration;
        _httpClientFactory = httpClientFactory;
        _logger = logger;
    }

    public async Task ProcessPendingScansAsync()
    {
        var pendingScans = await _repository.GetPendingScansAsync();
        foreach (var scan in pendingScans)
        {
            await ExecuteAsync(scan.Id);
        }
    }

    public async Task ExecuteAsync(Guid scanId)
    {
        var scan = await _repository.GetByIdAsync(scanId);
        if (scan == null)
        {
            _logger.LogWarning("Scan {ScanId} was not found", scanId);
            return;
        }

        try
        {
            // Original flow step: status transitions to Running once job starts.
            scan.Status = ScanStatus.Running;
            await _repository.UpdateAsync(scan);

            if (scan.Type == ScanType.Code)
            {
                await ProcessCodeScanAsync(scan);
            }
            else if (scan.Type == ScanType.RepoUrl)
            {
                await ProcessRepoScanAsync(scan);
            }
            else if (scan.Type == ScanType.Website)
            {
                await ProcessWebsiteScanAsync(scan);
            }

            scan.Status = ScanStatus.Completed;
            scan.CompletedAt = DateTime.UtcNow;
            await _repository.UpdateAsync(scan);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Scan {ScanId} failed", scanId);
            scan.Status = ScanStatus.Failed;
            scan.ErrorMessage = ex.Message;
            scan.CompletedAt = DateTime.UtcNow;
            await _repository.UpdateAsync(scan);
        }
    }

    private async Task ProcessCodeScanAsync(CodeScan scan)
    {
        var (hasVuln, raw, confidence, vulnType) = await _aiScanner.ScanCodeAsync(scan.Code ?? string.Empty);

        scan.HasVulnerabilities = hasVuln;
        scan.AiRawResponse = raw;
        scan.ConfidenceScore = confidence;
        scan.VulnerabilityType = vulnType;
    }

    private async Task ProcessRepoScanAsync(CodeScan scan)
    {
        if (string.IsNullOrWhiteSpace(scan.RepoUrl))
        {
            throw new InvalidOperationException("RepoUrl is required for repository scans");
        }

        var tempRoot = Path.Combine(Path.GetTempPath(), "ProjectVulnRepoScans");
        Directory.CreateDirectory(tempRoot);

        var tempRepoPath = Path.Combine(tempRoot, Guid.NewGuid().ToString("N"));
        var branch = string.IsNullOrWhiteSpace(scan.Branch) ? "main" : scan.Branch;

        try
        {
            var clone = new ProcessStartInfo
            {
                FileName = "git",
                Arguments = $"clone --depth 1 --branch {branch} {scan.RepoUrl} \"{tempRepoPath}\"",
                RedirectStandardError = true,
                RedirectStandardOutput = true,
                UseShellExecute = false,
                CreateNoWindow = true
            };

            using var process = Process.Start(clone);
            if (process == null)
            {
                throw new InvalidOperationException("Failed to start git clone process");
            }

            var timeoutMs = _configuration.GetValue<int?>("Limits:RepoCloneTimeoutMs") ?? 120000;
            var exited = await Task.Run(() => process.WaitForExit(timeoutMs));
            if (!exited || process.ExitCode != 0)
            {
                var err = await process.StandardError.ReadToEndAsync();
                throw new InvalidOperationException($"Repository clone failed: {err}");
            }

            var (hasVuln, raw, confidence, vulnType) = await _aiScanner.ScanRepoAsync(tempRepoPath);

            scan.HasVulnerabilities = hasVuln;
            scan.AiRawResponse = raw;
            scan.ConfidenceScore = confidence;
            scan.VulnerabilityType = vulnType;
        }
        finally
        {
            try
            {
                if (Directory.Exists(tempRepoPath))
                {
                    Directory.Delete(tempRepoPath, true);
                }
            }
            catch (Exception cleanupEx)
            {
                _logger.LogWarning(cleanupEx, "Failed to cleanup temporary repository path {RepoPath}", tempRepoPath);
            }
        }
    }

    private async Task ProcessWebsiteScanAsync(CodeScan scan)
    {
        if (string.IsNullOrWhiteSpace(scan.TargetUrl))
        {
            throw new InvalidOperationException("TargetUrl is required for website scans");
        }

        var zapBaseUrl = _configuration["Zap:BaseUrl"] ?? "http://localhost:8080";
        var zapApiKey = _configuration["Zap:ApiKey"] ?? string.Empty;

        var client = _httpClientFactory.CreateClient();
        var startScanUrl = $"{zapBaseUrl.TrimEnd('/')}/JSON/ascan/action/scan/?url={Uri.EscapeDataString(scan.TargetUrl)}&apikey={Uri.EscapeDataString(zapApiKey)}";
        using var startResponse = await client.GetAsync(startScanUrl);
        startResponse.EnsureSuccessStatusCode();

        var startJson = await startResponse.Content.ReadAsStringAsync();
        var startDoc = JsonDocument.Parse(startJson);
        var zapScanId = startDoc.RootElement.TryGetProperty("scan", out var scanIdEl)
            ? scanIdEl.GetString()
            : null;

        if (string.IsNullOrWhiteSpace(zapScanId))
        {
            throw new InvalidOperationException("ZAP did not return a scan id");
        }

        scan.ZapScanId = zapScanId;
        await _repository.UpdateAsync(scan);

        var pollLimit = _configuration.GetValue<int?>("Zap:PollMaxIterations") ?? 120;
        for (var i = 0; i < pollLimit; i++)
        {
            await Task.Delay(2000);

            var statusUrl = $"{zapBaseUrl.TrimEnd('/')}/JSON/ascan/view/status/?scanId={Uri.EscapeDataString(zapScanId)}&apikey={Uri.EscapeDataString(zapApiKey)}";
            using var statusResponse = await client.GetAsync(statusUrl);
            statusResponse.EnsureSuccessStatusCode();

            var statusJson = await statusResponse.Content.ReadAsStringAsync();
            var statusDoc = JsonDocument.Parse(statusJson);
            var statusValue = statusDoc.RootElement.TryGetProperty("status", out var statusEl)
                ? statusEl.GetString()
                : "0";

            if (int.TryParse(statusValue, out var percentage) && percentage >= 100)
            {
                break;
            }
        }

        var alertsUrl = $"{zapBaseUrl.TrimEnd('/')}/JSON/core/view/alerts/?baseurl={Uri.EscapeDataString(scan.TargetUrl)}&apikey={Uri.EscapeDataString(zapApiKey)}";
        using var alertsResponse = await client.GetAsync(alertsUrl);
        alertsResponse.EnsureSuccessStatusCode();

        var alertsJson = await alertsResponse.Content.ReadAsStringAsync();
        var alertsDoc = JsonDocument.Parse(alertsJson);

        var findings = new List<object>();
        var high = 0;
        var medium = 0;
        var low = 0;

        if (alertsDoc.RootElement.TryGetProperty("alerts", out var alerts) && alerts.ValueKind == JsonValueKind.Array)
        {
            foreach (var alert in alerts.EnumerateArray())
            {
                var risk = alert.TryGetProperty("risk", out var riskEl) ? (riskEl.GetString() ?? "") : "";
                if (risk.Equals("High", StringComparison.OrdinalIgnoreCase)) high++;
                else if (risk.Equals("Medium", StringComparison.OrdinalIgnoreCase)) medium++;
                else if (risk.Equals("Low", StringComparison.OrdinalIgnoreCase)) low++;

                findings.Add(new
                {
                    title = alert.TryGetProperty("name", out var nameEl) ? nameEl.GetString() : "Unknown",
                    risk,
                    description = alert.TryGetProperty("description", out var descriptionEl) ? descriptionEl.GetString() : string.Empty,
                    solution = alert.TryGetProperty("solution", out var solutionEl) ? solutionEl.GetString() : string.Empty,
                    url = alert.TryGetProperty("url", out var urlEl) ? urlEl.GetString() : scan.TargetUrl,
                    source = "zap"
                });
            }
        }

        var total = high + medium + low;
        var hasVuln = total > 0;
        var dominantRisk = high > 0 ? "High" : medium > 0 ? "Medium" : low > 0 ? "Low" : null;

        var report = new
        {
            summary = new { total, high, medium, low },
            findings
        };

        scan.HasVulnerabilities = hasVuln;
        scan.VulnerabilityType = dominantRisk;
        scan.ConfidenceScore = hasVuln ? 1.0 : 0.0;
        scan.AiRawResponse = alertsJson;
        scan.ResultsJson = JsonSerializer.Serialize(report);
    }
}