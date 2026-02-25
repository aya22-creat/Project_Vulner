using System.Security.Cryptography;
using System.Text;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using ProjectVuln.Application.DTO;
using ProjectVuln.Application.Interfaces;
using ProjectVuln.Domain.entity;

namespace ProjectVuln.Application.Services;

public class UserService : IUserService
{
    private readonly IUserRepository _repo;
    private readonly IConfiguration _config;

    public UserService(IUserRepository repo, IConfiguration config)
    {
        _repo = repo;
        _config = config;
    }

    public async Task<AuthResponse> RegisterAsync(RegisterRequest request)
    {
        if (string.IsNullOrEmpty(request.Email) || string.IsNullOrEmpty(request.Password))
            throw new ArgumentException("Email and password are required");

        var existing = await _repo.GetByEmailAsync(request.Email!);
        if (existing != null)
            throw new InvalidOperationException("User already exists");

        var passwordHash = HashPassword(request.Password!);

        var user = new Reg
        {
            Name = request.Name,
            Email = request.Email,
            PasswordHash = passwordHash
        };

        await _repo.AddAsync(user);

        var token = GenerateToken(user);

        return new AuthResponse
        {
            Token = token.token,
            ExpiresAt = token.expiresAt,
            UserId = user.Id,
            Email = user.Email,
            Name = user.Name
        };
    }

    public async Task<AuthResponse?> LoginAsync(LoginRequest request)
    {
        if (string.IsNullOrEmpty(request.Email) || string.IsNullOrEmpty(request.Password))
            return null;

        var user = await _repo.GetByEmailAsync(request.Email!);
        if (user == null) return null;

        if (!VerifyPassword(request.Password!, user.PasswordHash))
            return null;

        var token = GenerateToken(user);

        return new AuthResponse
        {
            Token = token.token,
            ExpiresAt = token.expiresAt,
            UserId = user.Id,
            Email = user.Email,
            Name = user.Name
        };
    }

    // PBKDF2 hashing
    private static string HashPassword(string password)
    {
        using var rng = RandomNumberGenerator.Create();
        byte[] salt = new byte[16];
        rng.GetBytes(salt);

        using var pbkdf2 = new Rfc2898DeriveBytes(password, salt, 100_000, HashAlgorithmName.SHA256);
        byte[] hash = pbkdf2.GetBytes(32);

        var combined = new byte[1 + salt.Length + hash.Length];
        combined[0] = 0; // version
        Buffer.BlockCopy(salt, 0, combined, 1, salt.Length);
        Buffer.BlockCopy(hash, 0, combined, 1 + salt.Length, hash.Length);
        return Convert.ToBase64String(combined);
    }

    private static bool VerifyPassword(string password, string stored)
    {
        try
        {
            var combined = Convert.FromBase64String(stored);
            if (combined.Length != 1 + 16 + 32) return false;
            var salt = new byte[16];
            Buffer.BlockCopy(combined, 1, salt, 0, 16);
            var hash = new byte[32];
            Buffer.BlockCopy(combined, 1 + 16, hash, 0, 32);

            using var pbkdf2 = new Rfc2898DeriveBytes(password, salt, 100_000, HashAlgorithmName.SHA256);
            var computed = pbkdf2.GetBytes(32);
            return CryptographicOperations.FixedTimeEquals(computed, hash);
        }
        catch
        {
            return false;
        }
    }

    private (string token, DateTime expiresAt) GenerateToken(Reg user)
    {
        var key = _config["Jwt:Key"] ?? "dev-secret-key-change";
        var issuer = _config["Jwt:Issuer"] ?? "projectvuln";

        var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key));
        var creds = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

        var expires = DateTime.UtcNow.AddDays(7);

        var claims = new[] {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.Email, user.Email ?? string.Empty),
            new Claim("name", user.Name ?? string.Empty)
        };

        var token = new JwtSecurityToken(
            issuer,
            issuer,
            claims,
            expires: expires,
            signingCredentials: creds);

        var tokenStr = new JwtSecurityTokenHandler().WriteToken(token);
        return (tokenStr, expires);
    }
}
