using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CozyComfort.API.Data;
using CozyComfort.API.Models;

namespace CozyComfort.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ManufacturerController : ControllerBase
    {
        private readonly CozyComfortContext _context;

        public ManufacturerController(CozyComfortContext context)
        {
            _context = context;
        }

        // GET: api/manufacturer
        [HttpGet]
        public async Task<IActionResult> GetManufacturers()
        {
            var manufacturers = await _context.Manufacturers.ToListAsync();
            return Ok(manufacturers);
        }

        // GET: api/manufacturer/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetManufacturer(int id)
        {
            var manufacturer = await _context.Manufacturers.FindAsync(id);
            if (manufacturer == null)
            {
                return NotFound(new { message = "Manufacturer not found" });
            }
            return Ok(manufacturer);
        }

        // POST: api/manufacturer
        [HttpPost]
        public async Task<IActionResult> AddManufacturer([FromBody] Manufacturer manufacturer)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            _context.Manufacturers.Add(manufacturer);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Manufacturer added successfully", manufacturer });
        }

        // PUT: api/manufacturer/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateManufacturer(int id, [FromBody] Manufacturer manufacturer)
        {
            if (id != manufacturer.ManufacturerId)
            {
                return BadRequest(new { message = "ID mismatch" });
            }

            _context.Entry(manufacturer).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!await ManufacturerExists(id))
                {
                    return NotFound(new { message = "Manufacturer not found" });
                }
                throw;
            }

            return Ok(new { message = "Manufacturer updated successfully", manufacturer });
        }

        // DELETE: api/manufacturer/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteManufacturer(int id)
        {
            var manufacturer = await _context.Manufacturers.FindAsync(id);
            if (manufacturer == null)
            {
                return NotFound(new { message = "Manufacturer not found" });
            }

            _context.Manufacturers.Remove(manufacturer);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Manufacturer deleted successfully" });
        }

        private async Task<bool> ManufacturerExists(int id)
        {
            return await _context.Manufacturers.AnyAsync(e => e.ManufacturerId == id);
        }
    }
}
