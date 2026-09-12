import { Component, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ToastComponent } from './shared/components/toast/toast.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ToastComponent, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'EventPark';
  showSplash = signal(true);
  splashFading = signal(false);
  progress = signal(0);

  ngOnInit(): void {
    try {
      localStorage.removeItem('venuego_mock_database_v1');
    } catch {}

    const interval = setInterval(() => {
      this.progress.update((p) => {
        if (p >= 100) {
          clearInterval(interval);
          this.splashFading.set(true);
          setTimeout(() => {
            this.showSplash.set(false);
          }, 500);
          return 100;
        }
        return p + Math.floor(Math.random() * 20) + 15;
      });
    }, 80);
  }
}


