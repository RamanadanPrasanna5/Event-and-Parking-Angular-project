import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="empty-state-card card d-flex flex-column align-items-center text-center p-5">
      <div class="icon-bubble mb-3">
        <i [class]="icon"></i>
      </div>
      <h3 class="mb-2">{{ title }}</h3>
      <p class="description mb-4">{{ message }}</p>
      @if (actionLabel) {
        <button class="btn btn-primary" (click)="actionClicked.emit()">
          {{ actionLabel }}
        </button>
      }
    </div>
  `,
  styles: [`
    .empty-state-card {
      background: var(--bg-card);
      border: 1px dashed var(--border-medium);
      border-radius: var(--radius-xl);
      max-width: 580px;
      margin: 2rem auto;
    }
    .icon-bubble {
      width: 68px;
      height: 68px;
      border-radius: 50%;
      background: var(--primary-subtle);
      color: var(--primary);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.85rem;
      border: 1px solid rgba(99, 102, 241, 0.25);
    }
    .description {
      max-width: 440px;
      font-size: 0.95rem;
    }
  `]
})
export class EmptyStateComponent {
  @Input() icon: string = 'fa-solid fa-inbox';
  @Input() title: string = 'No Items Found';
  @Input() message: string = 'There is currently no data available to display.';
  @Input() actionLabel?: string;
  @Output() actionClicked = new EventEmitter<void>();
}
