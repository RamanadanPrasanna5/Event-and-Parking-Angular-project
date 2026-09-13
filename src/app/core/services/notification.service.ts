import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { NotificationDto } from '../models/notification.models';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/notifications`;

  private notificationsSignal = signal<NotificationDto[]>([]);
  public readonly notifications = this.notificationsSignal.asReadonly();
  public readonly unreadCount = computed(
    () => this.notificationsSignal().filter(n => !n.isRead).length
  );

  getNotifications(customerId: number): Observable<NotificationDto[]> {
    return this.http.get<NotificationDto[]>(`${this.apiUrl}/customer/${customerId}`).pipe(
      tap(items => {
        this.notificationsSignal.set(items);
      })
    );
  }

  markAsRead(id: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/read`, {}).pipe(
      tap(() => {
        this.notificationsSignal.update(items =>
          items.map(n => (n.id === id ? { ...n, isRead: true } : n))
        );
      })
    );
  }

  refreshUnread(customerId: number): void {
    if (customerId) {
      this.getNotifications(customerId).subscribe({
        error: () => {}
      });
    }
  }
}
