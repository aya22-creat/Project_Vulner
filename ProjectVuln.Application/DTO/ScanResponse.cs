using ProjectVuln.Domain.entity;
using ProjectVuln.Domain.enums;
namespace ProjectVuln.Application.DTO;

public class ScanResponse
{
    public Guid Id { get; set; }
    public ScanType Type { get; set; }
    public string? UserId { get; set; }
    public string? Code { get; set; }
    public string? RepoUrl { get; set; }
    public string? TargetUrl { get; set; }
    public string? ZapScanId { get; set; }
    public string? ResultsJson { get; set; }
    public string? ErrorMessage { get; set; }
    public DateTime? CompletedAt { get; set; }
    public bool? HasVulnerabilities { get; set; }
    public string? VulnerabilityType { get; set; }
    public double? ConfidenceScore { get; set; }
    public string? AiRawResponse { get; set; }
    public ScanStatus Status { get; set; }
    public DateTime CreatedAt { get; set; }

}