using EventParking.API.Data;
using EventParking.API.DTOs;
using EventParking.API.Models;
using Microsoft.EntityFrameworkCore;

namespace EventParking.API.Services
{
    public class PaymentService
    {
        private readonly AppDbContext _context;
        private readonly NotificationService _notificationService; // Add this!

        // Update your constructor to accept it
        public PaymentService(AppDbContext context, NotificationService notificationService)
        {
            _context = context;
            _notificationService = notificationService;
        }

        public async Task<PaymentStatusDto> GetPaymentStatusAsync(int bookingId)
        {
            var booking = await _context.Bookings.FindAsync(bookingId);
            if (booking == null) throw new Exception("Booking not found.");

            var isPaid = await _context.Payments.AnyAsync(p => p.BookingId == bookingId);

            return new PaymentStatusDto
            {
                BookingId = booking.Id,
                AmountDue = booking.TotalPrice,
                PaymentStatus = isPaid ? "Paid" : "Pending",
                IsPaid = isPaid
            };
        }

        public async Task<Payment> ProcessPaymentAsync(int bookingId, string customerEmail)
        {
            var booking = await _context.Bookings.FindAsync(bookingId);
            if (booking == null) throw new Exception("Booking not found.");

            if (booking.CustomerEmail != customerEmail)
                throw new Exception("You do not have permission to pay for this booking.");

            if (booking.Status == "Expired" || booking.Status == "Cancelled")
                throw new Exception("Cannot process payment for an inactive booking. Please create a new booking.");

            var alreadyPaid = await _context.Payments.AnyAsync(p => p.BookingId == bookingId);
            if (alreadyPaid) throw new Exception("Payment has already been recorded for this booking.");

            // Create the payment record
            var payment = new Payment
            {
                BookingId = booking.Id,
                CustomerEmail = customerEmail,
                Amount = booking.TotalPrice,
                ReceiptNumber = $"RCPT-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString().Substring(0, 6).ToUpper()}"
            };

            _context.Payments.Add(payment);

            // BRD Rule: Mark booking as Confirmed once payment is completed
            booking.Status = "Confirmed";
            var customer = await _context.Customers.FirstOrDefaultAsync(c => c.Email == customerEmail);
            if (customer != null)
            {
                await _notificationService.CreateNotificationAsync(
                    customer.Id,
                    $"Payment successful! Your booking (Ref: {booking.Id}) has been confirmed. Receipt: {payment.ReceiptNumber}"
                );
            }
            await _context.SaveChangesAsync();
            return payment;

        }

        public async Task<List<PaymentHistoryDto>> GetPaymentHistoryAsync(string customerEmail)
        {
            return await _context.Payments
                .Where(p => p.CustomerEmail == customerEmail)
                .OrderByDescending(p => p.PaymentDate)
                .Select(p => new PaymentHistoryDto
                {
                    PaymentId = p.Id,
                    BookingId = p.BookingId,
                    ReceiptNumber = p.ReceiptNumber,
                    Amount = p.Amount,
                    PaymentDate = p.PaymentDate
                }).ToListAsync();
        }

        public async Task<ReceiptDto> GetReceiptAsync(int paymentId, string customerEmail)
        {
            var payment = await _context.Payments
                .Include(p => p.Booking)
                .FirstOrDefaultAsync(p => p.Id == paymentId);

            if (payment == null) throw new Exception("Payment not found.");
            if (payment.CustomerEmail != customerEmail) throw new Exception("Unauthorized access to receipt.");

            // Need the event name, so we fetch the first seat attached to this booking
            var bookingSeat = await _context.BookingSeats
                .Include(bs => bs.Seat)
                .ThenInclude(s => s!.Event)
                .FirstOrDefaultAsync(bs => bs.BookingId == payment.BookingId);

            string eventName = bookingSeat?.Seat?.Event?.Title ?? "Unknown Event";

            return new ReceiptDto
            {
                ReceiptNumber = payment.ReceiptNumber,
                CustomerEmail = payment.CustomerEmail,
                PaymentDate = payment.PaymentDate,
                TotalAmountPaid = payment.Amount,
                BookingReference = payment.Booking!.BookingNumber,
                EventName = eventName
            };
        }
    }
}