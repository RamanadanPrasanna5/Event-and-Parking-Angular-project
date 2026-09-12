import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CustomerAdminView, CustomerProfileDto, UpdateProfileDto } from '../models/customer.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class CustomerService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private apiUrl = `${environment.apiUrl}/api/customers`;

  getProfile(id?: number): Observable<CustomerProfileDto> {
    const targetId = id ?? this.authService.getCustomerId() ?? 0;
    return this.http.get<CustomerProfileDto>(`${this.apiUrl}/${targetId}`);
  }

  updateProfile(id: number, dto: UpdateProfileDto): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, dto);
  }

  searchCustomers(search?: string): Observable<CustomerAdminView[]> {
    let params = new HttpParams();
    if (search && search.trim()) {
      params = params.set('search', search.trim());
    }
    return this.http.get<CustomerAdminView[]>(this.apiUrl, { params });
  }

  deactivateCustomer(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  reactivateCustomer(id: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${id}/reactivate`, {});
  }
}
