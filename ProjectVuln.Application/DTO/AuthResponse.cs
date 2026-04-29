namespace ProjectVuln.Application.DTO;

public class AuthResponse
{
    public string? Token { get; set; }
    public DateTime ExpiresAt { get; set; }
    public Guid UserId { get; set; }
    public string? Email { get; set; }
    public string? Name { get; set; }
}
