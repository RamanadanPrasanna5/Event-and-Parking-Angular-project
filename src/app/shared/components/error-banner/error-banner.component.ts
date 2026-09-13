import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-error-banner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="error-banner d-flex align-items-center justify-content-between p-3 mb-4">
      <div class="d-flex align-items-center gap-3">
        <div class="error-icon">
          <i class="fa-solid fa-triangle-exclamation"></i>
        </div>
        <div>
          <h5 class="error-title mb-1">{{ title }}</h5>
          <p class="error-message mb-0">{{ message }}</p>
        </div>
      </div>
      @if (retryable) {
        <button class="btn btn-sm btn-secondary" (click)="retry.emit()">
          <i class="fa-solid fa-rotate-right me-1"></i> Retry
        </button>
      }
    </div>
  `,
  styles: [`
    .error-banner {
      background: var(--danger-subtle);
      border: 1px solid rgba(197, 48, 48, 0.3);
      border-radius: var(--radius-md);
    }
    .error-icon {
      color: var(--danger);
      font-size: 1.5rem;
    }
    .error-title {
      font-family: var(--font-heading);
      font-size: 0.95rem;
      font-weight: 700;
      color: var(--danger);
    }
    .error-message {
      font-size: 0.85rem;
      color: var(--text-muted);
    }
  `]
})
export class ErrorBannerComponent {
  @Input() title: string = 'An error occurred';
  @Input() message: string = 'Unable to complete the requested operation. Please try again.';
  @Input() retryable: boolean = true;
  @Output() retry = new EventEmitter<void>();
}
