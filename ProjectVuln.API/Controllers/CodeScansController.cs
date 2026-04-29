using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using ProjectVuln.Application.DTO;
using ProjectVuln.Application.Interfaces;
using ProjectVuln.Application.Result;

namespace ProjectVuln.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class CodeScansController : ControllerBase
{
    private readonly ICodeScanService _codeScanService;
    private readonly ILogger<CodeScansController> _logger;

    public CodeScansController(ICodeScanService codeScanService, ILogger<CodeScansController> logger)
    {
        _codeScanService = codeScanService;
        _logger = logger;
    }

    [HttpPost]
    [ProducesResponseType(typeof(ScanResponse), StatusCodes.Status201Created)]
    public async Task<IActionResult> CreateScan([FromBody] ScanRequest request)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new { success = false, error = "Invalid request", errors = ModelState });
            }

            var (userId, role, plan) = GetIdentityContext();
            ServiceResult<ScanResponse> result = await _codeScanService.CreateScanAsync(request, userId, role, plan);

            if (!result.Success)
            {
                return StatusCode(result.StatusCode, new { success = false, error = result.Message });
            }

            return CreatedAtAction(
                nameof(GetScan),
                new { id = result.Data?.Id },
                new { success = true, data = result.Data, message = "Scan queued for processing" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating scan");
            return StatusCode(500, new { success = false, error = "Internal server error", detail = ex.Message });
        }
    }

    [HttpGet("{id}")]
    [ProducesResponseType(typeof(ScanResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetScan(Guid id)
    {
        try
        {
            var (userId, role, _) = GetIdentityContext();
            ServiceResult<ScanResponse> result = await _codeScanService.GetScanAsync(id, userId, role);

            if (!result.Success)
            {
                return StatusCode(result.StatusCode, new { success = false, error = result.Message });
            }

            return Ok(new { success = true, data = result.Data });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving scan {ScanId}", id);
            return StatusCode(500, new { success = false, error = "Internal server error", detail = ex.Message });
        }
    }

    [HttpGet]
    [ProducesResponseType(typeof(List<ScanResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAllScans([FromQuery] int page = 1, [FromQuery] int pageSize = 10)
    {
        try
        {
            if (page < 1) page = 1;
            if (pageSize < 1 || pageSize > 100) pageSize = 10;

            var (userId, role, _) = GetIdentityContext();
            ServiceResult<List<ScanResponse>> result = await _codeScanService.GetAllScansAsync(userId, role);

            if (!result.Success)
            {
                return StatusCode(result.StatusCode, new { success = false, error = result.Message });
            }

            return Ok(new { success = true, data = result.Data, page, pageSize });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving scans");
            return StatusCode(500, new { success = false, error = "Internal server error", detail = ex.Message });
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteScan(Guid id)
    {
        try
        {
            var (_, role, _) = GetIdentityContext();
            var result = await _codeScanService.DeleteScanAsync(id, role);
            if (!result.Success)
            {
                return StatusCode(result.StatusCode, new { success = false, error = result.Message });
            }

            return Ok(new { success = true, message = "Scan deleted" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting scan {ScanId}", id);
            return StatusCode(500, new { success = false, error = "Internal server error", detail = ex.Message });
        }
    }

    private (string? UserId, string? Role, string? Plan) GetIdentityContext()
    {
        var userId = User.FindFirstValue("userId") ?? User.FindFirstValue(ClaimTypes.NameIdentifier);
        var role = User.FindFirstValue("role") ?? User.FindFirstValue(ClaimTypes.Role);
        var plan = User.FindFirstValue("plan");
        return (userId, role, plan);
    }
}
