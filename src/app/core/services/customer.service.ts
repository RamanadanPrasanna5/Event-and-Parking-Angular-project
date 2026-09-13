import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  CustomerAdminView,
  CustomerProfileDto,
  UpdateProfileDto
} from '../models/customer.models';

@Injectable({
  providedIn: 'root'
})
export class CustomerService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/customers`;

  searchCustomers(search?: string): Observable<CustomerAdminView[]> {
    let params = new HttpParams();
    if (search) {
      params = params.set('search', search);
    }
    return this.http.get<CustomerAdminView[]>(this.apiUrl, { params });
  }

  getProfile(id: number): Observable<CustomerProfileDto> {
    return this.http.get<CustomerProfileDto>(`${this.apiUrl}/${id}`);
  }

  updateProfile(id: number, dto: UpdateProfileDto): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, dto);
  }

  deactivateCustomer(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  reactivateCustomer(id: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${id}/reactivate`, {});
  }
}
