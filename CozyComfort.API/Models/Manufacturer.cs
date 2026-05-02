using System.ComponentModel.DataAnnotations;

namespace CozyComfort.API.Models
{
    public class Manufacturer
    {
        [Key]
        public int ManufacturerId { get; set; }
        public int UserId { get; set; } // Link to User login
        public string Name { get; set; } = string.Empty;
        public string ContactPerson { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string Location { get; set; } = string.Empty;
    }
}
