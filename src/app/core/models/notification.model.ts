export interface NotificationDto {
  id: number;
  customerId: number;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface CustomerNotificationItem {
  id: number;
  customerId?: number;
  bookingId?: number;
  title: string;
  message: string;
  type: 'booking' | 'payment' | 'parking' | 'system';
  isRead: boolean;
  createdAt: string;
  actionUrl?: string;
  icon?: string;
}

