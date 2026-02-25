using Hangfire;
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

    public CodeScanService(ICodeScanRepository repository, IServiceProvider serviceProvider, IHostEnvironment env)
    {
        _repository = repository;
        _serviceProvider = serviceProvider;
        _env = env;
    }

    public async Task<ServiceResult<ScanResponse>> CreateScanAsync(ScanRequest request)
    {
        var scan = new CodeScan
        {
            Type = request.Type,
            Code = request.Type == ScanType.Code ? request.Code : null,
            RepoUrl = request.Type == ScanType.RepoUrl ? request.RepoUrl : null,
            Branch = request.Branch,
            Status = ScanStatus.Pending,

        };

        await _repository.AddAsync(scan);

        // In Development, run job inline without Hangfire to avoid storage configuration.
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

    public async Task<ServiceResult<ScanResponse>> GetScanAsync(Guid id)
    {
        var scan = await _repository.GetByIdAsync(id);

        if (scan == null)
            return ServiceResult<ScanResponse>.Failure(404, "Scan not found");

        return ServiceResult<ScanResponse>.SuccessResult(200, MapToResponse(scan));
    }

    public async Task<ServiceResult<List<ScanResponse>>> GetAllScansAsync()
    {
        var scans = await _repository.GetAllAsync();

        var result = scans.Select(MapToResponse).ToList();

        return ServiceResult<List<ScanResponse>>.SuccessResult(200, result);
    }

    private static ScanResponse MapToResponse(CodeScan scan)
    {
        return new ScanResponse
        {
            Id = scan.Id,
            Type = scan.Type,
            Code = scan.Code,
            RepoUrl = scan.RepoUrl,
            HasVulnerabilities = scan.HasVulnerabilities,
            ConfidenceScore = scan.ConfidenceScore,
            AiRawResponse = scan.AiRawResponse,
            Status = scan.Status,
            CreatedAt = scan.CreatedAt
        };
    }
}
