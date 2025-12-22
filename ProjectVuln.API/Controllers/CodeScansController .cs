using Microsoft.AspNetCore.Mvc;
using ProjectVuln.Application.DTO;
using ProjectVuln.Application.Interfaces;
using ProjectVuln.Application.Result;

namespace ProjectVuln.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CodeScansController : ControllerBase
    {
        private readonly ICodeScanService _codeScanService;

        public CodeScansController(ICodeScanService codeScanService)
        {
            _codeScanService = codeScanService;
        }

        [HttpPost]
        public async Task<IActionResult> CreateScan([FromBody] ScanRequest request)
        {
            ServiceResult<ScanResponse> result = await _codeScanService.CreateScanAsync(request);

            if (!result.Success)
                return StatusCode(result.StatusCode, result.Message);

            return StatusCode(result.StatusCode, result.Data);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetScan(Guid id)
        {
            ServiceResult<ScanResponse> result = await _codeScanService.GetScanAsync(id);

            if (!result.Success)
                return StatusCode(result.StatusCode, result.Message);

            return Ok(result.Data);
        }

        [HttpGet]
        public async Task<IActionResult> GetAllScans()
        {
            ServiceResult<List<ScanResponse>> result =
                await _codeScanService.GetAllScansAsync();

            if (!result.Success)
                return StatusCode(result.StatusCode, result.Message);

            return Ok(result.Data);
        }
    }
}
