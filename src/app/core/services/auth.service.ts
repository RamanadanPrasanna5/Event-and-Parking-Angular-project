import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
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
} from '../models/auth.model';

const TOKEN_KEY = 'venuego_jwt_token';
const USER_KEY = 'venuego_current_user';

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
    return localStorage.getItem(TOKEN_KEY) || localStorage.getItem('eventro_jwt_token');
  }

  getCustomerId(): number | null {
    return this.currentUserSignal()?.id ?? null;
  }

  register(dto: RegisterDto): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, dto);
  }

  login(dto: LoginDto): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, dto).pipe(
      tap((res) => {
        const token = res.Token || res.token;
        const customerId = res.CustomerId || res.customerId || '';
        if (!token) return;

        const decoded = this.decodeToken(token);
        const role =
          decoded?.role ||
          decoded?.['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ||
          'Customer';
        const email = decoded?.email || dto.email;
        const id = decoded?.sub ? parseInt(decoded.sub, 10) : (parseInt(customerId, 10) || 0);

        const user: CurrentUser = {
          id: id,
          email: email,
          role: role === 'Admin' ? 'Admin' : 'Customer'
        };

        this.saveUserToStorage(user, token);
      })
    );
  }

  verifyEmail(token: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/verify-email`, {
      params: { token }
    });
  }

  forgotPassword(dto: ForgotPasswordDto): Observable<any> {
    return this.http.post(`${this.apiUrl}/forgot-password`, dto);
  }

  resetPassword(dto: ResetPasswordDto): Observable<any> {
    return this.http.post(`${this.apiUrl}/reset-password`, dto);
  }

  resendVerification(dto: ResendVerificationDto): Observable<any> {
    return this.http.post(`${this.apiUrl}/resend-verification`, dto);
  }

  logout(redirectUrl: string = '/login'): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem('eventro_jwt_token');
    localStorage.removeItem('eventro_current_user');
    this.currentUserSignal.set(null);
    this.router.navigate([redirectUrl]);
  }

  private decodeToken(token: string): DecodedToken | null {
    try {
      const base64Url = token.split('.')[1];
      if (!base64Url) return null;
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch {
      return null;
    }
  }

  private saveUserToStorage(user: CurrentUser, token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    this.currentUserSignal.set(user);
  }

  private loadUserFromStorage(): CurrentUser | null {
    const raw = localStorage.getItem(USER_KEY) || localStorage.getItem('eventro_current_user');
    const token = localStorage.getItem(TOKEN_KEY) || localStorage.getItem('eventro_jwt_token');
    if (!raw || !token) return null;

    try {
      const user = JSON.parse(raw);
      // Check token expiration
      const decoded = this.decodeToken(token);
      if (decoded?.exp && decoded.exp * 1000 < Date.now()) {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        return null;
      }
      return user;
    } catch {
      return null;
    }
  }
}
