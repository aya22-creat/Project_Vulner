using ProjectVuln.Domain.entity;
using ProjectVuln.Domain.enums;
namespace ProjectVuln.Application.DTO;

public class ScanResponse
{
    public Guid Id { get; set; }
    public ScanType Type { get; set; }
    public string? Code { get; set; }
    public string? RepoUrl { get; set; }
    public bool? HasVulnerabilities { get; set; }
    public double? ConfidenceScore { get; set; }
    public string? AiRawResponse { get; set; }
    public ScanStatus Status { get; set; }
    public DateTime CreatedAt { get; set; }

}