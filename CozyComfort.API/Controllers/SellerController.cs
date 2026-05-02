using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CozyComfort.API.Data;
using CozyComfort.API.Models;

namespace CozyComfort.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SellerController : ControllerBase
    {
        private readonly CozyComfortContext _context;

        public SellerController(CozyComfortContext context)
        {
            _context = context;
        }

        // GET: api/seller
        [HttpGet]
        public async Task<IActionResult> GetSellers()
        {
            var sellers = await _context.Sellers.ToListAsync();
            return Ok(sellers);
        }

        // GET: api/seller/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetSeller(int id)
        {
            var seller = await _context.Sellers.FindAsync(id);
            if (seller == null)
            {
                return NotFound(new { message = "Seller not found" });
            }
            return Ok(seller);
        }

        // POST: api/seller
        [HttpPost]
        public async Task<IActionResult> AddSeller([FromBody] Seller seller)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            _context.Sellers.Add(seller);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Seller added successfully", seller });
        }

        // PUT: api/seller/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateSeller(int id, [FromBody] Seller seller)
        {
            if (id != seller.SellerId)
            {
                return BadRequest(new { message = "ID mismatch" });
            }

            _context.Entry(seller).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!await SellerExists(id))
                {
                    return NotFound(new { message = "Seller not found" });
                }
                throw;
            }

            return Ok(new { message = "Seller updated successfully", seller });
        }

        // DELETE: api/seller/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteSeller(int id)
        {
            var seller = await _context.Sellers.FindAsync(id);
            if (seller == null)
            {
                return NotFound(new { message = "Seller not found" });
            }

            _context.Sellers.Remove(seller);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Seller deleted successfully" });
        }

        private async Task<bool> SellerExists(int id)
        {
            return await _context.Sellers.AnyAsync(e => e.SellerId == id);
        }
    }
}
