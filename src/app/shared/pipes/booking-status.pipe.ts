import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'bookingStatusBadge',
  standalone: true
})
export class BookingStatusBadgePipe implements PipeTransform {
  transform(status: string | undefined): string {
    switch ((status || '').toLowerCase()) {
      case 'confirmed':
      case 'active':
      case 'paid':
        return 'badge-success';
      case 'pending':
      case 'reserved':
        return 'badge-warning';
      case 'cancelled':
      case 'deactivated':
      case 'expired':
        return 'badge-danger';
      default:
        return 'badge-neutral';
    }
  }
}
