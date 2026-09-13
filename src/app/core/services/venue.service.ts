import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CreateVenueDto, Venue } from '../models/venue.models';

@Injectable({
  providedIn: 'root'
})
export class VenueService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/venues`;

  getVenues(): Observable<Venue[]> {
    return this.http.get<Venue[]>(this.apiUrl);
  }

  getVenueById(id: number): Observable<Venue> {
    return this.http.get<Venue>(`${this.apiUrl}/${id}`);
  }

  getAvailableVenues(startDateTime: string, endDateTime: string, venueId?: number): Observable<Venue[]> {
    let params = new HttpParams()
      .set('startDateTime', startDateTime)
      .set('endDateTime', endDateTime);

    if (venueId) {
      params = params.set('venueId', venueId.toString());
    }

    return this.http.get<Venue[]>(`${this.apiUrl}/available`, { params });
  }

  createVenue(dto: CreateVenueDto): Observable<Venue> {
    return this.http.post<Venue>(this.apiUrl, dto);
  }

  updateVenue(id: number, dto: CreateVenueDto): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, dto);
  }

  deleteVenue(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
