using EventParking.API.DTOs;
using EventParking.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace EventParking.API.Controllers
{
    [ApiController]
    [Authorize] // All payment routes require login
    public class PaymentsController : ControllerBase
    {
        private readonly PaymentService _paymentService;

        public PaymentsController(PaymentService paymentService)
        {
            _paymentService = paymentService;
        }

        // GET /api/bookings/{id}/payment
        [HttpGet("api/bookings/{id}/payment")]
        public async Task<IActionResult> GetPaymentStatus(int id)
        {
            try
            {
                var status = await _paymentService.GetPaymentStatusAsync(id);
                return Ok(status);
            }
            catch (Exception ex) { return NotFound(new { Message = ex.Message }); }
        }

        // POST /api/bookings/{id}/payment
        [HttpPost("api/bookings/{id}/payment")]
        public async Task<IActionResult> ProcessPayment(int id)
        {
            var email = User.FindFirstValue(ClaimTypes.Email) ?? "unknown";
            try
            {
                var payment = await _paymentService.ProcessPaymentAsync(id, email);
                return Ok(new { Message = "Payment completed successfully.", ReceiptNumber = payment.ReceiptNumber });
            }
            catch (Exception ex) { return BadRequest(new { Message = ex.Message }); }
        }

        // GET /api/payments/customer/{customerId}
        // Note: Using the authenticated token email instead of a URL param ID for tighter security
        [HttpGet("api/payments/customer")]
        public async Task<IActionResult> GetCustomerPayments()
        {
            var email = User.FindFirstValue(ClaimTypes.Email) ?? "unknown";
            var history = await _paymentService.GetPaymentHistoryAsync(email);
            return Ok(history);
        }

        // GET /api/payments/{id}/receipt
        [HttpGet("api/payments/{id}/receipt")]
        public async Task<IActionResult> DownloadReceipt(int id)
        {
            var email = User.FindFirstValue(ClaimTypes.Email) ?? "unknown";
            try
            {
                var receipt = await _paymentService.GetReceiptAsync(id, email);
                return Ok(receipt); // The frontend can format this JSON into a downloadable PDF/HTML page
            }
            catch (Exception ex) { return BadRequest(new { Message = ex.Message }); }
        }
    }
}