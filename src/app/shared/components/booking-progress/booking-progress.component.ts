import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type BookingStep = 'event' | 'seats' | 'parking' | 'summary' | 'payment' | 'confirmed';

@Component({
  selector: 'app-booking-progress',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="booking-progress-container mb-4">
      <div class="progress-bar-steps d-flex justify-content-between align-items-center">
        @for (step of steps; track step.key; let i = $index) {
          <div class="progress-step-item d-flex flex-column align-items-center" [class.active]="isCurrent(step.key)" [class.completed]="isCompleted(step.key)">
            <div class="step-icon-wrapper">
              @if (isCompleted(step.key)) {
                <i class="fa-solid fa-check check-icon"></i>
              } @else {
                <span class="step-number">{{ i + 1 }}</span>
              }
            </div>
            <span class="step-title">{{ step.label }}</span>
          </div>

          @if (i < steps.length - 1) {
            <div class="progress-line flex-grow-1" [class.completed]="isLineCompleted(i)"></div>
          }
        }
      </div>
    </div>
  `,
  styles: [`
    .booking-progress-container {
      width: 100%;
      max-width: 820px;
      margin-left: auto;
      margin-right: auto;
      padding: 0.75rem 1rem;
    }
    .progress-bar-steps {
      position: relative;
    }
    .progress-step-item {
      position: relative;
      z-index: 2;
      text-align: center;
    }
    .step-icon-wrapper {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: #F8FAFC;
      border: 2px solid var(--border-medium);
      color: var(--text-muted);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.85rem;
      font-weight: 700;
      transition: all var(--transition-normal);
      margin-bottom: 0.35rem;
    }
    .step-title {
      font-family: var(--font-heading);
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      white-space: nowrap;
      transition: color var(--transition-normal);
    }
    @media (max-width: 600px) {
      .step-title {
        font-size: 0.65rem;
      }
      .step-icon-wrapper {
        width: 28px;
        height: 28px;
        font-size: 0.75rem;
      }
    }
    /* Active State */
    .progress-step-item.active .step-icon-wrapper {
      background: var(--primary);
      border-color: var(--primary);
      color: #FFFFFF;
      box-shadow: 0 2px 8px rgba(15, 118, 110, 0.25);
      transform: scale(1.08);
    }
    .progress-step-item.active .step-title {
      color: var(--primary);
      font-weight: 700;
    }
    /* Completed State */
    .progress-step-item.completed .step-icon-wrapper {
      background: #CCFBF1;
      border-color: var(--primary);
      color: var(--primary);
    }
    .progress-step-item.completed .step-title {
      color: var(--text-main);
      font-weight: 600;
    }
    /* Connector Lines */
    .progress-line {
      height: 2px;
      background: var(--border-subtle);
      margin: 0 0.5rem 1.4rem;
      transition: background 0.3s ease;
    }
    .progress-line.completed {
      background: var(--primary);
    }
  `]
})
export class BookingProgressComponent {
  @Input() currentStep: BookingStep = 'seats';

  steps = [
    { key: 'event', label: 'Event' },
    { key: 'seats', label: 'Seats' },
    { key: 'parking', label: 'Parking' },
    { key: 'summary', label: 'Summary' },
    { key: 'payment', label: 'Payment' },
    { key: 'confirmed', label: 'Confirmed' }
  ];

  private order: Record<BookingStep, number> = {
    event: 0,
    seats: 1,
    parking: 2,
    summary: 3,
    payment: 4,
    confirmed: 5
  };

  isCurrent(stepKey: string): boolean {
    return this.currentStep === stepKey;
  }

  isCompleted(stepKey: string): boolean {
    const currentIdx = this.order[this.currentStep] ?? 0;
    const stepIdx = this.order[stepKey as BookingStep] ?? 0;
    return stepIdx < currentIdx;
  }

  isLineCompleted(index: number): boolean {
    const currentIdx = this.order[this.currentStep] ?? 0;
    return index < currentIdx;
  }
}
