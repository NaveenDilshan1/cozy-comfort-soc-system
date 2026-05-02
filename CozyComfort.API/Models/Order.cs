namespace CozyComfort.API.Models
{
    public class Order
    {
        public int OrderId { get; set; }
        public int BlanketId { get; set; }
        public int Quantity { get; set; }
        public DateTime OrderDate { get; set; }
        public string Status { get; set; } = "Pending"; // Pending, Processing, Ready, Delivered
        public string CustomerName { get; set; } = string.Empty;

        // New fields for role-based tracking
        public int UserId { get; set; } // The User (Customer, Seller, Distributor) placing the order
        public int? SupplierId { get; set; } // The ID of the supplier (Seller, Distributor, Manufacturer)
        public string OrderType { get; set; } = "Customer"; // Customer, SellerToDistributor, DistributorToManufacturer
        public decimal TotalPrice { get; set; }
    }
}
