using EventParking.API.Data;
using EventParking.API.DTOs;
using EventParking.API.Models;
using Microsoft.EntityFrameworkCore;

namespace EventParking.API.Services
{
    public class ParkingService
    {
        private readonly AppDbContext _context;

        public ParkingService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<ParkingSlotDto>> GetSlotsByEventAsync(int eventId)
        {
            return await _context.ParkingSlots
                .Where(p => p.EventId == eventId)
                .OrderBy(p => p.Zone).ThenBy(p => p.SlotNumber)
                .Select(p => new ParkingSlotDto
                {
                    Id = p.Id,
                    EventId = p.EventId,
                    Zone = p.Zone,
                    SlotNumber = p.SlotNumber,
                    Fee = p.Fee,
                    Status = p.Status
                }).ToListAsync();
        }

        public async Task GenerateLayoutAsync(int eventId, GenerateParkingLayoutDto dto)
        {
            var ev = await _context.Events.FindAsync(eventId);
            if (ev == null) throw new Exception("Event not found.");

            for (int i = 1; i <= dto.NumberOfSlots; i++)
            {
                _context.ParkingSlots.Add(new ParkingSlot
                {
                    EventId = eventId,
                    Zone = dto.Zone,
                    SlotNumber = i,
                    Fee = dto.DefaultFee,
                    Status = "Available"
                });
            }
            await _context.SaveChangesAsync();
        }

        public async Task UpdateSlotAsync(int slotId, UpdateParkingSlotDto dto)
        {
            var slot = await _context.ParkingSlots.FindAsync(slotId);
            if (slot == null) throw new Exception("Slot not found.");

            var isReserved = await _context.ParkingReservations.AnyAsync(r => r.ParkingSlotId == slotId);
            if (isReserved) throw new Exception("Cannot edit a slot that is already reserved.");

            slot.Zone = dto.Zone;
            slot.SlotNumber = dto.SlotNumber;
            slot.Fee = dto.Fee;
            await _context.SaveChangesAsync();
        }

        public async Task DeleteSlotAsync(int slotId)
        {
            var slot = await _context.ParkingSlots.FindAsync(slotId);
            if (slot == null) throw new Exception("Slot not found.");

            var isReserved = await _context.ParkingReservations.AnyAsync(r => r.ParkingSlotId == slotId);
            if (isReserved) throw new Exception("Cannot delete a slot with an active reservation.");

            _context.ParkingSlots.Remove(slot);
            await _context.SaveChangesAsync();
        }

        public async Task ReserveParkingAsync(int bookingId, int slotId)
        {
            var booking = await _context.Bookings.FindAsync(bookingId);
            if (booking == null) throw new Exception("Booking not found.");

            var hasParking = await _context.ParkingReservations.AnyAsync(r => r.BookingId == bookingId);
            if (hasParking) throw new Exception("Booking already has a parking slot. Only one slot per booking is allowed.");

            var slot = await _context.ParkingSlots.FindAsync(slotId);
            if (slot == null) throw new Exception("Parking slot not found.");
            if (slot.Status == "Reserved") throw new Exception("Slot is already reserved.");

            // Apply reservation
            slot.Status = "Reserved";
            var reservation = new ParkingReservation
            {
                BookingId = bookingId,
                ParkingSlotId = slotId,
                FeeAtReservation = slot.Fee
            };

            // Add the parking fee to the booking's total price
            booking.TotalPrice += slot.Fee;

            _context.ParkingReservations.Add(reservation);
            await _context.SaveChangesAsync();
        }

        public async Task RemoveParkingReservationAsync(int bookingId)
        {
            var reservation = await _context.ParkingReservations
                .Include(r => r.ParkingSlot)
                .Include(r => r.Booking)
                .FirstOrDefaultAsync(r => r.BookingId == bookingId);

            if (reservation == null) throw new Exception("No parking reservation found for this booking.");

            // Deduct the fixed fee from the booking total
            reservation.Booking!.TotalPrice -= reservation.FeeAtReservation;

            // Free up the slot
            reservation.ParkingSlot!.Status = "Available";

            _context.ParkingReservations.Remove(reservation);
            await _context.SaveChangesAsync();
        }
    }
}