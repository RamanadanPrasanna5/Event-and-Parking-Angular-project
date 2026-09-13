import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SeatDto } from '../../../core/models/seat.models';

@Component({
  selector: 'app-seat-item',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      type="button"
      class="seat-btn"
      [class.seat-available]="seat.status === 'Available' && !isSelected"
      [class.seat-selected]="isSelected"
      [class.seat-booked]="seat.status === 'Booked'"
      [disabled]="seat.status === 'Booked'"
      [attr.aria-label]="'Seat ' + seat.row + '-' + seat.seatNumber + ' ' + seat.status"
      (click)="seatClicked.emit(seat)">
      <span class="seat-label">{{ seat.row }}{{ seat.seatNumber }}</span>
      <span class="seat-price d-none d-sm-block">LKR {{ seat.price }}</span>
    </button>
  `,
  styles: [`
    .seat-btn {
      width: 44px;
      height: 48px;
      border-radius: 8px 8px 12px 12px;
      border: 1px solid transparent;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      font-family: var(--font-heading);
      cursor: pointer;
      transition: all var(--transition-fast);
      position: relative;
      user-select: none;
    }
    .seat-label {
      font-size: 0.8rem;
      font-weight: 700;
      line-height: 1;
    }
    .seat-price {
      font-size: 0.6rem;
      opacity: 0.85;
      margin-top: 2px;
    }

    /* Available State - Forest Sage Tint */
    .seat-available {
      background: var(--primary-subtle);
      border-color: var(--border-medium);
      color: var(--primary);
    }
    .seat-available:hover {
      background: var(--primary);
      border-color: var(--accent);
      color: var(--text-on-primary) !important;
      transform: translateY(-3px) scale(1.06);
      box-shadow: 0 6px 16px var(--primary-glow);
    }
    .seat-available:hover .seat-price {
      opacity: 1;
      color: var(--text-on-primary);
    }

    /* Selected State - Deep Forest Green & Gold Ring */
    .seat-selected {
      background: var(--primary);
      border-color: var(--accent);
      border-width: 2px;
      color: var(--text-on-primary) !important;
      font-weight: 800;
      transform: scale(1.12);
      box-shadow: 0 0 16px var(--primary-glow), 0 0 10px var(--accent-gold-glow);
      z-index: 2;
    }
    .seat-selected .seat-price {
      color: var(--accent);
      font-weight: 700;
      opacity: 1;
    }

    /* Booked / Disabled State - Muted Gray/Warm Beige */
    .seat-booked {
      background: var(--bg-surface-alt);
      border-color: var(--border-subtle);
      color: var(--text-dim);
      cursor: not-allowed;
      opacity: 0.5;
    }
  `]
})
export class SeatItemComponent {
  @Input({ required: true }) seat!: SeatDto;
  @Input() isSelected: boolean = false;
  @Output() seatClicked = new EventEmitter<SeatDto>();
}
