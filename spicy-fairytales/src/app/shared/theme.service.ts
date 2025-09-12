/**
 * Service for managing application-wide dark/light theme preferences.
 */
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

export type Theme = 'light' | 'dark' | 'auto';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private currentTheme$ = new BehaviorSubject<Theme>('auto');
  public theme = this.currentTheme$.asObservable();

  private appliedTheme$ = new BehaviorSubject<string>('light');
  public appliedTheme = this.appliedTheme$.asObservable();

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    if (isPlatformBrowser(this.platformId)) {
      this.loadSavedTheme();
      this.applyTheme();
    }
  }

  setTheme(theme: Theme) {
    this.currentTheme$.next(theme);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('spicy-theme', theme);
      this.applyTheme();
    }
  }

  getCurrentTheme(): Theme {
    return this.currentTheme$.value;
  }

  private loadSavedTheme() {
    if (isPlatformBrowser(this.platformId)) {
      const saved = localStorage.getItem('spicy-theme') as Theme;
      if (saved && ['light', 'dark', 'auto'].includes(saved)) {
        this.currentTheme$.next(saved);
      }
    }
  }

  private applyTheme() {
    if (!isPlatformBrowser(this.platformId)) return;

    const currentTheme = this.currentTheme$.value;
    let appliedTheme: string;

    if (currentTheme === 'auto') {
      appliedTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } else {
      appliedTheme = currentTheme;
    }

    document.documentElement.setAttribute('data-theme', appliedTheme);
    this.appliedTheme$.next(appliedTheme);
  }

  toggleTheme() {
    const current = this.getCurrentTheme();
    const next = current === 'light' ? 'dark' : current === 'dark' ? 'auto' : 'light';
    this.setTheme(next);
  }
}