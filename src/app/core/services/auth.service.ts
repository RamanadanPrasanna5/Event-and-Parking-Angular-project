import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import {
  AuthResponseDto,
  CurrentUser,
  DecodedToken,
  ForgotPasswordDto,
  LoginDto,
  RegisterDto,
  ResendVerificationDto,
  ResetPasswordDto
} from '../models/auth.models';

const TOKEN_KEY = 'eventro_jwt_token';
const CUSTOMER_ID_KEY = 'eventro_customer_id';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private apiUrl = `${environment.apiUrl}/api/auth`;

  private currentUserSignal = signal<CurrentUser | null>(this.loadUserFromStorage());

  public readonly currentUser = this.currentUserSignal.asReadonly();
  public readonly isLoggedIn = computed(() => !!this.currentUserSignal());
  public readonly isAdmin = computed(() => this.currentUserSignal()?.role === 'Admin');

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  getCustomerId(): number | null {
    const idStr = localStorage.getItem(CUSTOMER_ID_KEY);
    return idStr ? parseInt(idStr, 10) : null;
  }

  register(dto: RegisterDto): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/register`, dto);
  }

  login(dto: LoginDto): Observable<AuthResponseDto> {
    return this.http.post<AuthResponseDto>(`${this.apiUrl}/login`, dto).pipe(
      tap(response => {
        if (response && response.token) {
          localStorage.setItem(TOKEN_KEY, response.token);
          if (response.customerId) {
            localStorage.setItem(CUSTOMER_ID_KEY, response.customerId);
          }
          const user = this.decodeToken(response.token, response.customerId);
          this.currentUserSignal.set(user);
        }
      })
    );
  }

  verifyEmail(token: string): Observable<{ message: string }> {
    return this.http.get<{ message: string }>(`${this.apiUrl}/verify-email`, {
      params: { token }
    });
  }

  forgotPassword(dto: ForgotPasswordDto): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/forgot-password`, dto);
  }

  resetPassword(dto: ResetPasswordDto): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/reset-password`, dto);
  }

  resendVerification(dto: ResendVerificationDto): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/resend-verification`, dto);
  }

  logout(redirectUrl: string = '/login'): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(CUSTOMER_ID_KEY);
    this.currentUserSignal.set(null);
    this.router.navigate([redirectUrl]);
  }

  private loadUserFromStorage(): CurrentUser | null {
    const token = localStorage.getItem(TOKEN_KEY);
    const customerId = localStorage.getItem(CUSTOMER_ID_KEY);
    if (!token) return null;

    try {
      return this.decodeToken(token, customerId || undefined);
    } catch {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(CUSTOMER_ID_KEY);
      return null;
    }
  }

  private decodeToken(token: string, fallbackId?: string): CurrentUser | null {
    try {
      const payloadBase64 = token.split('.')[1];
      if (!payloadBase64) return null;

      const decodedJson = atob(payloadBase64.replace(/-/g, '+').replace(/_/g, '/'));
      const decoded: DecodedToken = JSON.parse(decodedJson);

      // Check expiration
      if (decoded.exp && decoded.exp * 1000 < Date.now()) {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(CUSTOMER_ID_KEY);
        return null;
      }

      const roleClaim = decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || decoded.role || 'Customer';
      const id = decoded.sub ? parseInt(decoded.sub, 10) : (fallbackId ? parseInt(fallbackId, 10) : 0);

      return {
        id,
        email: decoded.email,
        role: roleClaim === 'Admin' ? 'Admin' : 'Customer'
      };
    } catch (e) {
      console.error('Error decoding JWT token:', e);
      return null;
    }
  }
}
