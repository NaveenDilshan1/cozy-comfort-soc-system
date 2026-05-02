using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CozyComfort.API.Data;
using CozyComfort.API.Models;

namespace CozyComfort.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class OrderController : ControllerBase
    {
        private readonly CozyComfortContext _context;

        public OrderController(CozyComfortContext context)
        {
            _context = context;
        }

        // GET: api/order
        [HttpGet]
        public async Task<IActionResult> GetOrders([FromQuery] int? userId, [FromQuery] int? supplierId, [FromQuery] string? role, [FromQuery] string? type)
        {
            Console.WriteLine($"GetOrders request: userId={userId}, supplierId={supplierId}, role={role}, type={type}");
            var query = _context.Orders.AsQueryable();
            Console.WriteLine($"Initial count: {await query.CountAsync()}");

            if (userId.HasValue)
            {
                query = query.Where(o => o.UserId == userId.Value);
                Console.WriteLine($"After userId filter ({userId}): {await query.CountAsync()}");
            }

            // If "type" is "incoming", we want orders WHERE I am the supplier
            if (type == "incoming" && supplierId.HasValue)
            {
                Console.WriteLine($"Filtering for incoming orders: supplierId={supplierId.Value}");
                query = query.Where(o => o.SupplierId == supplierId.Value);
                Console.WriteLine($"After incoming supplierId filter: {await query.CountAsync()}");
                
                if (!string.IsNullOrEmpty(role))
                {
                    Console.WriteLine($"Applying role-based order type filter: role={role}");
                    if (role == "Manufacturer")
                    {
                        query = query.Where(o => o.OrderType == "DistributorToManufacturer");
                    }
                    else if (role == "Distributor")
                    {
                        query = query.Where(o => o.OrderType == "SellerToDistributor");
                    }
                    else if (role == "Seller")
                    {
                        query = query.Where(o => o.OrderType == "Customer");
                    }
                    Console.WriteLine($"After role/type filter: {await query.CountAsync()}");
                }
            }
            else if (supplierId.HasValue)
            {
                 Console.WriteLine($"Filtering by supplierId only: {supplierId.Value}");
                 query = query.Where(o => o.SupplierId == supplierId.Value);
                 Console.WriteLine($"After supplierId filter: {await query.CountAsync()}");
            }

            var orders = await query.OrderByDescending(o => o.OrderDate).ToListAsync();
            Console.WriteLine($"Final count: {orders.Count}");
            return Ok(orders);
        }

        // GET: api/order/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetOrder(int id)
        {
            var order = await _context.Orders.FindAsync(id);
            if (order == null)
            {
                return NotFound(new { message = "Order not found" });
            }
            return Ok(order);
        }

        // POST: api/order
        [HttpPost]
        public async Task<IActionResult> CreateOrder([FromBody] Order order)
        {
            Console.WriteLine($"=== CreateOrder called ===");
            Console.WriteLine($"  BlanketId={order.BlanketId}, Qty={order.Quantity}, SupplierId={order.SupplierId}, UserId={order.UserId}");
            Console.WriteLine($"  OrderType={order.OrderType}, Status={order.Status}, TotalPrice={order.TotalPrice}");
            
            if (!ModelState.IsValid)
            {
                Console.WriteLine($"  ModelState invalid: {string.Join(", ", ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage))}");
                return BadRequest(ModelState);
            }

            // Validation: Check if stock exists
             int? supplierOwnerId = order.SupplierId;
            string supplierRole = order.OrderType switch
            {
                "DistributorToManufacturer" => "Manufacturer",
                "SellerToDistributor" => "Distributor",
                "Customer" => "Seller",
                _ => ""
            };
            Console.WriteLine($"  Resolved supplierRole={supplierRole}, supplierOwnerId={supplierOwnerId}");

            if (supplierOwnerId.HasValue && !string.IsNullOrEmpty(supplierRole))
            {
                 var supplierInv = await _context.Inventories
                    .FirstOrDefaultAsync(i => i.OwnerId == supplierOwnerId.Value && i.OwnerRole == supplierRole && i.BlanketId == order.BlanketId);
                
                 Console.WriteLine($"  SupplierInventory found: {supplierInv != null}, Qty={supplierInv?.Quantity}");
                 
                 if (supplierInv == null || supplierInv.Quantity < order.Quantity)
                 {
                     Console.WriteLine($"  REJECTED: Insufficient stock from supplier.");
                     return BadRequest(new { message = "Insufficient stock from supplier." });
                 }
                 
                 // Capture price at time of order
                 order.TotalPrice = order.Quantity * supplierInv.PricePerUnit;
            }

            order.OrderDate = DateTime.UtcNow;
            order.Status = "Pending";
            _context.Orders.Add(order);
            await _context.SaveChangesAsync();
            Console.WriteLine($"  Order created: OrderId={order.OrderId}, SupplierId={order.SupplierId}");

            // Notifications logic
            int? notificationTargetUserId = null;
            string msg = $"New order #{order.OrderId} for {order.Quantity} units.";

            if (supplierRole == "Manufacturer" && order.SupplierId.HasValue)
            {
                var manuf = await _context.Manufacturers.FindAsync(order.SupplierId.Value);
                if (manuf != null) notificationTargetUserId = manuf.UserId;
            }
            else if (supplierRole == "Distributor" && order.SupplierId.HasValue)
            {
                var dist = await _context.Distributors.FindAsync(order.SupplierId.Value);
                if (dist != null) notificationTargetUserId = dist.UserId;
            }
            else if (supplierRole == "Seller" && order.SupplierId.HasValue)
            {
                var seller = await _context.Sellers.FindAsync(order.SupplierId.Value);
                if (seller != null) notificationTargetUserId = seller.UserId;
            }

            if (notificationTargetUserId.HasValue)
            {
                _context.Notifications.Add(new Notification
                {
                    UserId = notificationTargetUserId.Value,
                    Message = msg,
                    Type = "Order",
                    CreatedAt = DateTime.UtcNow
                });
                await _context.SaveChangesAsync();
            }

            return Ok(new { message = "Order created successfully", order });
        }

        // PUT: api/order/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateOrder(int id, [FromBody] Order order)
        {
            if (id != order.OrderId)
            {
                return BadRequest(new { message = "ID mismatch" });
            }

            _context.Entry(order).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!await OrderExists(id))
                {
                    return NotFound(new { message = "Order not found" });
                }
                throw;
            }

            return Ok(new { message = "Order updated successfully", order });
        }
        
        // PUT: api/order/{id}/status
        [HttpPut("{id}/status")]
        public async Task<IActionResult> UpdateOrderStatus(int id, [FromBody] UpdateStatusRequest request)
        {
             var order = await _context.Orders.FindAsync(id);
             if (order == null)
             {
                 return NotFound(new { message = "Order not found" });
             }
             
             // Only allow status change
             order.Status = request.Status;

             if (request.Status == "Completed" || request.Status == "Delivered")
             {
                await TransferStock(order);
             }

             // Notify the buyer
             _context.Notifications.Add(new Notification
             {
                 UserId = order.UserId,
                 Message = $"Your order #{order.OrderId} status is now {request.Status}.",
                 Type = "Order",
                 CreatedAt = DateTime.UtcNow
             });

             await _context.SaveChangesAsync();
             return Ok(new { message = "Order status updated", status = request.Status });
        }

        private async Task TransferStock(Order order)
        {
            // 1. Deduct from Supplier
            int? supplierOwnerId = order.SupplierId;
            string supplierRole = order.OrderType switch
            {
                "DistributorToManufacturer" => "Manufacturer",
                "SellerToDistributor" => "Distributor",
                "Customer" => "Seller",
                _ => ""
            };
            
            decimal unitPrice = 0;

            if (supplierOwnerId.HasValue && !string.IsNullOrEmpty(supplierRole))
            {
                var supplierInv = await _context.Inventories
                    .FirstOrDefaultAsync(i => i.OwnerId == supplierOwnerId.Value && i.OwnerRole == supplierRole && i.BlanketId == order.BlanketId);
                
                if (supplierInv != null)
                {
                    supplierInv.Quantity -= order.Quantity;
                    if (supplierInv.Quantity < 0) supplierInv.Quantity = 0; // Prevent negative
                    unitPrice = supplierInv.PricePerUnit;
                    _context.Entry(supplierInv).State = EntityState.Modified;
                }
            }

            // 2. Add to Buyer (Distributor or Seller) - Customers don't have Inventory in this table
            int? buyerOwnerId = null;
            string buyerRole = "";
            string buyerLocation = "Warehouse"; // Default

            if (order.OrderType == "DistributorToManufacturer")
            {
                buyerRole = "Distributor";
                var dist = await _context.Distributors.FirstOrDefaultAsync(d => d.UserId == order.UserId);
                if (dist != null) 
                {
                    buyerOwnerId = dist.DistributorId;
                    buyerLocation = dist.Address;
                }
            }
            else if (order.OrderType == "SellerToDistributor")
            {
                buyerRole = "Seller";
                var seller = await _context.Sellers.FirstOrDefaultAsync(s => s.UserId == order.UserId);
                if (seller != null) 
                {
                    buyerOwnerId = seller.SellerId;
                    buyerLocation = seller.Location;
                }
            }

            if (buyerOwnerId.HasValue)
            {
                var buyerInv = await _context.Inventories
                    .FirstOrDefaultAsync(i => i.OwnerId == buyerOwnerId.Value && i.OwnerRole == buyerRole && i.BlanketId == order.BlanketId);
                
                if (buyerInv == null)
                {
                    buyerInv = new Inventory
                    {
                        BlanketId = order.BlanketId,
                        OwnerId = buyerOwnerId.Value,
                        OwnerRole = buyerRole,
                        Quantity = 0,
                        Location = buyerLocation,
                        LastUpdated = DateTime.UtcNow,
                        PricePerUnit = unitPrice * 1.2m // Default markup 20%? Or keep same? Let's keep 0 or same for now.
                    };
                    // Ideally price is set by the user later, but give it a base value
                    if (buyerInv.PricePerUnit == 0) buyerInv.PricePerUnit = unitPrice;

                    _context.Inventories.Add(buyerInv);
                }
                else 
                {
                    buyerInv.Quantity += order.Quantity;
                    buyerInv.LastUpdated = DateTime.UtcNow;
                    _context.Entry(buyerInv).State = EntityState.Modified;
                }
            }
        }

        // DELETE: api/order/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteOrder(int id)
        {
            var order = await _context.Orders.FindAsync(id);
            if (order == null)
            {
                return NotFound(new { message = "Order not found" });
            }

            _context.Orders.Remove(order);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Order deleted successfully" });
        }

        private async Task<bool> OrderExists(int id)
        {
            return await _context.Orders.AnyAsync(e => e.OrderId == id);
        }
    }

    public class UpdateStatusRequest
    {
        public string Status { get; set; } = string.Empty;
    }
}
