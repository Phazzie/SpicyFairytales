/**
 * Component for toggling between dark and light theme modes.
 */
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { ThemeService, Theme } from './theme.service';

@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      class="theme-toggle"
      (click)="toggleTheme()"
      [attr.aria-label]="getAriaLabel()"
      [title]="getTitle()"
    >
      <div class="toggle-container">
        <div class="toggle-track">
          <div class="toggle-thumb" [class.dark]="isDarkMode">
            <span class="icon" [class]="getIconClass()">{{ getIcon() }}</span>
          </div>
        </div>
        <span class="label">{{ getLabel() }}</span>
      </div>
    </button>
  `,
  styles: [`
    .theme-toggle {
      background: none;
      border: none;
      cursor: pointer;
      padding: 0.5rem;
      border-radius: 8px;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .theme-toggle:hover {
      background: var(--hover-bg, rgba(0, 0, 0, 0.05));
    }

    .toggle-container {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .toggle-track {
      position: relative;
      width: 44px;
      height: 24px;
      background: var(--toggle-track-bg, #e5e7eb);
      border-radius: 12px;
      transition: all 0.3s ease;
    }

    .toggle-thumb {
      position: absolute;
      top: 2px;
      left: 2px;
      width: 20px;
      height: 20px;
      background: white;
      border-radius: 50%;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }

    .toggle-thumb.dark {
      left: 22px;
      background: #1f2937;
    }

    .icon {
      font-size: 12px;
      color: #6b7280;
      transition: all 0.3s ease;
    }

    .toggle-thumb.dark .icon {
      color: #fbbf24;
    }

    .label {
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--text-color, #374151);
      min-width: 60px;
    }

    /* Dark theme adjustments */
    :host-context([data-theme="dark"]) .theme-toggle:hover {
      background: var(--hover-bg, rgba(255, 255, 255, 0.1));
    }

    :host-context([data-theme="dark"]) .toggle-track {
      background: #374151;
    }

    :host-context([data-theme="dark"]) .toggle-thumb {
      background: #f9fafb;
    }

    :host-context([data-theme="dark"]) .toggle-thumb.dark {
      background: #fbbf24;
    }

    :host-context([data-theme="dark"]) .icon {
      color: #9ca3af;
    }

    :host-context([data-theme="dark"]) .toggle-thumb.dark .icon {
      color: #1f2937;
    }

    :host-context([data-theme="dark"]) .label {
      color: #f9fafb;
    }
  `]
})
export class ThemeToggleComponent implements OnInit, OnDestroy {
  currentTheme: Theme = 'auto';
  appliedTheme: string = 'light';
  private subscriptions = new Subscription();

  constructor(private themeService: ThemeService) {}

  ngOnInit() {
    this.subscriptions.add(
      this.themeService.theme.subscribe(theme => {
        this.currentTheme = theme;
      })
    );

    this.subscriptions.add(
      this.themeService.appliedTheme.subscribe(theme => {
        this.appliedTheme = theme;
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  toggleTheme() {
    this.themeService.toggleTheme();
  }

  get isDarkMode(): boolean {
    return this.appliedTheme === 'dark';
  }

  getIcon(): string {
    switch (this.currentTheme) {
      case 'light': return '☀️';
      case 'dark': return '🌙';
      case 'auto': return '🌓';
      default: return '☀️';
    }
  }

  getIconClass(): string {
    return this.isDarkMode ? 'dark-icon' : 'light-icon';
  }

  getLabel(): string {
    switch (this.currentTheme) {
      case 'light': return 'Light';
      case 'dark': return 'Dark';
      case 'auto': return 'Auto';
      default: return 'Light';
    }
  }

  getAriaLabel(): string {
    return `Switch to ${this.currentTheme === 'light' ? 'dark' : this.currentTheme === 'dark' ? 'auto' : 'light'} theme`;
  }

  getTitle(): string {
    return `Current theme: ${this.getLabel()} (${this.appliedTheme} mode applied)`;
  }
}