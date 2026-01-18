using Microsoft.EntityFrameworkCore;
using ProjectVuln.Application.Interfaces;
using ProjectVuln.Domain.entity;
using ProjectVuln.Infrastructure.Data;

namespace ProjectVuln.Infrastructure.Repositories;


public class CodeScanRepository : ICodeScanRepository
{
    private readonly AppDbContext _context;

    public CodeScanRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<CodeScan> AddAsync(CodeScan scan)
    {
        await _context.CodeScans.AddAsync(scan);
        await _context.SaveChangesAsync();
        return scan;
    }

    public async Task<CodeScan?> GetByIdAsync(Guid id)
    {
        return await _context.CodeScans.FindAsync(id);
    }

    public async Task<List<CodeScan>> GetAllAsync()
    {
        return await _context.CodeScans
            .OrderByDescending(s => s.CreatedAt)
            .ToListAsync();
    }

    public async Task<List<CodeScan>> GetPendingScansAsync()
    {
        return await _context.CodeScans
            .Where(s => s.Status == ScanStatus.Pending)
            .OrderBy(s => s.CreatedAt)
            .ToListAsync();
    }

    public async Task UpdateAsync(CodeScan scan)
    {
        _context.CodeScans.Update(scan);
        await _context.SaveChangesAsync();
    }

}