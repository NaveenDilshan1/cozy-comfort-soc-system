using Microsoft.EntityFrameworkCore;
using CozyComfort.API.Data;
using CozyComfort.API.Models;
using System.Security.Cryptography;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddDbContext<CozyComfortContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c => 
{
    c.ResolveConflictingActions(apiDescriptions => apiDescriptions.First());
    c.CustomSchemaIds(x => x.FullName);
});

// Add CORS if needed
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseCors("AllowAll");

app.UseAuthorization();

app.MapControllers();


// Ensure database is created and migrated
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    var context = services.GetRequiredService<CozyComfortContext>();
    
    try
    {
        context.Database.EnsureCreated();

        // Seed data - get existing blankets first to avoid multiple DB hits
        var existingBlankets = context.Blankets.Select(b => b.ModelName).ToList();
        
        var initialBlankets = new[]
        {
            new Blanket { ModelName = "Cotton Blanket", Material = "Cotton", Size = "Queen", StockLevel = 150, ProductionCapacity = 100, ImageUrl = "/images/products/4a095d26-4d44-43d1-b2cd-823f2fbf0912.jpg" },
            new Blanket { ModelName = "Wool Blanket", Material = "Wool", Size = "King", StockLevel = 75, ProductionCapacity = 50, ImageUrl = "/images/products/4a2bfb78-b207-40bc-8c01-997cb1441075.jpg" },
            new Blanket { ModelName = "Fleece Blanket", Material = "Fleece", Size = "Queen", StockLevel = 120, ProductionCapacity = 80, ImageUrl = "/images/products/5ed91728-c794-4218-9f22-255edc34835e.jpg" },
            new Blanket { ModelName = "Velvet Blanket", Material = "Velvet", Size = "Queen", StockLevel = 60, ProductionCapacity = 40, ImageUrl = "/images/products/6aee055a-728d-42f5-a05c-f9d7e9030215.jpg" },
            new Blanket { ModelName = "Silk Blanket", Material = "Silk", Size = "King", StockLevel = 30, ProductionCapacity = 20, ImageUrl = "/images/products/7a4710d9-92d4-4567-bba9-8b0a71d02eb1.jpg" },
            new Blanket { ModelName = "Sherpa Blanket", Material = "Sherpa", Size = "Queen", StockLevel = 90, ProductionCapacity = 60, ImageUrl = "/images/products/904f78b0-6fdd-4673-a808-168d88ed547a.jpg" },
            new Blanket { ModelName = "Polyester Blanket", Material = "Polyester", Size = "Twin", StockLevel = 200, ProductionCapacity = 100, ImageUrl = "/images/products/9ee8da88-8ddc-409d-af1b-2dd2df61b7d7.jpg" },
            new Blanket { ModelName = "Cashmere Blanket", Material = "Cashmere", Size = "King", StockLevel = 25, ProductionCapacity = 15, ImageUrl = "/images/products/a61fb5e8-3497-4531-a2ad-90113d7368f7.jpg" },
            new Blanket { ModelName = "Microfiber Blanket", Material = "Microfiber", Size = "Queen", StockLevel = 180, ProductionCapacity = 120, ImageUrl = "/images/products/d3c97b5e-9a8d-4391-aaba-e01462e3e95b.jpg" },
            new Blanket { ModelName = "Bamboo Blanket", Material = "Bamboo", Size = "Queen", StockLevel = 100, ProductionCapacity = 70, ImageUrl = "/images/products/d59090da-8948-412f-84a7-3d1c42c84e6b.jpg" }
        };

        foreach (var b in initialBlankets)
        {
            var existing = context.Blankets.FirstOrDefault(x => x.ModelName == b.ModelName);
            if (existing == null)
            {
                context.Blankets.Add(b);
            }
            else
            {
                // Update image if missing
                if (string.IsNullOrEmpty(existing.ImageUrl))
                {
                    existing.ImageUrl = b.ImageUrl;
                }
            }
        }
        
        if (context.ChangeTracker.HasChanges())
        {
            context.SaveChanges();
        }

        // --- Role Seeding & Cleanup ---
        
        // CLEANUP: Remove invalid inventory records (missing blanket links)
        var invalidInv = context.Inventories.Where(i => i.BlanketId == 0).ToList();
        if (invalidInv.Any())
        {
            context.Inventories.RemoveRange(invalidInv);
            context.SaveChanges();
        }

        // Helper for hashing
        string HashPassword(string password)
        {
            using var sha256 = SHA256.Create();
            var bytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
            return Convert.ToBase64String(bytes);
        }

        // Seed Manufacturer User
        if (!context.Users.Any(u => u.Username == "manuf1"))
        {
            var user = new User
            {
                Username = "manuf1",
                Email = "manuf1@cozy.com",
                PasswordHash = HashPassword("password123"),
                Role = "Manufacturer"
            };
            context.Users.Add(user);
            context.SaveChanges();

            var manuf = new Manufacturer
            {
                UserId = user.UserId,
                Name = "Cozy Factory",
                Email = user.Email,
                ContactPerson = "Factory Manager",
                Phone = "123-456-7890",
                Location = "Industrial Zone"
            };
            context.Manufacturers.Add(manuf);
            context.SaveChanges();
            
            // Seed Manufacturer Inventory for all rugs/blankets
            var blankets = context.Blankets.ToList();
            foreach (var b in blankets)
            {
                context.Inventories.Add(new Inventory
                {
                    BlanketId = b.BlanketId,
                    OwnerId = manuf.ManufacturerId,
                    OwnerRole = "Manufacturer",
                    Quantity = 50,
                    PricePerUnit = 25.00m,
                    Location = manuf.Location,
                    LastUpdated = DateTime.UtcNow
                });
            }
            context.SaveChanges();
        }

        // Seed Distributor User
        if (!context.Users.Any(u => u.Username == "dist1"))
        {
            var user = new User
            {
                Username = "dist1",
                Email = "dist1@cozy.com",
                PasswordHash = HashPassword("password123"),
                Role = "Distributor"
            };
            context.Users.Add(user);
            context.SaveChanges();

            var dist = new Distributor
            {
                UserId = user.UserId,
                Name = "Prime Distribution",
                Email = user.Email,
                Phone = "987-654-3210",
                Address = "Warehouse District",
                ContactPerson = "John Dist"
            };
            context.Distributors.Add(dist);
            context.SaveChanges();
        }
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Error seeding database: {ex.Message}");
    }
}

try
{
    app.Run();
}
catch (Exception ex)
{
    Console.WriteLine("CRITICAL ERROR during app.Run():");
    Console.WriteLine(ex.ToString());
    if (ex.InnerException != null)
    {
        Console.WriteLine("INNER EXCEPTION:");
        Console.WriteLine(ex.InnerException.ToString());
    }
    throw;
}


