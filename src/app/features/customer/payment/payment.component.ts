import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookingSummaryComponent } from '../booking-summary/booking-summary.component';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [CommonModule, BookingSummaryComponent],
  template: `
    <app-booking-summary></app-booking-summary>
  `
})
export class PaymentComponent {}
