using System;
using System.Linq;
using Microsoft.EntityFrameworkCore;
using CozyComfort.API.Data;
using CozyComfort.API.Models;

namespace CozyComfort.ConsoleDebug
{
    class Program
    {
        static void Main(string[] args)
        {
            var optionsBuilder = new DbContextOptionsBuilder<CozyComfortContext>();
            // Using the connection string from appsettings.json (assuming default localdb or similar)
            optionsBuilder.UseSqlServer("Server=localhost;Database=CozyComfortDb;Trusted_Connection=True;TrustServerCertificate=True;MultipleActiveResultSets=true");

            using (var context = new CozyComfortContext(optionsBuilder.Options))
            {
                try {
                    Console.WriteLine("Attempting to connect to database...");
                    if (context.Database.CanConnect()) {
                        Console.WriteLine("Successfully connected to database.");
                        
                        Console.WriteLine("Querying Blankets table...");
                        var blankets = context.Blankets.ToList();
                        Console.WriteLine($"Found {blankets.Count} blankets.");
                        foreach(var b in blankets) {
                            Console.WriteLine($" - {b.ModelName} ({b.Material})");
                        }
                    } else {
                        Console.WriteLine("Cannot connect to database.");
                    }
                } catch (Exception ex) {
                    Console.WriteLine($"Error: {ex.Message}");
                    Console.WriteLine(ex.StackTrace);
                }
            }
        }
    }
}
