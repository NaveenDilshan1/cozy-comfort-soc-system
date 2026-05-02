using Microsoft.EntityFrameworkCore;
using CozyComfort.API.Models;

namespace CozyComfort.API.Data
{
    public class CozyComfortContext : DbContext
    {
        public CozyComfortContext(DbContextOptions<CozyComfortContext> options) : base(options)
        {
        }

        public DbSet<Blanket> Blankets { get; set; }
        public DbSet<Distributor> Distributors { get; set; }
        public DbSet<Seller> Sellers { get; set; }
        public DbSet<Order> Orders { get; set; }
        public DbSet<Inventory> Inventories { get; set; }
        public DbSet<Notification> Notifications { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<Manufacturer> Manufacturers { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            
            // Configure entity properties if needed
            modelBuilder.Entity<Blanket>()
                .HasKey(b => b.BlanketId);
            
            modelBuilder.Entity<Distributor>()
                .HasKey(d => d.DistributorId);
            
            modelBuilder.Entity<Seller>()
                .HasKey(s => s.SellerId);
            
            modelBuilder.Entity<Order>()
                .HasKey(o => o.OrderId);

            modelBuilder.Entity<Order>()
                .Property(o => o.TotalPrice)
                .HasPrecision(18, 2);
            
            modelBuilder.Entity<Inventory>()
                .HasKey(i => i.InventoryId);

            modelBuilder.Entity<Inventory>()
                .Property(i => i.PricePerUnit)
                .HasPrecision(18, 2);

            modelBuilder.Entity<Manufacturer>()
                .HasKey(m => m.ManufacturerId);
        }
    }
}
