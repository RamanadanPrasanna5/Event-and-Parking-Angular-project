import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CustomerNotificationItem, NotificationDto } from '../models/notification.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private apiUrl = `${environment.apiUrl}/api/notifications`;

  private notificationsSignal = signal<CustomerNotificationItem[]>([]);

  public readonly notifications = this.notificationsSignal.asReadonly();
  public readonly unreadCount = computed(
    () => this.notificationsSignal().filter((n) => !n.isRead).length
  );

  getNotifications(customerId?: number): Observable<CustomerNotificationItem[]> {
    const targetId = customerId ?? this.authService.getCustomerId();
    if (!targetId) {
      this.notificationsSignal.set([]);
      return of([]);
    }

    return this.http.get<NotificationDto[]>(`${this.apiUrl}/customer/${targetId}`).pipe(
      map((dtos) =>
        (dtos || []).map((d) => ({
          id: d.id,
          customerId: d.customerId,
          title: 'System Notification',
          message: d.message,
          type: 'system' as const,
          isRead: d.isRead,
          createdAt: d.createdAt,
          icon: 'fa-regular fa-bell'
        }))
      ),
      tap((items) => this.notificationsSignal.set(items)),
      catchError(() => {
        this.notificationsSignal.set([]);
        return of([]);
      })
    );
  }

  markAsRead(id: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/read`, {}).pipe(
      tap(() => {
        const updated = this.notificationsSignal().map((n) =>
          n.id === id ? { ...n, isRead: true } : n
        );
        this.notificationsSignal.set(updated);
      }),
      catchError(() => of(void 0))
    );
  }

  markAllAsRead(): Observable<void> {
    const unread = this.notificationsSignal().filter((n) => !n.isRead);
    unread.forEach((n) => this.markAsRead(n.id).subscribe({ error: () => {} }));
    return of(void 0);
  }

  refreshUnread(customerId?: number): void {
    this.getNotifications(customerId).subscribe({ error: () => {} });
  }
}
