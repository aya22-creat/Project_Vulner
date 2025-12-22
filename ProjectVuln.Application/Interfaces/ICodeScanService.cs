using ProjectVuln.Application.DTO;
using ProjectVuln.Application.Result;
namespace ProjectVuln.Application.Interfaces;


public interface ICodeScanService
{
    Task<ServiceResult<ScanResponse>> CreateScanAsync(ScanRequest request);

    Task<ServiceResult<ScanResponse>> GetScanAsync(Guid id);

    Task<ServiceResult<List<ScanResponse>>> GetAllScansAsync();
}
