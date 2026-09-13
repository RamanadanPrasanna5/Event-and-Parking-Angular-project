import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ToastComponent } from './shared/components/toast/toast.component';
import { IntroSplashComponent } from './shared/components/intro-splash/intro-splash.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ToastComponent, IntroSplashComponent, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'Event Park';
  showIntro: boolean = true;

  ngOnInit(): void {
    // Check if user requested to skip intro via query param or previous flag if needed
    // Default is true so it displays on app open
    const hasSeenInSession = sessionStorage.getItem('eventro_intro_played');
    if (hasSeenInSession === 'true') {
      this.showIntro = false;
    }
  }

  onIntroComplete(): void {
    this.showIntro = false;
    try {
      sessionStorage.setItem('eventro_intro_played', 'true');
    } catch {
      // Ignore storage restrictions
    }
  }
}

