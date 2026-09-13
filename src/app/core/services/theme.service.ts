import { Injectable, computed, signal } from '@angular/core';

export type AppTheme = 'dark' | 'light';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly THEME_KEY = 'event_park_editorial_theme';

  // Reactive state using Angular Signals - Default to Light Theme
  readonly currentTheme = signal<AppTheme>(this.getInitialTheme());
  readonly isDark = computed(() => this.currentTheme() === 'dark');
  readonly isLight = computed(() => this.currentTheme() === 'light');

  constructor() {
    this.applyTheme(this.currentTheme());
  }

  /**
   * Toggle between dark and light themes
   */
  toggleTheme(): void {
    const nextTheme: AppTheme = this.currentTheme() === 'dark' ? 'light' : 'dark';
    this.setTheme(nextTheme);
  }

  /**
   * Set specific theme explicitly
   */
  setTheme(theme: AppTheme, persist = true): void {
    this.currentTheme.set(theme);
    this.applyTheme(theme);
    if (persist && typeof localStorage !== 'undefined') {
      localStorage.setItem(this.THEME_KEY, theme);
    }
  }

  private applyTheme(theme: AppTheme): void {
    if (typeof document === 'undefined') return;

    const root = document.documentElement;
    const body = document.body;

    root.setAttribute('data-theme', theme);
    root.style.colorScheme = theme;

    root.classList.remove('theme-dark', 'theme-light');
    root.classList.add(`theme-${theme}`);

    if (body) {
      body.classList.remove('theme-dark', 'theme-light');
      body.classList.add(`theme-${theme}`);
    }
  }

  private getInitialTheme(): AppTheme {
    if (typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem(this.THEME_KEY) as AppTheme | null;
      if (stored === 'dark' || stored === 'light') {
        return stored;
      }
    }

    // Default to the new luxury light theme (Warm off-white & deep forest green)
    return 'light';
  }
}
