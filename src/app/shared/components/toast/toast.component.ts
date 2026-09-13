import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastMessage, ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container">
      @for (toast of toastService.toasts(); track toast.id) {
        <div class="toast-item" [class]="'toast-' + toast.type" (click)="dismiss(toast.id)">
          <div class="toast-icon">
            @switch (toast.type) {
              @case ('success') { <i class="fa-solid fa-circle-check"></i> }
              @case ('error') { <i class="fa-solid fa-circle-exclamation"></i> }
              @case ('warning') { <i class="fa-solid fa-triangle-exclamation"></i> }
              @default { <i class="fa-solid fa-circle-info"></i> }
            }
          </div>
          <div class="toast-content">
            @if (toast.title) {
              <div class="toast-title">{{ toast.title }}</div>
            }
            <div class="toast-message">{{ toast.message }}</div>
          </div>
          <button class="toast-close" (click)="dismiss(toast.id); $event.stopPropagation()">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      top: 1.5rem;
      right: 1.5rem;
      z-index: 2000;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      max-width: 380px;
      pointer-events: none;
    }
    .toast-item {
      pointer-events: auto;
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
      padding: 1rem 1.25rem;
      background: var(--bg-glass-heavy);
      backdrop-filter: blur(12px);
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-lg);
      border: 1px solid var(--border-medium);
      color: var(--text-main);
      animation: slideInRight 0.25s ease-out;
      cursor: pointer;
    }
    .toast-success { border-left: 4px solid var(--success); }
    .toast-success .toast-icon { color: var(--success); }
    .toast-error { border-left: 4px solid var(--danger); }
    .toast-error .toast-icon { color: var(--danger); }
    .toast-warning { border-left: 4px solid var(--warning); }
    .toast-warning .toast-icon { color: var(--warning); }
    .toast-info { border-left: 4px solid var(--info); }
    .toast-info .toast-icon { color: var(--info); }

    .toast-icon {
      font-size: 1.2rem;
      margin-top: 2px;
    }
    .toast-content {
      flex: 1;
    }
    .toast-title {
      font-weight: 600;
      font-size: 0.9rem;
      margin-bottom: 0.2rem;
    }
    .toast-message {
      font-size: 0.85rem;
      color: var(--text-muted);
      line-height: 1.4;
    }
    .toast-close {
      background: none;
      border: none;
      color: var(--text-dim);
      cursor: pointer;
      font-size: 0.85rem;
    }
    .toast-close:hover {
      color: #fff;
    }
    @keyframes slideInRight {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
  `]
})
export class ToastComponent {
  toastService = inject(ToastService);

  dismiss(id: string): void {
    this.toastService.dismiss(id);
  }
}
