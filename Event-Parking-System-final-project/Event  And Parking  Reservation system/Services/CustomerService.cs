using EventParking.API.DTOs;
using EventParking.API.Interfaces;
using static EventParking.API.DTOs.CustomerDTOs;

namespace EventParking.API.Services
{
    public class CustomerService
    {
        private readonly ICustomerRepository _customerRepository;

        public CustomerService(ICustomerRepository customerRepository)
        {
            _customerRepository = customerRepository;
        }

        public async Task<CustomerProfileDto> GetProfileAsync(int customerId)
        {
            var customer = await _customerRepository.GetByIdAsync(customerId);
            if (customer == null) throw new Exception("Customer not found");

            return new CustomerProfileDto(customer.Id, customer.Name, customer.Email, customer.Phone, customer.Status);
        }

        public async Task UpdateProfileAsync(int customerId, UpdateProfileDto dto)
        {
            var customer = await _customerRepository.GetByIdAsync(customerId);
            if (customer == null) throw new Exception("Customer not found");

            customer.Name = dto.Name;
            customer.Phone = dto.Phone;
            await _customerRepository.UpdateAsync(customer);
        }

        public async Task<IEnumerable<CustomerProfileDto>> SearchCustomersAsync(string? search)
        {
            var customers = await _customerRepository.GetCustomersAsync(search);
            return customers.Select(c => new CustomerProfileDto(c.Id, c.Name, c.Email, c.Phone, c.Status));
        }

        public async Task DeactivateCustomerAsync(int customerId)
        {
            var customer = await _customerRepository.GetByIdAsync(customerId);
            if (customer == null) throw new Exception("Customer not found");

            customer.Status = "Deactivated";
            await _customerRepository.UpdateAsync(customer);
        }

        public async Task ReactivateCustomerAsync(int customerId)
        {
            var customer = await _customerRepository.GetByIdAsync(customerId);
            if (customer == null) throw new Exception("Customer not found");

            customer.Status = "Active";
            await _customerRepository.UpdateAsync(customer);
        }
    }
}