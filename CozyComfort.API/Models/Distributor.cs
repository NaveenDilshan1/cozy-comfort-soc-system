namespace CozyComfort.API.Models
{
    public class Distributor
    {
        public int DistributorId { get; set; }
        public int UserId { get; set; } // Link to User login
        public string Name { get; set; } = string.Empty;
        public string ContactPerson { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
    }
}
