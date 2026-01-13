using ProjectVuln.Application.Interfaces;
using ProjectVuln.Domain.entity;
using ProjectVuln.Domain.enums;
using System.Diagnostics;

namespace ProjectVuln.Application.Jobs
{
    public class CodeScanJob
    {
        private readonly ICodeScanRepository _repository;
        private readonly IAiScanner _aiScanner;

        public CodeScanJob(ICodeScanRepository repository, IAiScanner aiScanner)
        {
            _repository = repository;
            _aiScanner = aiScanner;
        }

        public async Task ExecuteAsync(Guid scanId)
        {
            var scan = await _repository.GetByIdAsync(scanId);
            if (scan == null)
                return;

            try
            {
                scan.Status = ScanStatus.Running;
                await _repository.UpdateAsync(scan);

                bool hasVuln = false;
                string rawResponse = "";
                double confidence = 0;

                if (scan.Type == ScanType.Code)
                {
                     if (string.IsNullOrEmpty(scan.Code))
                        throw new Exception("Code is empty for Code scan type.");

                     (hasVuln, rawResponse, confidence) = await _aiScanner.ScanCodeAsync(scan.Code);
                }
                else if (scan.Type == ScanType.RepoUrl)
                {
                    if (string.IsNullOrEmpty(scan.RepoUrl))
                        throw new Exception("RepoUrl is empty for RepoUrl scan type.");

                    // Create temp directory
                    string tempPath = Path.Combine(Path.GetTempPath(), "ProjectVuln_Scans", scan.Id.ToString());
                    if (Directory.Exists(tempPath))
                        Directory.Delete(tempPath, true);
                    Directory.CreateDirectory(tempPath);

                    try 
                    {
                        CloneRepo(scan.RepoUrl, scan.Branch ?? "main", tempPath);
                        (hasVuln, rawResponse, confidence) = await _aiScanner.ScanRepoAsync(tempPath);
                    }
                    finally
                    {
                        // Cleanup
                        if (Directory.Exists(tempPath))
                        {
                            try { Directory.Delete(tempPath, true); } catch { }
                        }
                    }
                }

                scan.AiRawResponse = rawResponse;
                scan.HasVulnerabilities = hasVuln;
                scan.ConfidenceScore = confidence;
                scan.Status = ScanStatus.Completed;
            }
            catch (Exception ex)
            {
                scan.Status = ScanStatus.Failed;
                scan.AiRawResponse = ex.ToString();
            }

            await _repository.UpdateAsync(scan);
        }

        private void CloneRepo(string repoUrl, string branch, string destinationPath)
        {
            var startInfo = new ProcessStartInfo
            {
                FileName = "git",
                Arguments = $"clone -b {branch} {repoUrl} .",
                WorkingDirectory = destinationPath,
                RedirectStandardOutput = true,
                RedirectStandardError = true,
                UseShellExecute = false,
                CreateNoWindow = true
            };

            using var process = Process.Start(startInfo);
            if (process == null) throw new Exception("Failed to start git process.");
            
            process.WaitForExit();
            
            if (process.ExitCode != 0)
            {
                var error = process.StandardError.ReadToEnd();
                throw new Exception($"Git clone failed: {error}");
            }
        }
    }
}
