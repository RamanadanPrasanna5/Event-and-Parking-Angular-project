export interface CreateUnifiedBookingDto {
  seatIds: number[];
  parkingSlotId?: number | null;
}

export interface BookingCreatedResponse {
  message: string;
  bookingId: number;
  bookingNumber: string;
  holdExpiresAt: string;
}

export interface HoldStatusDto {
  bookingNumber: string;
  status: 'Pending' | 'Confirmed' | 'Cancelled' | 'Expired';
  remainingSeconds: number;
}

export interface CustomerBookingDto {
  id: number;
  bookingNumber: string;
  eventName: string;
  eventDate: string;
  totalPrice: number;
  status: 'Pending' | 'Confirmed' | 'Cancelled' | 'Expired';
  seatNumbers: string[];
  parkingDetails: string;
}
