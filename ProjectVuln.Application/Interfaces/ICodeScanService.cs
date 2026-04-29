using ProjectVuln.Application.DTO;
using ProjectVuln.Application.Result;
namespace ProjectVuln.Application.Interfaces;


public interface ICodeScanService
{
    Task<ServiceResult<ScanResponse>> CreateScanAsync(
        ScanRequest request,
        string? userId = null,
        string? role = null,
        string? plan = null);

    Task<ServiceResult<ScanResponse>> GetScanAsync(Guid id, string? userId = null, string? role = null);

    Task<ServiceResult<List<ScanResponse>>> GetAllScansAsync(string? userId = null, string? role = null);

    Task<ServiceResult<bool>> DeleteScanAsync(Guid id, string? role = null);
}
