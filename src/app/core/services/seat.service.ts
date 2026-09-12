import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { GenerateSeatMapDto, SeatDto, UpdateSeatAdminDto } from '../models/seat.model';

@Injectable({
  providedIn: 'root'
})
export class SeatService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/events`;

  getSeats(eventId: number): Observable<SeatDto[]> {
    return this.http.get<SeatDto[]>(`${this.apiUrl}/${eventId}/seats`);
  }

  generateSeats(eventId: number, dto: GenerateSeatMapDto): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/${eventId}/seats`, dto);
  }

  updateSeat(eventId: number, seatId: number, dto: UpdateSeatAdminDto): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${eventId}/seats/${seatId}`, dto);
  }

  deleteSeat(eventId: number, seatId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${eventId}/seats/${seatId}`);
  }
}
