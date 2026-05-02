using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CozyComfort.API.Data;
using CozyComfort.API.Models;

namespace CozyComfort.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class InventoryController : ControllerBase
    {
        private readonly CozyComfortContext _context;

        public InventoryController(CozyComfortContext context)
        {
            _context = context;
        }

        // GET: api/inventory
        [HttpGet]
        public async Task<IActionResult> GetAllInventory()
        {
            var inventory = await _context.Inventories.ToListAsync();
            return Ok(inventory);
        }

        // GET: api/inventory/{role}/{ownerId}
        [HttpGet("{role}/{ownerId:int}")]
        public async Task<IActionResult> GetInventoryByRole(string role, int ownerId)
        {
            var inventory = await _context.Inventories
                .Where(i => i.OwnerRole == role && i.OwnerId == ownerId)
                .ToListAsync();
            return Ok(inventory);
        }

        // GET: api/inventory/role/{role}
        [HttpGet("by-role/{role}")]
        public async Task<IActionResult> GetInventoryByRoleOnly(string role)
        {
            var inventory = await _context.Inventories
                .Where(i => i.OwnerRole == role)
                .ToListAsync();
            return Ok(inventory);
        }

        // POST: api/inventory/update
        [HttpPost("update")]
        public async Task<IActionResult> UpdateInventory([FromBody] Inventory inventoryUpdate)
        {
            var inventory = await _context.Inventories
                .FirstOrDefaultAsync(i => i.BlanketId == inventoryUpdate.BlanketId 
                                       && i.OwnerRole == inventoryUpdate.OwnerRole 
                                       && i.OwnerId == inventoryUpdate.OwnerId);

            if (inventory == null)
            {
                // Create new inventory record if it doesn't exist
                inventory = new Inventory
                {
                    BlanketId = inventoryUpdate.BlanketId,
                    OwnerRole = inventoryUpdate.OwnerRole,
                    OwnerId = inventoryUpdate.OwnerId,
                    Quantity = inventoryUpdate.Quantity,
                    PricePerUnit = inventoryUpdate.PricePerUnit,
                    Location = inventoryUpdate.Location,
                    LastUpdated = DateTime.UtcNow
                };
                _context.Inventories.Add(inventory);
            }
            else
            {
                // Update existing
                inventory.Quantity = inventoryUpdate.Quantity; // Full update or delta? Assuming full update for now
                if(inventoryUpdate.PricePerUnit > 0) inventory.PricePerUnit = inventoryUpdate.PricePerUnit;
                inventory.LastUpdated = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();
            return Ok(new { message = "Inventory updated successfully", inventory });
        }
        
        // POST: api/inventory/restock
        [HttpPost("restock")]
        public async Task<IActionResult> RestockInventory([FromBody] Inventory inventoryUpdate)
        {
             var inventory = await _context.Inventories
                .FirstOrDefaultAsync(i => i.BlanketId == inventoryUpdate.BlanketId 
                                       && i.OwnerRole == inventoryUpdate.OwnerRole 
                                       && i.OwnerId == inventoryUpdate.OwnerId);
            
            if (inventory == null)
            {
                 inventory = new Inventory
                {
                    BlanketId = inventoryUpdate.BlanketId,
                    OwnerRole = inventoryUpdate.OwnerRole,
                    OwnerId = inventoryUpdate.OwnerId,
                    Quantity = inventoryUpdate.Quantity,
                     PricePerUnit = inventoryUpdate.PricePerUnit,
                    Location = inventoryUpdate.Location,
                    LastUpdated = DateTime.UtcNow
                };
                _context.Inventories.Add(inventory);
            }
            else 
            {
                inventory.Quantity += inventoryUpdate.Quantity;
                inventory.LastUpdated = DateTime.UtcNow;
            }
            
            await _context.SaveChangesAsync();
            return Ok(new { message = "Stock added successfully", inventory });
        }
    }
}
