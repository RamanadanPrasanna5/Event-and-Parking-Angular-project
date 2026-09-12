namespace EventParking.API.DTOs
{
    public class GenerateSeatMapDto
    {
        public int Rows { get; set; }
        public int SeatsPerRow { get; set; }
        public decimal BasePrice { get; set; }
    }

    public class UpdateSeatAdminDto
    {
        public string Row { get; set; } = string.Empty;
        public int SeatNumber { get; set; }
        public decimal Price { get; set; }
    }

    public class CreateBookingDto
    {
        public List<int> SeatIds { get; set; } = new List<int>();
    }
}