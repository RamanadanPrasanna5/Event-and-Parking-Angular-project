export interface SeatDto {
  id: number;
  eventId: number;
  row: string;
  seatNumber: number;
  status: 'Available' | 'Booked';
  price: number;
}

export interface GenerateSeatMapDto {
  rows: number;
  seatsPerRow: number;
  basePrice: number;
}

export interface UpdateSeatAdminDto {
  row: string;
  seatNumber: number;
  price: number;
}

export interface SelectedSeat extends SeatDto {
  selected?: boolean;
}
