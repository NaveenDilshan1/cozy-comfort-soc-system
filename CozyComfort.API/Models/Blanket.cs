namespace CozyComfort.API.Models
{
    public class Blanket
    {
        public int BlanketId { get; set; }
        public string ModelName { get; set; } = string.Empty;
        public string Material { get; set; } = string.Empty;
        public int StockLevel { get; set; }
        public int ProductionCapacity { get; set; }
        public string Size { get; set; } = string.Empty;
        public string? ImageUrl { get; set; }
    }
}
