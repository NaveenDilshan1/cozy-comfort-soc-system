using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CozyComfort.API.Data;
using CozyComfort.API.Models;

namespace CozyComfort.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BlanketController : ControllerBase
    {
        private readonly CozyComfortContext _context;

        public BlanketController(CozyComfortContext context)
        {
            _context = context;
        }

        // GET: api/blanket
        [HttpGet]
        public async Task<IActionResult> GetBlankets()
        {
            try
            {
                var blankets = await _context.Blankets.ToListAsync();
                return Ok(blankets);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in GetBlankets: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                return StatusCode(500, new { error = ex.Message, details = ex.InnerException?.Message });
            }
        }

        // GET: api/blanket/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetBlanket(int id)
        {
            var blanket = await _context.Blankets.FindAsync(id);
            if (blanket == null)
            {
                return NotFound(new { message = "Blanket not found" });
            }
            return Ok(blanket);
        }

        // POST: api/blanket
        [HttpPost]
        public async Task<IActionResult> CreateBlanket([FromForm] CreateBlanketRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var blanket = new Blanket
            {
                ModelName = request.ModelName,
                Material = request.Material,
                StockLevel = request.StockLevel,
                ProductionCapacity = request.ProductionCapacity,
                Size = request.Size
            };

            if (request.ImageFile != null && request.ImageFile.Length > 0)
            {
                var uploadDir = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "images", "products");
                if (!Directory.Exists(uploadDir))
                {
                    Directory.CreateDirectory(uploadDir);
                }

                var fileName = Guid.NewGuid().ToString() + Path.GetExtension(request.ImageFile.FileName);
                var filePath = Path.Combine(uploadDir, fileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await request.ImageFile.CopyToAsync(stream);
                }

                blanket.ImageUrl = $"/images/products/{fileName}";
            }

            _context.Blankets.Add(blanket);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Blanket created successfully", blanket });
        }

        public class CreateBlanketRequest
        {
            public string ModelName { get; set; } = string.Empty;
            public string Material { get; set; } = string.Empty;
            public int StockLevel { get; set; }
            public int ProductionCapacity { get; set; }
            public string Size { get; set; } = string.Empty;
            public IFormFile? ImageFile { get; set; }
        }

        // PUT: api/blanket/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateBlanket(int id, [FromBody] Blanket blanket)
        {
            if (id != blanket.BlanketId)
            {
                return BadRequest(new { message = "ID mismatch" });
            }

            _context.Entry(blanket).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!await BlanketExists(id))
                {
                    return NotFound(new { message = "Blanket not found" });
                }
                throw;
            }

            return Ok(new { message = "Blanket updated successfully", blanket });
        }

        // DELETE: api/blanket/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteBlanket(int id)
        {
            var blanket = await _context.Blankets.FindAsync(id);
            if (blanket == null)
            {
                return NotFound(new { message = "Blanket not found" });
            }

            _context.Blankets.Remove(blanket);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Blanket deleted successfully" });
        }

        private async Task<bool> BlanketExists(int id)
        {
            return await _context.Blankets.AnyAsync(e => e.BlanketId == id);
        }
    }
}
