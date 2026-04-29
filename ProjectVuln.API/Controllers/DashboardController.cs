using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using ProjectVuln.Application.Interfaces;
using ProjectVuln.Domain.entity;

namespace ProjectVuln.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DashboardController : ControllerBase
{
    private readonly ICodeScanService _scanService;

    public DashboardController(ICodeScanService scanService)
    {
        _scanService = scanService;
    }

    [HttpGet("stats")]
    public async Task<IActionResult> GetStats()
    {
        var userId = User.FindFirstValue("userId") ?? User.FindFirstValue(ClaimTypes.NameIdentifier);
        var role = User.FindFirstValue("role") ?? User.FindFirstValue(ClaimTypes.Role);

        var scansResult = await _scanService.GetAllScansAsync(userId, role);
        if (!scansResult.Success || scansResult.Data is null)
        {
            return StatusCode(scansResult.StatusCode, new { success = false, error = scansResult.Message });
        }

        var scans = scansResult.Data;
        var stats = new
        {
            totalScans = scans.Count,
            vulnerableScans = scans.Count(s => s.HasVulnerabilities == true),
            safeScans = scans.Count(s => s.HasVulnerabilities == false),
            pendingScans = scans.Count(s => s.Status == ScanStatus.Pending || s.Status == ScanStatus.Running),
            failedScans = scans.Count(s => s.Status == ScanStatus.Failed),
            recentScans = scans.Take(10)
        };

        return Ok(stats);
    }
}
