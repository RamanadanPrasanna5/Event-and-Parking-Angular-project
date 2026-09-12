import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card stat-card d-flex flex-column justify-content-between">
      <div class="d-flex justify-content-between align-items-start mb-3">
        <div>
          <span class="stat-label">{{ label }}</span>
          <h2 class="stat-value mt-1 mb-0">{{ value }}</h2>
        </div>
        <div class="stat-icon-wrapper" [style.background]="iconBg" [style.color]="iconColor">
          <i [class]="icon"></i>
        </div>
      </div>
      @if (hint) {
        <div class="stat-hint d-flex align-items-center gap-1">
          <i class="fa-solid fa-arrow-trend-up" *ngIf="trendUp"></i>
          <span>{{ hint }}</span>
        </div>
      }
    </div>
  `,
  styles: [`
    .stat-card {
      position: relative;
      overflow: hidden;
      border-radius: var(--radius-lg);
      background: var(--bg-card);
      border: 1px solid var(--border-subtle);
      box-shadow: var(--shadow-sm);
      padding: 1.5rem;
    }
    .stat-label {
      font-size: 0.85rem;
      font-family: var(--font-heading);
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .stat-value {
      font-size: 1.85rem;
      font-weight: 800;
      color: var(--text-main);
    }
    .stat-icon-wrapper {
      width: 48px;
      height: 48px;
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.35rem;
    }
    .stat-hint {
      font-size: 0.8rem;
      color: var(--text-muted);
    }
  `]
})
export class StatCardComponent {
  @Input() label: string = '';
  @Input() value: string | number = '';
  @Input() icon: string = 'fa-solid fa-chart-line';
  @Input() iconColor: string = 'var(--primary)';
  @Input() iconBg: string = 'var(--primary-subtle)';
  @Input() hint?: string;
  @Input() trendUp: boolean = false;
}
