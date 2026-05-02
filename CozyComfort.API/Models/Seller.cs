namespace CozyComfort.API.Models
{
    public class Seller
    {
        public int SellerId { get; set; }
        public int UserId { get; set; } // Link to User login
        public string Name { get; set; } = string.Empty;
        public string ContactPerson { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string Location { get; set; } = string.Empty;
    }
}
