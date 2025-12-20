using ProjectVuln.Domain.enums;
using ProjectVuln.Domain.entity;
namespace ProjectVuln.Application.DTO;

public class ScanResponse
{
    public Guid Id { get; set; }
    public ScanType Type { get; set; }
    public string? Code { get; set; }
    public string? RepoUrl { get; set; } 
    public bool? HasVulnerabilities { get; set; } 
    public double? ConfidenceScore { get; set; } 
 // public string? AiRawResponse { get; set; }
    public DateTime CreatedAt { get; set; }

}