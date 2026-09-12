export interface CreateUnifiedBookingDto {
  seatIds: number[];
  parkingSlotId?: number | null;
  eventId?: number;
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
  eventId?: number;
  eventName: string;
  eventImage?: string;
  eventDate: string;
  eventTime?: string;
  venue?: string;
  totalPrice: number;
  status: 'Pending' | 'Confirmed' | 'Cancelled' | 'Expired';
  paymentStatus: 'Paid' | 'Pending' | 'Refunded';
  seatNumbers: string[];
  parkingDetails: string;
  parkingSlot?: string;
  customerName?: string;
  createdAt?: string;
}
