import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookingConfirmationComponent } from '../booking-confirmation/booking-confirmation.component';

@Component({
  selector: 'app-receipt',
  standalone: true,
  imports: [CommonModule, BookingConfirmationComponent],
  template: `
    <app-booking-confirmation></app-booking-confirmation>
  `
})
export class ReceiptComponent {}
