using EventParking.API.DTOs;
using EventParking.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using static EventParking.API.DTOs.CustomerDTOs;

namespace EventParking.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize] // Requires you to be logged in
    public class CustomersController : ControllerBase
    {
        private readonly CustomerService _customerService;

        public CustomersController(CustomerService customerService)
        {
            _customerService = customerService;
        }

        [Authorize]
        [HttpGet]
        public async Task<IActionResult> SearchCustomers([FromQuery] string? search)
        {
            var customers = await _customerService.SearchCustomersAsync(search);
            return Ok(customers);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetProfile(int id)
        {
            try { return Ok(await _customerService.GetProfileAsync(id)); }
            catch (Exception ex) { return NotFound(new { Message = ex.Message }); }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateProfile(int id, [FromBody] UpdateProfileDto dto)
        {
            try { await _customerService.UpdateProfileAsync(id, dto); return NoContent(); }
            catch (Exception ex) { return BadRequest(new { Message = ex.Message }); }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeactivateCustomer(int id)
        {
            try { await _customerService.DeactivateCustomerAsync(id); return NoContent(); }
            catch (Exception ex) { return BadRequest(new { Message = ex.Message }); }
        }

        [HttpPost("{id}/reactivate")]
        public async Task<IActionResult> ReactivateCustomer(int id)
        {
            try { await _customerService.ReactivateCustomerAsync(id); return NoContent(); }
            catch (Exception ex) { return BadRequest(new { Message = ex.Message }); }
        }
    }
}