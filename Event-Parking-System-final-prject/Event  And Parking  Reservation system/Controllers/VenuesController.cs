using EventParking.API.DTOs;
using EventParking.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EventParking.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class VenuesController : ControllerBase
    {
        private readonly VenueService _venueService;

        public VenuesController(VenueService venueService)
        {
            _venueService = venueService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllVenues() => Ok(await _venueService.GetAllVenuesAsync());

        [HttpGet("{id}")]
        public async Task<IActionResult> GetVenue(int id)
        {
            var venue = await _venueService.GetVenueByIdAsync(id);
            if (venue == null) return NotFound();
            return Ok(venue);
        }

        [HttpGet("available")]
        public async Task<IActionResult> GetAvailableVenues([FromQuery] DateTime startDateTime, [FromQuery] DateTime endDateTime, [FromQuery] int? venueId)
        {
            var availableVenues = await _venueService.GetAvailableVenuesAsync(startDateTime, endDateTime, venueId);
            return Ok(availableVenues);
        }

        [Authorize(Roles = "Admin")]
        [HttpPost]
        public async Task<IActionResult> CreateVenue([FromBody] CreateVenueDto dto)
        {
            var venue = await _venueService.CreateVenueAsync(dto);
            return CreatedAtAction(nameof(GetVenue), new { id = venue.Id }, venue);
        }

        [Authorize(Roles = "Admin")]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateVenue(int id, [FromBody] CreateVenueDto dto)
        {
            try
            {
                await _venueService.UpdateVenueAsync(id, dto);
                return NoContent();
            }
            catch (Exception ex) { return BadRequest(new { Message = ex.Message }); }
        }

        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteVenue(int id)
        {
            try
            {
                await _venueService.DeleteVenueAsync(id);
                return NoContent();
            }
            catch (Exception ex) { return BadRequest(new { Message = ex.Message }); }
        }
    }
}