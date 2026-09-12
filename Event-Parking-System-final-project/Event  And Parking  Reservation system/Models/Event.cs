using EventParking.API.Models;

namespace EventParking.API.Models
{
    public class Event
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;

        public DateTime EventDate { get; set; } // Acts as StartTime
        public DateTime EndTime { get; set; }   // NEW: Needed for overlap checks
        public int Capacity { get; set; }       // NEW: Needed for venue/seat validation

        // Foreign Keys
        public int VenueId { get; set; }
        public Venue? Venue { get; set; }

        public int CategoryId { get; set; }
        public EventCategory? Category { get; set; }

        public string Status { get; set; } = "Scheduled";
        public string ImageUrl { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}