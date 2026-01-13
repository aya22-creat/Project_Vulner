using ProjectVuln.Domain.entity;

namespace ProjectVuln.Application.Interfaces
{
    public interface IAiScanner
    {
        Task<(bool HasVulnerabilities, string RawResponse, double ConfidenceScore)> ScanCodeAsync(string code);
        Task<(bool HasVulnerabilities, string RawResponse, double ConfidenceScore)> ScanRepoAsync(string repoPath);
    }
}
