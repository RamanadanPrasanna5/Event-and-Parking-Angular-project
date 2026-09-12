using EventParking.API.Data;
using EventParking.API.DTOs;
using EventParking.API.Models;
using Microsoft.EntityFrameworkCore;

namespace EventParking.API.Services
{
    public class NotificationService
    {
        private readonly AppDbContext _context;

        public NotificationService(AppDbContext context)
        {
            _context = context;
        }

        // BRD Rule: Internal use only. Call this from BookingService/PaymentService.
        public async Task CreateNotificationAsync(int customerId, string message)
        {
            var notification = new Notification
            {
                CustomerId = customerId,
                Message = message,
                IsRead = false,
                CreatedAt = DateTime.UtcNow
            };

            _context.Notifications.Add(notification);
            await _context.SaveChangesAsync();
        }

        public async Task<List<NotificationDto>> GetCustomerNotificationsAsync(int customerId)
        {
            return await _context.Notifications
                .Where(n => n.CustomerId == customerId)
                .OrderByDescending(n => n.CreatedAt) // BRD Rule: Newest first
                .Select(n => new NotificationDto
                {
                    Id = n.Id,
                    CustomerId = n.CustomerId,
                    Message = n.Message,
                    IsRead = n.IsRead,
                    CreatedAt = n.CreatedAt
                }).ToListAsync();
        }

        public async Task MarkAsReadAsync(int notificationId, int customerId)
        {
            var notification = await _context.Notifications.FindAsync(notificationId);
            if (notification == null) throw new Exception("Notification not found.");

            // Security: Ensure the user owns this notification before modifying it
            if (notification.CustomerId != customerId)
                throw new Exception("Unauthorized access to notification.");

            notification.IsRead = true;
            await _context.SaveChangesAsync();
        }
    }
}