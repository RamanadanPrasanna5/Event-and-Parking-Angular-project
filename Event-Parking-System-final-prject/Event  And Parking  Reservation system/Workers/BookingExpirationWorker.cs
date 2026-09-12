using EventParking.API.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.DependencyInjection;

namespace EventParking.API.Workers
{
    public class BookingExpirationWorker : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;

        public BookingExpirationWorker(IServiceProvider serviceProvider)
        {
            _serviceProvider = serviceProvider;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                // Run this check every 1 minute
                await Task.Delay(TimeSpan.FromMinutes(1), stoppingToken);

                using var scope = _serviceProvider.CreateScope();
                var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();

                // Find all pending bookings where the time has run out
                var expiredBookings = await context.Bookings
                    .Where(b => b.Status == "Pending" && b.HoldExpiresAt <= DateTime.UtcNow)
                    .ToListAsync(stoppingToken);

                foreach (var booking in expiredBookings)
                {
                    booking.Status = "Expired";

                    // Release Seats
                    var seatsToRelease = await context.BookingSeats
                        .Include(bs => bs.Seat)
                        .Where(bs => bs.BookingId == booking.Id)
                        .ToListAsync(stoppingToken);
                    foreach (var bs in seatsToRelease) { bs.Seat!.Status = "Available"; }

                    // Release Parking
                    var parkingToRelease = await context.ParkingReservations
                        .Include(pr => pr.ParkingSlot)
                        .FirstOrDefaultAsync(pr => pr.BookingId == booking.Id, stoppingToken);
                    if (parkingToRelease != null) { parkingToRelease.ParkingSlot!.Status = "Available"; }
                }

                if (expiredBookings.Any())
                {
                    await context.SaveChangesAsync(stoppingToken);
                }
            }
        }
    }
}