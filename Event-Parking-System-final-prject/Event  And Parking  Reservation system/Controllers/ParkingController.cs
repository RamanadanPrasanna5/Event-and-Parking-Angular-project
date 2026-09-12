using EventParking.API.DTOs;
using EventParking.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace EventParking.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ParkingController : ControllerBase
    {
        private readonly ParkingService _parkingService;

        public ParkingController(ParkingService parkingService)
        {
            _parkingService = parkingService;
        }

        [HttpGet("/api/events/{eventId}/parking-slots")]
        public async Task<IActionResult> GetParkingSlots(int eventId)
        {
            var slots = await _parkingService.GetSlotsByEventAsync(eventId);
            return Ok(slots);
        }

        [Authorize(Roles = "Admin")]
        [HttpPost("/api/events/{eventId}/parking-slots")]
        public async Task<IActionResult> GenerateParkingLayout(int eventId, [FromBody] GenerateParkingLayoutDto dto)
        {
            try
            {
                await _parkingService.GenerateLayoutAsync(eventId, dto);
                return Ok(new { Message = "Parking layout generated successfully." });
            }
            catch (Exception ex) { return BadRequest(new { Message = ex.Message }); }
        }

        [Authorize(Roles = "Admin")]
        [HttpPut("/api/events/{eventId}/parking-slots/{slotId}")]
        public async Task<IActionResult> UpdateSlot(int slotId, [FromBody] UpdateParkingSlotDto dto)
        {
            try
            {
                await _parkingService.UpdateSlotAsync(slotId, dto);
                return NoContent();
            }
            catch (Exception ex) { return BadRequest(new { Message = ex.Message }); }
        }

        [Authorize(Roles = "Admin")]
        [HttpDelete("/api/events/{eventId}/parking-slots/{slotId}")]
        public async Task<IActionResult> DeleteSlot(int slotId)
        {
            try
            {
                await _parkingService.DeleteSlotAsync(slotId);
                return NoContent();
            }
            catch (Exception ex) { return BadRequest(new { Message = ex.Message }); }
        }

        [Authorize]
        [HttpPost("/api/bookings/{bookingId}/parking")]
        public async Task<IActionResult> ReserveParking(int bookingId, [FromBody] ReserveParkingDto dto)
        {
            try
            {
                await _parkingService.ReserveParkingAsync(bookingId, dto.ParkingSlotId);
                return Ok(new { Message = "Parking slot successfully added to booking." });
            }
            catch (Exception ex) { return BadRequest(new { Message = ex.Message }); }
        }

        [Authorize]
        [HttpDelete("/api/bookings/{bookingId}/parking")]
        public async Task<IActionResult> RemoveParking(int bookingId)
        {
            try
            {
                await _parkingService.RemoveParkingReservationAsync(bookingId);
                return NoContent();
            }
            catch (Exception ex) { return BadRequest(new { Message = ex.Message }); }
        }
    }
}
