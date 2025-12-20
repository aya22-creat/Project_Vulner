using ProjectVuln.Domain.enums;
using ProjectVuln.Domain.entity;
namespace ProjectVuln.Application.DTO;

public class ScanRequest
{
    public ScanType Type { get; set; }
    public string? Code { get; set; }
    public string? RepoUrl { get; set; } 
     public string? Branch { get; set; } = "main";
}