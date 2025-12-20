using ProjectVuln.Application.DTO;

 
 namespace ProjectVuln.Application.Services;


public interface ICodeScanService
{
    Task<ScanResponse> ScanAsync(ScanRequest request);
}
