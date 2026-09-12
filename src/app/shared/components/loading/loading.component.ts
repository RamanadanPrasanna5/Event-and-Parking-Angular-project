import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading, app-loading-spinner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="loading-container d-flex flex-column align-items-center justify-content-center p-4">
      <div class="spinner"></div>
      @if (message) {
        <p class="loading-message mt-3">{{ message }}</p>
      }
    </div>
  `,
  styles: [`
    .loading-container {
      min-height: 180px;
    }
    .spinner {
      width: 44px;
      height: 44px;
      border: 3px solid rgba(99, 102, 241, 0.2);
      border-top-color: var(--primary);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    .loading-message {
      color: var(--text-muted);
      font-size: 0.95rem;
      font-family: var(--font-heading);
      letter-spacing: 0.3px;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `]
})
export class LoadingComponent {
  @Input() message: string = 'Loading...';
}

export const LoadingSpinnerComponent = LoadingComponent;
export type LoadingSpinnerComponent = LoadingComponent;
