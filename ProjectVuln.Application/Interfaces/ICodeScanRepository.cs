using ProjectVuln.Domain.entity;

namespace ProjectVuln.Application.Interfaces;

public interface ICodeScanRepository

{
    Task<CodeScan> AddAsync(CodeScan scan);
    Task<CodeScan?> GetByIdAsync(Guid id);
    Task<CodeScan?> GetByIdForUserAsync(Guid id, string userId);
    Task<List<CodeScan>> GetAllAsync();
    Task<List<CodeScan>> GetByUserAsync(string userId);
    Task<List<CodeScan>> GetPendingScansAsync();
    Task UpdateAsync(CodeScan scan);
    Task DeleteAsync(CodeScan scan);
}