using Hangfire;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using ProjectVuln.Application.DTO;
using ProjectVuln.Application.Interfaces;
using ProjectVuln.Application.Jobs;
using ProjectVuln.Application.Result;
using ProjectVuln.Domain.entity;
using ProjectVuln.Domain.enums;

namespace ProjectVuln.Application.Services;

public class CodeScanService : ICodeScanService
{
    private readonly ICodeScanRepository _repository;
    private readonly IServiceProvider _serviceProvider;
    private readonly IHostEnvironment _env;
    private readonly IConfiguration _configuration;

    public CodeScanService(
        ICodeScanRepository repository,
        IServiceProvider serviceProvider,
        IHostEnvironment env,
        IConfiguration configuration)
    {
        _repository = repository;
        _serviceProvider = serviceProvider;
        _env = env;
        _configuration = configuration;
    }

    public async Task<ServiceResult<ScanResponse>> CreateScanAsync(
        ScanRequest request,
        string? userId = null,
        string? role = null,
        string? plan = null)
    {
        var validationResult = ScanRequestValidator.Validate(request);
        if (validationResult != System.ComponentModel.DataAnnotations.ValidationResult.Success)
        {
            return ServiceResult<ScanResponse>.Failure(400, validationResult?.ErrorMessage ?? "Invalid request");
        }

        var normalizedPlan = NormalizePlan(plan ?? request.Plan);
        var planCheck = await CanCreateScanAsync(userId, normalizedPlan, request.Type);
        if (!planCheck.Success)
        {
            return ServiceResult<ScanResponse>.Failure(planCheck.StatusCode, planCheck.Message);
        }

        var scan = new CodeScan
        {
            Type = request.Type,
            UserId = userId,
            Code = request.Type == ScanType.Code ? request.Code : null,
            RepoUrl = request.Type == ScanType.RepoUrl ? request.RepoUrl : null,
            TargetUrl = request.Type == ScanType.Website ? request.TargetUrl : null,
            Branch = request.Branch,
            Status = ScanStatus.Pending
        };

        await _repository.AddAsync(scan);

        // Preserve original behavior: create as Pending then queue background execution.
        if (_env.IsDevelopment())
        {
            using var scope = _serviceProvider.CreateScope();
            var job = scope.ServiceProvider.GetRequiredService<CodeScanJob>();
            _ = Task.Run(() => job.ExecuteAsync(scan.Id));
        }
        else
        {
            BackgroundJob.Enqueue<CodeScanJob>(job => job.ExecuteAsync(scan.Id));
        }

        return ServiceResult<ScanResponse>.SuccessResult(200, MapToResponse(scan), "Scan queued");
    }

    public async Task<ServiceResult<ScanResponse>> GetScanAsync(Guid id, string? userId = null, string? role = null)
    {
        var isAdmin = IsAdmin(role);
        CodeScan? scan;

        if (isAdmin || string.IsNullOrWhiteSpace(userId))
        {
            scan = await _repository.GetByIdAsync(id);
        }
        else
        {
            scan = await _repository.GetByIdForUserAsync(id, userId);
        }

        if (scan == null)
        {
            return ServiceResult<ScanResponse>.Failure(404, "Scan not found");
        }

        return ServiceResult<ScanResponse>.SuccessResult(200, MapToResponse(scan));
    }

    public async Task<ServiceResult<List<ScanResponse>>> GetAllScansAsync(string? userId = null, string? role = null)
    {
        var isAdmin = IsAdmin(role);
        List<CodeScan> scans;

        if (isAdmin || string.IsNullOrWhiteSpace(userId))
        {
            scans = await _repository.GetAllAsync();
        }
        else
        {
            scans = await _repository.GetByUserAsync(userId);
        }

        var result = scans.Select(MapToResponse).ToList();

        return ServiceResult<List<ScanResponse>>.SuccessResult(200, result);
    }

    public async Task<ServiceResult<bool>> DeleteScanAsync(Guid id, string? role = null)
    {
        if (!IsAdmin(role))
        {
            return ServiceResult<bool>.Failure(403, "Only admin can delete scans");
        }

        var scan = await _repository.GetByIdAsync(id);
        if (scan == null)
        {
            return ServiceResult<bool>.Failure(404, "Scan not found");
        }

        await _repository.DeleteAsync(scan);
        return ServiceResult<bool>.SuccessResult(200, true, "Scan deleted");
    }

    private async Task<ServiceResult<bool>> CanCreateScanAsync(string? userId, string plan, ScanType type)
    {
        if (string.IsNullOrWhiteSpace(userId))
        {
            // Backward-compatible anonymous mode: keep original flow for legacy clients.
            return ServiceResult<bool>.SuccessResult(200, true);
        }

        if (plan is "pro" or "premium")
        {
            return ServiceResult<bool>.SuccessResult(200, true);
        }

        var scans = await _repository.GetByUserAsync(userId);
        var freeTotalLimit = _configuration.GetValue<int?>("Plans:TrialMaxScans") ?? 20;
        var freeWebsiteLimit = _configuration.GetValue<int?>("Plans:TrialMaxWebsiteScans") ?? 3;

        if (scans.Count >= freeTotalLimit)
        {
            return ServiceResult<bool>.Failure(403, "Trial scan limit reached");
        }

        if (type == ScanType.Website)
        {
            var websiteCount = scans.Count(s => s.Type == ScanType.Website);
            if (websiteCount >= freeWebsiteLimit)
            {
                return ServiceResult<bool>.Failure(403, "Trial website scan limit reached");
            }
        }

        return ServiceResult<bool>.SuccessResult(200, true);
    }

    private static bool IsAdmin(string? role) =>
        string.Equals(role, "Admin", StringComparison.OrdinalIgnoreCase);

    private static string NormalizePlan(string? plan)
    {
        if (string.IsNullOrWhiteSpace(plan)) return "trial";
        return plan.Trim().ToLowerInvariant();
    }

    private static ScanResponse MapToResponse(CodeScan scan)
    {
        return new ScanResponse
        {
            Id = scan.Id,
            Type = scan.Type,
            UserId = scan.UserId,
            Code = scan.Code,
            RepoUrl = scan.RepoUrl,
            TargetUrl = scan.TargetUrl,
            ZapScanId = scan.ZapScanId,
            ResultsJson = scan.ResultsJson,
            ErrorMessage = scan.ErrorMessage,
            CompletedAt = scan.CompletedAt,
            HasVulnerabilities = scan.HasVulnerabilities,
            VulnerabilityType = scan.VulnerabilityType,
            ConfidenceScore = scan.ConfidenceScore,
            AiRawResponse = scan.AiRawResponse,
            Status = scan.Status,
            CreatedAt = scan.CreatedAt
        };
    }
}
