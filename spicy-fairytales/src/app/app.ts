/**
 * Root Angular application component providing global layout, theme management, and notification infrastructure.
 * 
 * Top-level component that establishes the application shell with routing outlet, theme toggle,
 * and toast notification container. Serves as the entry point for the entire application
 * user interface and provides global UI services.
 * 
 * INPUT: Router navigation events, theme toggle interactions, toast notifications
 * OUTPUT: Application shell layout, routed component display, global UI functionality
 * DEPENDENCIES: Angular Router, theme toggle, toast container, global styling
 * INTEGRATIONS: Bootstrap point for all application components, provides shared UI infrastructure
 * ARCHITECTURE: Single-page application shell with component routing and global services
 * FEATURES: Responsive layout, theme switching, notification system, navigation infrastructure
 */
import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThemeToggleComponent } from './shared/theme-toggle.component';
import { ToastContainerComponent } from './shared/toast-container.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ThemeToggleComponent, ToastContainerComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('spicy-fairytales');
}
