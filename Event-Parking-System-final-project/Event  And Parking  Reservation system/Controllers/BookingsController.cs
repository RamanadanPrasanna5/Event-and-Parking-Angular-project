using EventParking.API.DTOs;
using EventParking.API.Services;
using EventParking.API.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Microsoft.EntityFrameworkCore;

namespace EventParking.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BookingsController : ControllerBase
    {
        private readonly BookingService _bookingService;
        private readonly AppDbContext _context;

        public BookingsController(BookingService bookingService, AppDbContext context)
        {
            _bookingService = bookingService;
            _context = context;
        }

        [Authorize]
        [HttpPost]
        public async Task<IActionResult> CreateBooking([FromBody] CreateUnifiedBookingDto dto)
        {
            var email = User.FindFirstValue(ClaimTypes.Email) ?? "unknown";
            try
            {
                var booking = await _bookingService.CreateBookingAsync(email, dto);
                return Ok(new { Message = "Booking created. Seats are on hold pending payment.", BookingId = booking.Id, BookingNumber = booking.BookingNumber, HoldExpiresAt = booking.HoldExpiresAt });
            }
            catch (Exception ex) { return BadRequest(new { Message = ex.Message }); }
        }

        [HttpGet("{id}/hold-status")]
        public async Task<IActionResult> GetHoldStatus(int id)
        {
            var booking = await _context.Bookings.FindAsync(id);
            if (booking == null) return NotFound();

            double remainingSeconds = (booking.HoldExpiresAt - DateTime.UtcNow).TotalSeconds;
            return Ok(new HoldStatusDto
            {
                BookingNumber = booking.BookingNumber,
                Status = booking.Status,
                RemainingSeconds = remainingSeconds > 0 ? remainingSeconds : 0
            });
        }

        [Authorize]
        [HttpDelete("{id}")]
        public async Task<IActionResult> CancelBooking(int id)
        {
            var email = User.FindFirstValue(ClaimTypes.Email) ?? "unknown";
            var isAdmin = User.IsInRole("Admin");

            try
            {
                await _bookingService.CancelBookingAsync(id, email, isAdmin);
                return Ok(new { Message = "Booking cancelled successfully." });
            }
            catch (Exception ex) { return BadRequest(new { Message = ex.Message }); }
        }

        [Authorize]
        [HttpGet("my-bookings")]
        public async Task<IActionResult> GetMyBookings()
        {
            var email = User.FindFirstValue(ClaimTypes.Email) ?? "unknown";
            try
            {
                var bookings = await _bookingService.GetCustomerBookingsAsync(email);
                return Ok(bookings);
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }


    }
}