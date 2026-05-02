using System.ComponentModel.DataAnnotations;

namespace CozyComfort.API.Models
{
    public class Notification
    {
        [Key]
        public int NotificationId { get; set; }
        public int UserId { get; set; } // The user receiving the notification
        public string Message { get; set; } = string.Empty;
        public bool IsRead { get; set; } = false;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public string Type { get; set; } = "Info"; // Order, Alert, Info
    }
}
