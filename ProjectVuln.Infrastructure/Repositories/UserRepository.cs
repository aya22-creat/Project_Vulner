using Microsoft.EntityFrameworkCore;
using ProjectVuln.Application.Interfaces;
using ProjectVuln.Domain.entity;
using ProjectVuln.Infrastructure.Data;

namespace ProjectVuln.Infrastructure.Repositories;

public class UserRepository : IUserRepository
{
    private readonly AppDbContext _context;

    public UserRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Reg> AddAsync(Reg user)
    {
        await _context.Users.AddAsync(user);
        await _context.SaveChangesAsync();
        return user;
    }

    public async Task<Reg?> GetByEmailAsync(string email)
    {
        return await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
    }

    public async Task<Reg?> GetByIdAsync(Guid id)
    {
        return await _context.Users.FindAsync(id);
    }
}
