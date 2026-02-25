
namespace ProjectVuln.Domain.entity;

public class Reg
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string? Name { get; set; }
    public string? Email { get; set; }
    // Stored password hash (salted PBKDF2, base64)
    public string PasswordHash { get; set; } = string.Empty;
    public bool IsDeveloper { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}