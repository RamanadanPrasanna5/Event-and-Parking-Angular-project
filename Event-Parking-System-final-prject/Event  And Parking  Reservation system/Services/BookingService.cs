using EventParking.API.Data;
using EventParking.API.DTOs;
using EventParking.API.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace EventParking.API.Services
{
    public class BookingService
    {
        private readonly AppDbContext _context;
        private readonly int _holdDurationMinutes;

        public BookingService(AppDbContext context, IConfiguration config)
        {
            _context = context;
            _holdDurationMinutes = config.GetValue<int>("BookingSettings:HoldDurationMinutes", 15);
        }

        public async Task<Booking> CreateBookingAsync(string customerEmail, CreateUnifiedBookingDto dto)
        {
            if (!dto.SeatIds.Any()) throw new Exception("A booking must contain at least one seat.");

            // Start a database transaction to ensure seats and parking succeed or fail together
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                // 1. Validate and Lock Seats
                var seats = await _context.Seats.Where(s => dto.SeatIds.Contains(s.Id)).ToListAsync();
                if (seats.Count != dto.SeatIds.Count) throw new Exception("Some seats were not found.");
                if (seats.Any(s => s.Status != "Available")) throw new Exception("One or more seats are no longer available.");

                decimal totalPrice = seats.Sum(s => s.Price);

                // 2. Validate and Lock Parking (if requested)
                ParkingSlot? parkingSlot = null;
                if (dto.ParkingSlotId.HasValue)
                {
                    parkingSlot = await _context.ParkingSlots.FindAsync(dto.ParkingSlotId.Value);
                    if (parkingSlot == null || parkingSlot.Status != "Available")
                        throw new Exception("The selected parking slot is no longer available.");

                    totalPrice += parkingSlot.Fee;
                }

                // 3. Create the Booking Record
                var booking = new Booking
                {
                    BookingNumber = $"BKG-{DateTime.UtcNow.Year}-{Guid.NewGuid().ToString().Substring(0, 6).ToUpper()}",
                    CustomerEmail = customerEmail,
                    TotalPrice = totalPrice,
                    Status = "Pending",
                    HoldExpiresAt = DateTime.UtcNow.AddMinutes(_holdDurationMinutes)
                };
                _context.Bookings.Add(booking);
                await _context.SaveChangesAsync(); // Save to get the BookingId

                // 4. Attach Seats
                foreach (var seat in seats)
                {
                    seat.Status = "Booked"; // Temporary hold
                    _context.BookingSeats.Add(new BookingSeat { BookingId = booking.Id, SeatId = seat.Id });
                }

                // 5. Attach Parking
                if (parkingSlot != null)
                {
                    parkingSlot.Status = "Reserved"; // Temporary hold
                    _context.ParkingReservations.Add(new ParkingReservation
                    {
                        BookingId = booking.Id,
                        ParkingSlotId = parkingSlot.Id,
                        FeeAtReservation = parkingSlot.Fee
                    });
                }

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return booking;
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        // BRD: Cancel booking (frees seats and parking)
        public async Task CancelBookingAsync(int bookingId, string requestedByEmail, bool isAdmin = false)
        {
            var booking = await _context.Bookings.FindAsync(bookingId);
            if (booking == null) throw new Exception("Booking not found.");

            if (!isAdmin && booking.CustomerEmail != requestedByEmail)
                throw new Exception("You do not have permission to cancel this booking.");

            if (booking.Status == "Cancelled" || booking.Status == "Expired")
                throw new Exception("Booking is already inactive.");

            booking.Status = "Cancelled";

            // Free Seats
            var bookingSeats = await _context.BookingSeats.Include(bs => bs.Seat).Where(bs => bs.BookingId == bookingId).ToListAsync();
            foreach (var bs in bookingSeats) { bs.Seat!.Status = "Available"; }

            // Free Parking
            var parkingRes = await _context.ParkingReservations.Include(pr => pr.ParkingSlot).FirstOrDefaultAsync(pr => pr.BookingId == bookingId);
            if (parkingRes != null) { parkingRes.ParkingSlot!.Status = "Available"; }

            await _context.SaveChangesAsync();
        }

        // Bonus method to simulate successful payment to lock it in!
        public async Task ConfirmPaymentAsync(int bookingId)
        {
            var booking = await _context.Bookings.FindAsync(bookingId);
            if (booking == null || booking.Status != "Pending") throw new Exception("Invalid booking for payment.");

            if (DateTime.UtcNow > booking.HoldExpiresAt) throw new Exception("Hold period expired. Please create a new booking.");

            booking.Status = "Confirmed";
            await _context.SaveChangesAsync();
        }
        public async Task<List<CustomerBookingDto>> GetCustomerBookingsAsync(string customerEmail)
        {
            var bookings = await _context.Bookings
                .Where(b => b.CustomerEmail == customerEmail)
                .OrderByDescending(b => b.BookingDate)
                .Select(b => new CustomerBookingDto
                {
                    Id = b.Id,
                    BookingNumber = b.BookingNumber,
                    TotalPrice = b.TotalPrice,
                    Status = b.Status,
                    // Grab the event name and date from the first seat (if any exist)
                    EventName = _context.BookingSeats.Where(bs => bs.BookingId == b.Id).Select(bs => bs.Seat!.Event!.Title).FirstOrDefault() ?? "Unknown",
                    EventDate = _context.BookingSeats.Where(bs => bs.BookingId == b.Id).Select(bs => bs.Seat!.Event!.EventDate).FirstOrDefault(),

                    SeatNumbers = _context.BookingSeats.Where(bs => bs.BookingId == b.Id).Select(bs => bs.Seat!.SeatNumber.ToString()).ToList(),

                    ParkingDetails = _context.ParkingReservations
                        .Where(pr => pr.BookingId == b.Id)
                        .Select(pr => "Zone " + pr.ParkingSlot!.Zone + " - Slot " + pr.ParkingSlot.SlotNumber)
                        .FirstOrDefault() ?? "None"
                })
                .ToListAsync();

            return bookings;
        }
    }
}