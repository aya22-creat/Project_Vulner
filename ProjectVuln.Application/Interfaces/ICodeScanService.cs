using ProjectVuln.Domain.entity;
using ProjectVuln.Application.DTO;

namespace ProjectVuln.Application.Interfaces;

public interface ICodeScanService
{
    Task<ScanResponse> CreateScanAsync(ScanRequest request);
    Task<ScanResponse?> GetScanAsync(Guid id);
    Task<List<ScanResponse>> GetAllScansAsync();
    Task<ScanResponse?> GetScanResultAsync(Guid id);

}
