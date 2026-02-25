namespace ProjectVuln.API.Controllers;

using Microsoft.AspNetCore.Mvc;
using ProjectVuln.Application.Interfaces;
using ProjectVuln.Domain.entity;

[ApiController]
[Route("api/[controller]")]
public class DashboardController : ControllerBase
{
    private readonly ICodeScanRepository _repository;
    
    public DashboardController(ICodeScanRepository repository)
    {
        _repository = repository;
    }
    
    [HttpGet("stats")]
    public async Task<IActionResult> GetStats()
    {
        var allScans = await _repository.GetAllAsync();
        
        var stats = new
        {
            totalScans = allScans.Count,
            vulnerableScans = allScans.Count(s => s.HasVulnerabilities == true),
            safeScans = allScans.Count(s => s.HasVulnerabilities == false),
            pendingScans = allScans.Count(s => s.HasVulnerabilities == null),
            failedScans = allScans.Count(s => s.Status == ScanStatus.Failed),
            recentScans = allScans.Take(10).Select(s => new
            {
                s.Id,
                s.Type,
                s.HasVulnerabilities,
                s.Status,
                s.CreatedAt
            })
        };
        
        return Ok(stats);
    }
}