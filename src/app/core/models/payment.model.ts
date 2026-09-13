export interface PaymentStatusDto {
  bookingId: number;
  amountDue: number;
  paymentStatus: string;
  isPaid: boolean;
}

export interface PaymentProcessResponse {
  message: string;
  receiptNumber: string;
}

export interface PaymentHistoryDto {
  paymentId: number;
  bookingId: number;
  receiptNumber: string;
  amount: number;
  paymentDate: string;
}

export interface ReceiptDto {
  receiptNumber: string;
  customerEmail: string;
  paymentDate: string;
  totalAmountPaid: number;
  bookingReference: string;
  eventName: string;
}
