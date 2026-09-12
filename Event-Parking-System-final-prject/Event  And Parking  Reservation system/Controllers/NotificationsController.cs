using EventParking.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using System.IdentityModel.Tokens.Jwt;

namespace EventParking.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize] // Locks down all endpoints to authenticated users
    public class NotificationsController : ControllerBase
    {
        private readonly NotificationService _notificationService;

        public NotificationsController(NotificationService notificationService)
        {
            _notificationService = notificationService;
        }

        [HttpGet("customer/{customerId}")]
        public async Task<IActionResult> GetNotifications(int customerId)
        {
            // Security Check: Extract the logged-in user's ID from their JWT token
            var loggedInUserId = int.Parse(User.FindFirstValue(JwtRegisteredClaimNames.Sub) ?? User.FindFirstValue(ClaimTypes.NameIdentifier)!);

            // Reject the request if they are trying to view someone else's notifications
            if (loggedInUserId != customerId) return Forbid();

            var notifications = await _notificationService.GetCustomerNotificationsAsync(customerId);
            return Ok(notifications);
        }

        [HttpPut("{id}/read")]
        public async Task<IActionResult> MarkAsRead(int id)
        {
            try
            {
                var loggedInUserId = int.Parse(User.FindFirstValue(JwtRegisteredClaimNames.Sub) ?? User.FindFirstValue(ClaimTypes.NameIdentifier)!);
                await _notificationService.MarkAsReadAsync(id, loggedInUserId);
                return NoContent();
            }
            catch (Exception ex) { return BadRequest(new { Message = ex.Message }); }
        }
    }
}