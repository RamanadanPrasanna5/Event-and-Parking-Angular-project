using EventParking.API.Data;
using EventParking.API.DTOs;
using Microsoft.EntityFrameworkCore;

namespace EventParking.API.Services
{
    public class DashboardService
    {
        private readonly AppDbContext _context;

        public DashboardService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<DashboardMetricsDto> GetMetricsAsync()
        {
            return new DashboardMetricsDto
            {
                TotalEvents = await _context.Events.CountAsync(),

                TotalBookings = await _context.Bookings.CountAsync(),

                // System-wide available seats
                AvailableSeats = await _context.Seats.CountAsync(s => s.Status == "Available"),

                // Occupied parking slots
                OccupiedParkingSlots = await _context.ParkingSlots.CountAsync(p => p.Status == "Reserved"),

                // Total revenue collected (calculates from the new Payments table safely)
                TotalRevenue = await _context.Payments.SumAsync(p => (decimal?)p.Amount) ?? 0,

                // For Total Customers: We count unique emails that have made a booking. 
                // Once Module 1 (Customer Management) is fully complete, you can swap this to: await _context.Customers.CountAsync()
                TotalCustomers = await _context.Bookings.Select(b => b.CustomerEmail).Distinct().CountAsync()
            };
        }
    }
}