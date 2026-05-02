using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CozyComfort.API.Data;
using CozyComfort.API.Models;
using System.Security.Cryptography;
using System.Text;

namespace CozyComfort.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly CozyComfortContext _context;

        public AuthController(CozyComfortContext context)
        {
            _context = context;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            if (await _context.Users.AnyAsync(u => u.Email == request.Email))
            {
                return BadRequest(new { message = "Email already exists" });
            }

            if (await _context.Users.AnyAsync(u => u.Username == request.Username))
            {
                return BadRequest(new { message = "Username already exists" });
            }

            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                var user = new User
                {
                    Username = request.Username,
                    Email = request.Email,
                    Role = request.Role,
                    PasswordHash = HashPassword(request.Password)
                };

                _context.Users.Add(user);
                await _context.SaveChangesAsync(); // Save to generate UserId

                if (request.Role == "Seller")
                {
                    var seller = new Seller
                    {
                        UserId = user.UserId,
                        Name = request.Username,
                        Email = request.Email,
                        ContactPerson = request.Username,
                        Phone = "Not Provided",
                        Location = "Not Provided"
                    };
                    _context.Sellers.Add(seller);
                }
                else if (request.Role == "Distributor")
                {
                    var distributor = new Distributor
                    {
                        UserId = user.UserId,
                        Name = request.Username,
                        Email = request.Email,
                        ContactPerson = request.Username,
                        Phone = "Not Provided",
                        Address = "Not Provided"
                    };
                    _context.Distributors.Add(distributor);
                }
                else if (request.Role == "Manufacturer")
                {
                    var manufacturer = new Manufacturer
                    {
                        UserId = user.UserId,
                        Name = request.Username,
                        Email = request.Email,
                        ContactPerson = request.Username,
                        Phone = "Not Provided",
                        Location = "Not Provided"
                    };
                    _context.Manufacturers.Add(manufacturer);
                }

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return Ok(new { message = "Registration successful", userId = user.UserId });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return StatusCode(500, new { message = "An error occurred during registration", error = ex.Message, details = ex.InnerException?.Message });
            }
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Username == request.Username);
            if (user == null || user.PasswordHash != HashPassword(request.Password))
            {
                return Unauthorized(new { message = "Invalid credentials" });
            }

            object? roleData = null;

            if (user.Role == "Manufacturer")
            {
                roleData = await _context.Manufacturers.FirstOrDefaultAsync(m => m.UserId == user.UserId);
            }
            else if (user.Role == "Distributor")
            {
                roleData = await _context.Distributors.FirstOrDefaultAsync(d => d.UserId == user.UserId);
            }
            else if (user.Role == "Seller")
            {
                roleData = await _context.Sellers.FirstOrDefaultAsync(s => s.UserId == user.UserId);
            }

            return Ok(new { 
                message = "Login successful", 
                user = new { 
                    user.UserId, 
                    user.Username, 
                    user.Role,
                    Manufacturer = user.Role == "Manufacturer" ? roleData : null,
                    Distributor = user.Role == "Distributor" ? roleData : null,
                    Seller = user.Role == "Seller" ? roleData : null
                } 
            });
        }

        private string HashPassword(string password)
        {
            using var sha256 = SHA256.Create();
            var bytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
            return Convert.ToBase64String(bytes);
        }
    }

    public class RegisterRequest
    {
        public string Username { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string Role { get; set; } = "User";
    }

    public class LoginRequest
    {
        public string Username { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }
}
