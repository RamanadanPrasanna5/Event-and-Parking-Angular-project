using EventParking.API.Data;
using EventParking.API.Interfaces;
using EventParking.API.Models;
using Microsoft.EntityFrameworkCore;

namespace EventParking.API.Repositories
{
    public class CustomerRepository : ICustomerRepository
    {
        private readonly AppDbContext _context;

        public CustomerRepository(AppDbContext context)
        {
            _context = context;
        }
        public async Task<IEnumerable<Customer>> GetCustomersAsync(string? search)
        {
            var query = _context.Customers.AsQueryable();

            if (!string.IsNullOrWhiteSpace(search))
            {
                query = query.Where(c => c.Name.Contains(search) || c.Email.Contains(search));
            }

            return await query.ToListAsync();
        }

        public async Task<Customer?> GetByIdAsync(int id) =>
            await _context.Customers.FindAsync(id);

        public async Task<Customer?> GetByEmailAsync(string email) =>
            await _context.Customers.FirstOrDefaultAsync(c => c.Email == email);

        public async Task<Customer?> GetByVerificationTokenAsync(string token) =>
            await _context.Customers.FirstOrDefaultAsync(c => c.EmailVerificationToken == token);

        public async Task<Customer?> GetByResetTokenAsync(string token) =>
            await _context.Customers.FirstOrDefaultAsync(c => c.PasswordResetToken == token);

        public async Task AddAsync(Customer customer)
        {
            await _context.Customers.AddAsync(customer);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(Customer customer)
        {
            customer.UpdatedAt = DateTime.UtcNow;
            _context.Customers.Update(customer);
            await _context.SaveChangesAsync();
        }
    }
}
