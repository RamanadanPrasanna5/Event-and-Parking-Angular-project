using EventParking.API.Data;
using EventParking.API.DTOs;
using EventParking.API.Models;
using Microsoft.EntityFrameworkCore;

namespace EventParking.API.Services
{
    public class EventService
    {
        private readonly AppDbContext _context;

        public EventService(AppDbContext context)
        {
            _context = context;
        }

        // 1. UPDATE THIS METHOD TO ACCEPT FILTERS
        public async Task<List<EventDto>> GetAllEventsAsync(string? search, DateTime? date, int? venueId, int? categoryId)
        {
            var query = _context.Events
                .Include(e => e.Venue)
                .Include(e => e.Category)
                .AsQueryable();

            // Apply Filters dynamically
            if (!string.IsNullOrWhiteSpace(search))
            {
                query = query.Where(e => e.Title.Contains(search) || e.Description.Contains(search));
            }
            if (date.HasValue)
            {
                query = query.Where(e => e.EventDate.Date == date.Value.Date);
            }
            if (venueId.HasValue)
            {
                query = query.Where(e => e.VenueId == venueId.Value);
            }
            if (categoryId.HasValue)
            {
                query = query.Where(e => e.CategoryId == categoryId.Value);
            }

            return await query.Select(e => new EventDto
            {
                Id = e.Id,
                Title = e.Title,
                Description = e.Description,
                EventDate = e.EventDate,
                EndTime = e.EndTime,
                Capacity = e.Capacity,
                VenueName = e.Venue!.Name,
                CategoryName = e.Category!.Name,
                Status = e.Status,
                ImageUrl = e.ImageUrl
            }).ToListAsync();
        }

        public async Task<EventDto?> GetEventByIdAsync(int id)
        {
            var e = await _context.Events
                .Include(ev => ev.Venue)
                .Include(ev => ev.Category)
                .FirstOrDefaultAsync(ev => ev.Id == id);

            if (e == null) return null;

            return new EventDto
            {
                Id = e.Id,
                Title = e.Title,
                Description = e.Description,
                EventDate = e.EventDate,
                EndTime = e.EndTime,
                Capacity = e.Capacity,
                VenueName = e.Venue!.Name,
                CategoryName = e.Category!.Name,
                Status = e.Status,
                ImageUrl = e.ImageUrl
            };
        }

        public async Task<Event> CreateEventAsync(CreateEventDto dto)
        {
            await ValidateEventRulesAsync(dto);

            var newEvent = new Event
            {
                Title = dto.Title,
                Description = dto.Description,
                EventDate = dto.EventDate,
                EndTime = dto.EndTime,
                Capacity = dto.Capacity,
                VenueId = dto.VenueId,
                CategoryId = dto.CategoryId,
                ImageUrl = dto.ImageUrl,
                Status = "Scheduled"
            };

            _context.Events.Add(newEvent);
            await _context.SaveChangesAsync();
            return newEvent;
        }

        // 2. UPDATE THIS METHOD TO ADD THE BOOKING SAFEGUARD
        public async Task UpdateEventAsync(int id, CreateEventDto dto)
        {
            var existingEvent = await _context.Events.FindAsync(id);
            if (existingEvent == null) throw new Exception("Event not found.");

            // BRD Rule: Event details (which impact pricing/seatmaps) shouldn't change after bookings exist
            var hasActiveBookings = await _context.Seats.AnyAsync(s => s.EventId == id && s.Status == "Booked");
            if (hasActiveBookings)
            {
                throw new Exception("Cannot edit an event that already has active bookings. Please cancel bookings first.");
            }

            await ValidateEventRulesAsync(dto, id);

            existingEvent.Title = dto.Title;
            existingEvent.Description = dto.Description;
            existingEvent.EventDate = dto.EventDate;
            existingEvent.EndTime = dto.EndTime;
            existingEvent.Capacity = dto.Capacity;
            existingEvent.VenueId = dto.VenueId;
            existingEvent.CategoryId = dto.CategoryId;
            existingEvent.ImageUrl = dto.ImageUrl;

            await _context.SaveChangesAsync();
        }
        public async Task DeleteEventAsync(int id)
        {
            var existingEvent = await _context.Events.FindAsync(id);
            if (existingEvent == null) throw new Exception("Event not found.");

            // BRD Rule: Cannot delete an event with active bookings
            var hasBookings = await _context.Seats.AnyAsync(s => s.EventId == id && s.Status == "Booked");
            if (hasBookings)
            {
                throw new Exception("Cannot delete an event that has active bookings.");
            }

            _context.Events.Remove(existingEvent);
            await _context.SaveChangesAsync();
        }

        // Shared validation logic for Create and Update
        private async Task ValidateEventRulesAsync(CreateEventDto dto, int? excludeEventId = null)
        {
            var venue = await _context.Venues.FindAsync(dto.VenueId);
            if (venue == null) throw new Exception("Venue not found.");

            // BRD Rule: Capacity cannot exceed Venue Capacity
            if (dto.Capacity > venue.Capacity)
            {
                throw new Exception($"Event capacity ({dto.Capacity}) cannot exceed venue capacity ({venue.Capacity}).");
            }

            // BRD Rule: Validate Venue Overlap
            var overlappingEventQuery = _context.Events.Where(e =>
                e.VenueId == dto.VenueId &&
                e.EventDate < dto.EndTime &&
                e.EndTime > dto.EventDate);

            if (excludeEventId.HasValue)
            {
                overlappingEventQuery = overlappingEventQuery.Where(e => e.Id != excludeEventId.Value);
            }

            if (await overlappingEventQuery.AnyAsync())
            {
                throw new Exception("The selected venue is already booked for an overlapping time period.");
            }
        }
    }
}