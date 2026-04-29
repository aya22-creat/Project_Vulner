using Microsoft.AspNetCore.Mvc;

namespace ProjectVuln.API.Controllers;

/// <summary>
/// User Management API
/// Handles user registration and authentication
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly ILogger<UsersController> _logger;

    // Hardcoded valid credentials for demo/test
    private static readonly Dictionary<string, UserCredential> ValidUsers = new()
    {
        {
            "admin@codescan.io",
            new UserCredential
            {
                Id = Guid.Parse("550e8400-e29b-41d4-a716-446655440001"),
                Name = "Admin User",
                Email = "admin@codescan.io",
                Password = "admin123",
                IsDeveloper = true
            }
        },
        {
            "user@codescan.io",
            new UserCredential
            {
                Id = Guid.Parse("550e8400-e29b-41d4-a716-446655440002"),
                Name = "Regular User",
                Email = "user@codescan.io",
                Password = "user123",
                IsDeveloper = false
            }
        }
    };

    public UsersController(ILogger<UsersController> logger)
    {
        _logger = logger;
    }

    /// <summary>
    /// Register a new user (demo endpoint)
    /// </summary>
    [HttpPost("register")]
    public IActionResult Register([FromBody] RegisterRequest request)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(request.Email) ||
                string.IsNullOrWhiteSpace(request.Password) ||
                string.IsNullOrWhiteSpace(request.Name))
            {
                return BadRequest(new { message = "Email, password, and name are required" });
            }

            if (ValidUsers.ContainsKey(request.Email))
            {
                return Conflict(new { message = "User with this email already exists" });
            }

            // For demo purposes, accept the registration
            var newUser = new UserCredential
            {
                Id = Guid.NewGuid(),
                Name = request.Name,
                Email = request.Email,
                Password = request.Password,
                IsDeveloper = request.IsDeveloper ?? false
            };

            ValidUsers[request.Email] = newUser;
            _logger.LogInformation($"User registered: {request.Email}");

            return Ok(new
            {
                message = "User registered successfully",
                userId = newUser.Id,
                email = newUser.Email
            });
        }
        catch (Exception ex)
        {
            _logger.LogError($"Registration error: {ex.Message}");
            return StatusCode(500, new { message = "Registration failed", error = ex.Message });
        }
    }

    /// <summary>
    /// Login user and get user info
    /// </summary>
    [HttpPost("login")]
    public IActionResult Login([FromBody] LoginRequest request)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(request.Email) ||
                string.IsNullOrWhiteSpace(request.Password))
            {
                return BadRequest(new { message = "Email and password are required" });
            }

            if (!ValidUsers.TryGetValue(request.Email, out var user))
            {
                return Unauthorized(new { message = "Invalid email or password" });
            }

            if (user.Password != request.Password)
            {
                return Unauthorized(new { message = "Invalid email or password" });
            }

            _logger.LogInformation($"User logged in: {request.Email}");

            return Ok(new
            {
                message = "Login successful",
                userId = user.Id,
                email = user.Email,
                name = user.Name,
                isDeveloper = user.IsDeveloper
            });
        }
        catch (Exception ex)
        {
            _logger.LogError($"Login error: {ex.Message}");
            return StatusCode(500, new { message = "Login failed", error = ex.Message });
        }
    }

    /// <summary>
    /// Get all users
    /// </summary>
    [HttpGet]
    public IActionResult GetAllUsers()
    {
        try
        {
            var users = ValidUsers.Values
                .Select(u => new { u.Id, u.Name, u.Email, u.IsDeveloper })
                .ToList();

            return Ok(new
            {
                success = true,
                data = users
            });
        }
        catch (Exception ex)
        {
            _logger.LogError($"Get users error: {ex.Message}");
            return StatusCode(500, new { message = "Failed to get users", error = ex.Message });
        }
    }

    /// <summary>
    /// Get user by ID
    /// </summary>
    [HttpGet("{id}")]
    public IActionResult GetUser(Guid id)
    {
        try
        {
            var user = ValidUsers.Values.FirstOrDefault(u => u.Id == id);
            if (user == null)
            {
                return NotFound(new { message = "User not found" });
            }

            return Ok(new
            {
                success = true,
                data = new { user.Id, user.Name, user.Email, user.IsDeveloper }
            });
        }
        catch (Exception ex)
        {
            _logger.LogError($"Get user error: {ex.Message}");
            return StatusCode(500, new { message = "Failed to get user", error = ex.Message });
        }
    }
}

/// <summary>
/// User credential model
/// </summary>
public class UserCredential
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public bool IsDeveloper { get; set; }
}

/// <summary>
/// Register request model
/// </summary>
public class RegisterRequest
{
    public string Email { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public bool? IsDeveloper { get; set; }
}

/// <summary>
/// Login request model
/// </summary>
public class LoginRequest
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}
