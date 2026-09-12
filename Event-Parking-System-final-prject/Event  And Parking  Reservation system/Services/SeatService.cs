using EventParking.API.Data;
using EventParking.API.DTOs;
using EventParking.API.Models;
using Microsoft.EntityFrameworkCore;

namespace EventParking.API.Services
{
    public class SeatService
    {
        private readonly AppDbContext _context;

        public SeatService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<SeatDto>> GetSeatsByEventAsync(int eventId)
        {
            return await _context.Seats
                .Where(s => s.EventId == eventId)
                .OrderBy(s => s.Row).ThenBy(s => s.SeatNumber)
                .Select(s => new SeatDto
                {
                    Id = s.Id,
                    EventId = s.EventId,
                    Row = s.Row,
                    SeatNumber = s.SeatNumber,
                    Status = s.Status,
                    Price = s.Price
                }).ToListAsync();
        }

        // Admin: Generate Map (Enforces Capacity Rule)
        public async Task GenerateSeatMapAsync(int eventId, GenerateSeatMapDto dto)
        {
            var ev = await _context.Events.Include(e => e.Venue).FirstOrDefaultAsync(e => e.Id == eventId);
            if (ev == null) throw new Exception("Event not found.");

            int totalRequestedSeats = dto.Rows * dto.SeatsPerRow;
            if (totalRequestedSeats != ev.Venue!.Capacity)
            {
                throw new Exception($"Seat map count ({totalRequestedSeats}) must exactly match Venue Capacity ({ev.Venue.Capacity}).");
            }

            var existingSeats = await _context.Seats.AnyAsync(s => s.EventId == eventId);
            if (existingSeats) throw new Exception("Seat map already exists for this event.");

            char currentRow = 'A';
            for (int r = 0; r < dto.Rows; r++)
            {
                for (int s = 1; s <= dto.SeatsPerRow; s++)
                {
                    _context.Seats.Add(new Seat
                    {
                        EventId = eventId,
                        Row = currentRow.ToString(),
                        SeatNumber = s,
                        Status = "Available",
                        Price = dto.BasePrice
                    });
                }
                currentRow++;
            }
            await _context.SaveChangesAsync();
        }

        // Admin: Edit Seat
        public async Task UpdateSeatAdminAsync(int seatId, UpdateSeatAdminDto dto)
        {
            var seat = await _context.Seats.FindAsync(seatId);
            if (seat == null) throw new Exception("Seat not found.");

            var isBooked = await _context.BookingSeats.AnyAsync(bs => bs.SeatId == seatId);
            if (isBooked) throw new Exception("Cannot edit a seat that is already booked.");

            seat.Row = dto.Row;
            seat.SeatNumber = dto.SeatNumber;
            seat.Price = dto.Price;
            await _context.SaveChangesAsync();
        }

        // Admin: Delete Seat
        public async Task DeleteSeatAsync(int seatId)
        {
            var seat = await _context.Seats.FindAsync(seatId);
            if (seat == null) throw new Exception("Seat not found.");

            var isBooked = await _context.BookingSeats.AnyAsync(bs => bs.SeatId == seatId);
            if (isBooked) throw new Exception("Cannot delete a seat that has an active booking.");

            _context.Seats.Remove(seat);
            await _context.SaveChangesAsync();
        }
    }
}