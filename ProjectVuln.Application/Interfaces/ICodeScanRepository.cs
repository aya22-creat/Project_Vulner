using ProjectVuln.Domain.entity;

namespace ProjectVuln.Application.Interfaces;

public interface ICodeScanRepository

{
    Task<CodeScan> AddAsync(CodeScan scan);
    Task<CodeScan?> GetByIdAsync(Guid id);
    Task<List<CodeScan>> GetAllAsync();
    Task UpdateAsync(CodeScan scan);
}