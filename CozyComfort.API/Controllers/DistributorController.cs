using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CozyComfort.API.Data;
using CozyComfort.API.Models;

namespace CozyComfort.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DistributorController : ControllerBase
    {
        private readonly CozyComfortContext _context;

        public DistributorController(CozyComfortContext context)
        {
            _context = context;
        }

        // GET: api/distributor
        [HttpGet]
        public async Task<IActionResult> GetDistributors()
        {
            var distributors = await _context.Distributors.ToListAsync();
            return Ok(distributors);
        }

        // GET: api/distributor/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetDistributor(int id)
        {
            var distributor = await _context.Distributors.FindAsync(id);
            if (distributor == null)
            {
                return NotFound(new { message = "Distributor not found" });
            }
            return Ok(distributor);
        }

        // POST: api/distributor
        [HttpPost]
        public async Task<IActionResult> AddDistributor([FromBody] Distributor distributor)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            _context.Distributors.Add(distributor);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Distributor added successfully", distributor });
        }

        // PUT: api/distributor/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateDistributor(int id, [FromBody] Distributor distributor)
        {
            if (id != distributor.DistributorId)
            {
                return BadRequest(new { message = "ID mismatch" });
            }

            _context.Entry(distributor).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!await DistributorExists(id))
                {
                    return NotFound(new { message = "Distributor not found" });
                }
                throw;
            }

            return Ok(new { message = "Distributor updated successfully", distributor });
        }

        // DELETE: api/distributor/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteDistributor(int id)
        {
            var distributor = await _context.Distributors.FindAsync(id);
            if (distributor == null)
            {
                return NotFound(new { message = "Distributor not found" });
            }

            _context.Distributors.Remove(distributor);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Distributor deleted successfully" });
        }

        private async Task<bool> DistributorExists(int id)
        {
            return await _context.Distributors.AnyAsync(e => e.DistributorId == id);
        }
    }
}
