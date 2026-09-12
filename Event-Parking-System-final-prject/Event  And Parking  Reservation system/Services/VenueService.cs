using EventParking.API.Data;
using EventParking.API.DTOs;
using EventParking.API.Models;
using Microsoft.EntityFrameworkCore;

namespace EventParking.API.Services
{
    public class VenueService
    {
        private readonly AppDbContext _context;

        public VenueService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<Venue>> GetAllVenuesAsync() => await _context.Venues.ToListAsync();

        public async Task<Venue?> GetVenueByIdAsync(int id) => await _context.Venues.FindAsync(id);

        public async Task<Venue> CreateVenueAsync(CreateVenueDto dto)
        {
            var venue = new Venue { Name = dto.Name, Location = dto.Location, Capacity = dto.Capacity, IsActive = true };
            _context.Venues.Add(venue);
            await _context.SaveChangesAsync();
            return venue;
        }

        public async Task UpdateVenueAsync(int id, CreateVenueDto dto)
        {
            var venue = await _context.Venues.FindAsync(id);
            if (venue == null) throw new Exception("Venue not found.");

            venue.Name = dto.Name;
            venue.Location = dto.Location;
            venue.Capacity = dto.Capacity;
            await _context.SaveChangesAsync();
        }

        // BRD Rule: A venue cannot be deleted while it has upcoming events scheduled at it.
        public async Task DeleteVenueAsync(int id)
        {
            var venue = await _context.Venues.FindAsync(id);
            if (venue == null) throw new Exception("Venue not found.");

            var hasUpcomingEvents = await _context.Events.AnyAsync(e => e.VenueId == id && e.EventDate >= DateTime.UtcNow);
            if (hasUpcomingEvents) throw new Exception("Cannot delete a venue with upcoming events scheduled.");

            _context.Venues.Remove(venue);
            await _context.SaveChangesAsync();
        }

        // BRD Rule: Check whether a venue is free for a given date/time range.
        public async Task<List<Venue>> GetAvailableVenuesAsync(DateTime startDateTime, DateTime endDateTime, int? venueId = null)
        {
            // Find Venues that already have events overlapping this timeframe
            var bookedVenueIds = await _context.Events
                .Where(e => e.EventDate >= startDateTime && e.EventDate <= endDateTime)
                .Select(e => e.VenueId)
                .Distinct()
                .ToListAsync();

            var query = _context.Venues.Where(v => v.IsActive && !bookedVenueIds.Contains(v.Id));

            if (venueId.HasValue)
            {
                query = query.Where(v => v.Id == venueId.Value);
            }

            return await query.ToListAsync();
        }
    }
}