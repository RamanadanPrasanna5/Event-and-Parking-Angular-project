import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CreateEventDto, EventDto } from '../models/event.models';

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/events`;

  getEvents(filters?: {
    search?: string;
    date?: string;
    venueId?: number;
    categoryId?: number;
  }): Observable<EventDto[]> {
    let params = new HttpParams();

    if (filters?.search) {
      params = params.set('search', filters.search);
    }
    if (filters?.date) {
      params = params.set('date', filters.date);
    }
    if (filters?.venueId) {
      params = params.set('venueId', filters.venueId.toString());
    }
    if (filters?.categoryId) {
      params = params.set('categoryId', filters.categoryId.toString());
    }

    return this.http.get<EventDto[]>(this.apiUrl, { params });
  }

  getEventById(id: number): Observable<EventDto> {
    return this.http.get<EventDto>(`${this.apiUrl}/${id}`);
  }

  createEvent(dto: CreateEventDto): Observable<EventDto> {
    return this.http.post<EventDto>(this.apiUrl, dto);
  }

  updateEvent(id: number, dto: CreateEventDto): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, dto);
  }

  deleteEvent(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
