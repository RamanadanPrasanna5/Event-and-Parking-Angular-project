import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SeatDto } from '../../../core/models/seat.model';

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

    /* Available State - Fresh Mint Emerald */
    .seat-available {
      background: rgba(16, 185, 129, 0.12);
      border-color: rgba(16, 185, 129, 0.35);
      color: #34D399;
    }
    .seat-available:hover {
      background: rgba(16, 185, 129, 0.28);
      border-color: #10B981;
      transform: translateY(-2px);
      box-shadow: 0 4px 14px rgba(16, 185, 129, 0.35);
    }

    /* Selected State - Electric Royal Indigo & Glow */
    .seat-selected {
      background: linear-gradient(135deg, #6366F1, #8B5CF6);
      border-color: #C7D2FE;
      color: #FFFFFF !important;
      font-weight: 800;
      transform: scale(1.12);
      box-shadow: 0 0 16px rgba(99, 102, 241, 0.65);
      z-index: 2;
    }

    /* Booked / Disabled State - Muted Slate */
    .seat-booked {
      background: rgba(100, 116, 139, 0.12);
      border-color: rgba(100, 116, 139, 0.22);
      color: #64748B;
      cursor: not-allowed;
      opacity: 0.45;
    }
  `]
})
export class SeatItemComponent {
  @Input({ required: true }) seat!: SeatDto;
  @Input() isSelected: boolean = false;
  @Output() seatClicked = new EventEmitter<SeatDto>();
}
