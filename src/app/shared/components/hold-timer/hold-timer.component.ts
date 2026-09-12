import {
  Component,
  Input,
  OnInit,
  OnDestroy,
  OnChanges,
  SimpleChanges,
  Output,
  EventEmitter,
  signal,
  computed
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-hold-timer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="hold-timer-banner" [class.warning]="urgency() === 'warning'" [class.danger]="urgency() === 'danger'">
      <div class="hold-timer-inner d-flex align-items-center gap-3">
        <!-- Animated icon -->
        <div class="timer-icon-box" [class.pulse-warning]="urgency() === 'warning'" [class.pulse-danger]="urgency() === 'danger'">
          <i class="fa-regular fa-clock"></i>
        </div>

        <!-- Text content -->
        <div class="flex-grow-1">
          <div class="timer-label">
            @if (urgency() === 'danger') {
              <strong>⚠ Hurry! Hold expiring soon</strong>
            } @else if (urgency() === 'warning') {
              <strong>Almost out of time</strong>
            } @else {
              <strong>Seat hold reserved</strong>
            }
          </div>
          <div class="timer-sub">
            Complete payment within <strong class="timer-countdown">{{ formattedTime() }}</strong>
            — your seats {{ parkingSelected ? '& parking' : '' }} are held exclusively for you.
          </div>
        </div>

        <!-- Large Countdown Display -->
        <div class="countdown-display" [class.danger-text]="urgency() === 'danger'">
          {{ formattedTime() }}
        </div>
      </div>

      <!-- Progress bar -->
      <div class="timer-progress-track">
        <div
          class="timer-progress-fill"
          [style.width.%]="progressPercent()"
          [class.fill-warning]="urgency() === 'warning'"
          [class.fill-danger]="urgency() === 'danger'">
        </div>
      </div>
    </div>
  `,
  styles: [`
    .hold-timer-banner {
      background: linear-gradient(135deg, #F0FDF4, #DCFCE7);
      border: 1.5px solid #86EFAC;
      border-radius: var(--radius-lg);
      padding: 1rem 1.25rem 0.75rem;
      margin-bottom: 1.5rem;
      transition: all 0.4s ease;
    }
    .hold-timer-banner.warning {
      background: linear-gradient(135deg, #FFFBEB, #FEF3C7);
      border-color: #FCD34D;
    }
    .hold-timer-banner.danger {
      background: linear-gradient(135deg, #FFF1F2, #FFE4E6);
      border-color: #FCA5A5;
      animation: shake 0.5s ease-in-out;
    }
    .hold-timer-inner {
      margin-bottom: 0.75rem;
    }
    .timer-icon-box {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: rgba(21, 128, 61, 0.12);
      color: #15803D;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.35rem;
      flex-shrink: 0;
      transition: all 0.4s ease;
    }
    .timer-icon-box.pulse-warning {
      background: rgba(180, 83, 9, 0.12);
      color: #B45309;
      animation: pulseIcon 1s ease-in-out infinite;
    }
    .timer-icon-box.pulse-danger {
      background: rgba(220, 38, 38, 0.12);
      color: #DC2626;
      animation: pulseIcon 0.5s ease-in-out infinite;
    }
    .timer-label {
      font-size: 0.9rem;
      color: #15803D;
      margin-bottom: 0.2rem;
    }
    .hold-timer-banner.warning .timer-label { color: #B45309; }
    .hold-timer-banner.danger .timer-label { color: #DC2626; }
    .timer-sub {
      font-size: 0.8rem;
      color: #166534;
      line-height: 1.4;
    }
    .hold-timer-banner.warning .timer-sub { color: #92400E; }
    .hold-timer-banner.danger .timer-sub { color: #991B1B; }
    .countdown-display {
      font-family: var(--font-heading);
      font-size: 2rem;
      font-weight: 800;
      color: #15803D;
      letter-spacing: 2px;
      flex-shrink: 0;
      min-width: 80px;
      text-align: center;
      transition: color 0.4s ease;
    }
    .countdown-display.danger-text {
      color: #DC2626;
      animation: blink 0.5s ease-in-out infinite;
    }
    .timer-countdown { font-family: monospace; }

    /* Progress bar */
    .timer-progress-track {
      height: 4px;
      background: rgba(0,0,0,0.08);
      border-radius: 999px;
      overflow: hidden;
    }
    .timer-progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #16A34A, #22C55E);
      border-radius: 999px;
      transition: width 1s linear, background 0.4s ease;
    }
    .timer-progress-fill.fill-warning {
      background: linear-gradient(90deg, #D97706, #F59E0B);
    }
    .timer-progress-fill.fill-danger {
      background: linear-gradient(90deg, #DC2626, #EF4444);
    }

    @keyframes pulseIcon {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.15); }
    }
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      20%, 60% { transform: translateX(-4px); }
      40%, 80% { transform: translateX(4px); }
    }
    @keyframes blink {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.4; }
    }
  `]
})
export class HoldTimerComponent implements OnInit, OnDestroy, OnChanges {
  /** ISO string of when the hold expires, e.g. "2026-09-11T08:45:00Z" */
  @Input() holdExpiresAt: string | null = null;
  /** Total hold duration in seconds (default: 900 = 15 min) */
  @Input() totalSeconds: number = 900;
  /** Whether parking was also selected (affects message text) */
  @Input() parkingSelected: boolean = false;
  /** Emitted when the countdown reaches zero */
  @Output() expired = new EventEmitter<void>();

  remainingSeconds = signal<number>(900);
  private intervalId: any = null;

  readonly formattedTime = computed(() => {
    const s = Math.max(0, this.remainingSeconds());
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  });

  readonly progressPercent = computed(() => {
    return Math.max(0, (this.remainingSeconds() / this.totalSeconds) * 100);
  });

  readonly urgency = computed(() => {
    const s = this.remainingSeconds();
    if (s <= 60) return 'danger';
    if (s <= 180) return 'warning';
    return 'normal';
  });

  ngOnInit(): void {
    this.startTimer();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['holdExpiresAt'] && !changes['holdExpiresAt'].firstChange) {
      this.stopTimer();
      this.startTimer();
    }
  }

  ngOnDestroy(): void {
    this.stopTimer();
  }

  private startTimer(): void {
    if (!this.holdExpiresAt) {
      this.remainingSeconds.set(this.totalSeconds);
    } else {
      const expiryMs = new Date(this.holdExpiresAt).getTime();
      const nowMs = Date.now();
      const diff = Math.max(0, Math.floor((expiryMs - nowMs) / 1000));
      this.remainingSeconds.set(diff);
      if (diff <= 0) {
        this.expired.emit();
        return;
      }
    }

    this.intervalId = setInterval(() => {
      const current = this.remainingSeconds();
      if (current <= 1) {
        this.remainingSeconds.set(0);
        this.stopTimer();
        this.expired.emit();
      } else {
        this.remainingSeconds.set(current - 1);
      }
    }, 1000);
  }

  private stopTimer(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}
