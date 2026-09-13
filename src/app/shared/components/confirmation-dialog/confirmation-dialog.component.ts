import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirmation-dialog, app-confirmation-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (isOpen) {
      <div class="modal-overlay" (click)="onBackdropClick($event)">
        <div class="modal-container">
          <div class="modal-header">
            <h4 class="mb-0 d-flex align-items-center gap-2">
              @if (icon) {
                <i [class]="icon" [style.color]="iconColor"></i>
              }
              {{ title }}
            </h4>
            <button class="btn btn-icon btn-outline" (click)="cancel.emit()">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>
          <div class="modal-body">
            <p class="mb-0">{{ message }}</p>
            <ng-content></ng-content>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" (click)="cancel.emit()">
              {{ cancelText }}
            </button>
            <button
              class="btn"
              [class.btn-danger]="isDanger"
              [class.btn-primary]="!isDanger"
              [disabled]="isLoading"
              (click)="confirm.emit()">
              @if (isLoading) {
                <i class="fa-solid fa-circle-notch fa-spin"></i> Processing...
              } @else {
                {{ confirmText }}
              }
            </button>
          </div>
        </div>
      </div>
    }
  `
})
export class ConfirmationDialogComponent {
  @Input() isOpen: boolean = false;
  @Input() title: string = 'Confirm Action';
  @Input() message: string = 'Are you sure you want to proceed?';
  @Input() confirmText: string = 'Confirm';
  @Input() cancelText: string = 'Cancel';
  @Input() isDanger: boolean = false;
  @Input() isLoading: boolean = false;
  @Input() icon?: string;
  @Input() iconColor: string = 'var(--primary)';

  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-overlay')) {
      this.cancel.emit();
    }
  }
}

export const ConfirmationModalComponent = ConfirmationDialogComponent;
export type ConfirmationModalComponent = ConfirmationDialogComponent;
