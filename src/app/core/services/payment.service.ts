import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  PaymentHistoryDto,
  PaymentProcessResponse,
  PaymentStatusDto,
  ReceiptDto
} from '../models/payment.model';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api`;

  getPaymentStatus(bookingId: number): Observable<PaymentStatusDto> {
    return this.http.get<PaymentStatusDto>(`${this.apiUrl}/bookings/${bookingId}/payment`);
  }

  processPayment(bookingId: number): Observable<PaymentProcessResponse> {
    return this.http.post<any>(`${this.apiUrl}/bookings/${bookingId}/payment`, {}).pipe(
      map((res) => ({
        message: res.Message || res.message || 'Payment completed successfully.',
        receiptNumber: res.ReceiptNumber || res.receiptNumber || ''
      }))
    );
  }

  getCustomerPayments(): Observable<PaymentHistoryDto[]> {
    return this.http.get<PaymentHistoryDto[]>(`${this.apiUrl}/payments/customer`);
  }

  getReceipt(paymentId: number): Observable<ReceiptDto> {
    return this.http.get<ReceiptDto>(`${this.apiUrl}/payments/${paymentId}/receipt`);
  }
}
