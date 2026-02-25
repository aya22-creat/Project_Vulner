using ProjectVuln.Domain.entity;

namespace ProjectVuln.Application.Interfaces;

public interface IUserRepository
{
    Task<Reg> AddAsync(Reg user);
    Task<Reg?> GetByEmailAsync(string email);
    Task<Reg?> GetByIdAsync(Guid id);
}
