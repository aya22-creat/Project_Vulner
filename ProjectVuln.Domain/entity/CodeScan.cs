using ProjectVuln.Domain.enums;
namespace ProjectVuln.Domain.entity;

public class CodeScan
{
     public Guid Id { get; set; }
     public ScanType Type { get; set; }
     public string? Code { get; set; }
     public string? RepoUrl { get; set; } 
     public bool? HasVulnerabilities { get; set; } 
     public string? Branch { get; set; }
     public double? ConfidenceScore { get; set; } 
    public string? AiRawResponse { get; set; }
     public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
