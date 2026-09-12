using EventParking.API.Data;
using EventParking.API.DTOs;
using EventParking.API.Models;
using EventParking.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace EventParking.API.Controllers
{
    [ApiController]
    public class SeatsController : ControllerBase
    {
        private readonly SeatService _seatService;
        private readonly AppDbContext _context;

        public SeatsController(SeatService seatService, AppDbContext context)
        {
            _seatService = seatService;
            _context = context;
        }

        // 1. GET /api/events/{eventId}/seats
        [HttpGet("api/events/{eventId}/seats")]
        public async Task<IActionResult> GetSeats(int eventId)
        {
            var seats = await _seatService.GetSeatsByEventAsync(eventId);
            return Ok(seats);
        }

        // 2. POST /api/events/{eventId}/seats (Admin Generate)
        [Authorize(Roles = "Admin")]
        [HttpPost("api/events/{eventId}/seats")]
        public async Task<IActionResult> GenerateSeats(int eventId, [FromBody] GenerateSeatMapDto dto)
        {
            try
            {
                await _seatService.GenerateSeatMapAsync(eventId, dto);
                return Ok(new { Message = "Seat map successfully generated." });
            }
            catch (Exception ex) { return BadRequest(new { Message = ex.Message }); }
        }

        // 3. PUT /api/events/{eventId}/seats/{seatId} (Admin Edit)
        [Authorize(Roles = "Admin")]
        [HttpPut("api/events/{eventId}/seats/{seatId}")]
        public async Task<IActionResult> EditSeat(int eventId, int seatId, [FromBody] UpdateSeatAdminDto dto)
        {
            try
            {
                await _seatService.UpdateSeatAdminAsync(seatId, dto);
                return NoContent();
            }
            catch (Exception ex) { return BadRequest(new { Message = ex.Message }); }
        }

        // 4. DELETE /api/events/{eventId}/seats/{seatId} (Admin Delete)
        [Authorize(Roles = "Admin")]
        [HttpDelete("api/events/{eventId}/seats/{seatId}")]
        public async Task<IActionResult> DeleteSeat(int eventId, int seatId)
        {
            try
            {
                await _seatService.DeleteSeatAsync(seatId);
                return NoContent();
            }
            catch (Exception ex) { return BadRequest(new { Message = ex.Message }); }
        }


    }
}