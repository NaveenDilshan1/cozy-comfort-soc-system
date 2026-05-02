namespace CozyComfort.API.Models
{
    public class Inventory
    {
        public int InventoryId { get; set; }
        public int BlanketId { get; set; }
        public string Location { get; set; } = string.Empty;
        public int Quantity { get; set; }
        public DateTime LastUpdated { get; set; }

        // New fields for role-based inventory
        public int OwnerId { get; set; } // ID of the User, Seller, Distributor, or Manufacturer
        public string OwnerRole { get; set; } = string.Empty; // "Seller", "Distributor", "Manufacturer"
        public decimal PricePerUnit { get; set; }
    }
}
