using LibGit2Sharp;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace ProjectVuln.Infrastructure.Services;

public interface IRepositoryScanner
{
    Task<List<SourceFile>> ScanRepositoryAsync(string repoUrl, string branch);
}

public class SourceFile
{
    public string FilePath { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
}

public class RepositoryScanner : IRepositoryScanner
{
    private readonly ILogger<RepositoryScanner> _logger;
    private readonly string _tempDirectory;
    private readonly HashSet<string> _allowedExtensions = new()
    {
        ".c", ".cpp", ".py", ".js", ".java", ".cs", ".go", ".rb", ".php", ".h", ".hpp"
    };

    private readonly long _maxFileSize;
    private readonly long _maxRepoSize;

    public RepositoryScanner(IConfiguration configuration, ILogger<RepositoryScanner> logger)
    {
        _logger = logger;
        _tempDirectory = Path.Combine(Path.GetTempPath(), "ProjectVuln_Scans");
        _maxFileSize = long.Parse(configuration["Limits:MaxFileSizeBytes"] ?? "1048576"); // 1MB
        _maxRepoSize = long.Parse(configuration["Limits:MaxRepoSizeBytes"] ?? "104857600"); // 100MB
        
        Directory.CreateDirectory(_tempDirectory);
    }

    public async Task<List<SourceFile>> ScanRepositoryAsync(string repoUrl, string branch)
    {
        var repoPath = Path.Combine(_tempDirectory, Guid.NewGuid().ToString());
        
        try
        {
            _logger.LogInformation("Cloning repository {RepoUrl} branch {Branch}", repoUrl, branch);

            // Clone repository
            var cloneOptions = new CloneOptions
            {
                BranchName = branch,
                RecurseSubmodules = false
            };

            Repository.Clone(repoUrl, repoPath, cloneOptions);

            // Check repository size
            var repoSize = GetDirectorySize(new DirectoryInfo(repoPath));
            if (repoSize > _maxRepoSize)
            {
                throw new InvalidOperationException(
                    $"Repository size {repoSize} bytes exceeds maximum limit of {_maxRepoSize} bytes");
            }

            _logger.LogInformation("Repository cloned successfully, scanning source files");

            // Extract source files
            var sourceFiles = new List<SourceFile>();
            await Task.Run(() => ScanDirectory(repoPath, sourceFiles));

            if (sourceFiles.Count == 0)
            {
                throw new InvalidOperationException("No source files found in repository");
            }

            _logger.LogInformation("Found {Count} source files", sourceFiles.Count);
            return sourceFiles;
        }
        finally
        {
            // Cleanup
            if (Directory.Exists(repoPath))
            {
                try
                {
                    Directory.Delete(repoPath, true);
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Failed to delete temporary repository directory");
                }
            }
        }
    }

    private void ScanDirectory(string directory, List<SourceFile> sourceFiles)
    {
        var dirInfo = new DirectoryInfo(directory);

        // Skip .git directory
        if (dirInfo.Name == ".git") return;

        foreach (var file in dirInfo.GetFiles())
        {
            var extension = file.Extension.ToLower();
            if (_allowedExtensions.Contains(extension) && file.Length <= _maxFileSize)
            {
                try
                {
                    var content = File.ReadAllText(file.FullName);
                    sourceFiles.Add(new SourceFile
                    {
                        FilePath = file.FullName,
                        Content = content
                    });
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Failed to read file {FilePath}", file.FullName);
                }
            }
        }

        foreach (var subDir in dirInfo.GetDirectories())
        {
            ScanDirectory(subDir.FullName, sourceFiles);
        }
    }

    private long GetDirectorySize(DirectoryInfo directory)
    {
        long size = 0;
        
        foreach (var file in directory.GetFiles())
        {
            size += file.Length;
        }

        foreach (var subDir in directory.GetDirectories())
        {
            size += GetDirectorySize(subDir);
        }

        return size;
    }
}
