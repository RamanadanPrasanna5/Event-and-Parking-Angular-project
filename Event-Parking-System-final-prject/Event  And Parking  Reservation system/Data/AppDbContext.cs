using EventParking.API.Models;
using Microsoft.EntityFrameworkCore;

namespace EventParking.API.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<Customer> Customers { get; set; }
        // NEW TABLES FOR MODULE 2 & 3
        public DbSet<Venue> Venues { get; set; }
        public DbSet<EventCategory> EventCategories { get; set; }
        public DbSet<Event> Events { get; set; }
        // public DbSet<Booking> Bookings { get; set; } // Will be added by the Bookings team member

        public DbSet<Seat> Seats { get; set; }
        public DbSet<Booking> Bookings { get; set; }
        public DbSet<BookingSeat> BookingSeats { get; set; }
        public DbSet<ParkingSlot> ParkingSlots { get; set; }
        public DbSet<ParkingReservation> ParkingReservations { get; set; }
        public DbSet<Payment> Payments { get; set; }
        public DbSet<Notification> Notifications { get; set; }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Ensure Event correctly links to Venue and Category
            modelBuilder.Entity<Event>()
                .HasOne(e => e.Venue)
                .WithMany()
                .HasForeignKey(e => e.VenueId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Event>()
                .HasOne(e => e.Category)
                .WithMany()
                .HasForeignKey(e => e.CategoryId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Seat>()
                 .HasOne(s => s.Event)
                 .WithMany()
                 .HasForeignKey(s => s.EventId)
                 .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Seat>()
                .Property(s => s.Price)
                .HasPrecision(18, 2);

            modelBuilder.Entity<BookingSeat>()
                .HasKey(bs => new { bs.BookingId, bs.SeatId }); // Composite primary key

            modelBuilder.Entity<BookingSeat>()
                .HasOne(bs => bs.Booking)
                .WithMany()
                .HasForeignKey(bs => bs.BookingId);

            modelBuilder.Entity<BookingSeat>()
                .HasOne(bs => bs.Seat)
                .WithMany()
                .HasForeignKey(bs => bs.SeatId)
                .OnDelete(DeleteBehavior.Restrict); // Prevents deleting a seat that is booked
            // Configure Booking decimal precision
            modelBuilder.Entity<Booking>()
                .Property(b => b.TotalPrice)
                .HasPrecision(18, 2);
            // Fix decimal warnings for fees
            modelBuilder.Entity<ParkingSlot>()
                .Property(p => p.Fee)
                .HasPrecision(18, 2);

            modelBuilder.Entity<ParkingReservation>()
                .Property(p => p.FeeAtReservation)
                .HasPrecision(18, 2);

            // BRD Rule: A parking slot cannot be deleted once it has an active reservation
            modelBuilder.Entity<ParkingReservation>()
                .HasOne(pr => pr.ParkingSlot)
                .WithMany()
                .HasForeignKey(pr => pr.ParkingSlotId)
                .OnDelete(DeleteBehavior.Restrict);

            // BRD Rule: One parking slot can only be reserved by one customer (One-to-One enforcement)
            modelBuilder.Entity<ParkingReservation>()
                .HasIndex(pr => pr.BookingId)
                .IsUnique();
            // Inside OnModelCreating, add this configuration block:
            modelBuilder.Entity<Payment>()
                .Property(p => p.Amount)
                .HasPrecision(18, 2);

            // BRD Rule: A payment cannot be recorded twice for the same booking (One-to-One rule)
            modelBuilder.Entity<Payment>()
                .HasIndex(p => p.BookingId)
                .IsUnique();
        }
    }
}
