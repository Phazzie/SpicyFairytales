/**
 * @fileoverview Root component for the application.
 *
 * ## Architecture Context
 * This is the main component that acts as the root of the application's UI.
 * It is responsible for rendering the main router outlet and any global UI
 * elements like the theme toggle and toast container.
 *
 * ## Information Flow
 * 1. This component is the entry point for the application's view, bootstrapped
 *    in `main.ts`.
 * 2. It contains a `<router-outlet>` which dynamically renders the component
 *    for the current route.
 * 3. It includes the `ThemeToggleComponent` and `ToastContainerComponent` to
 *    ensure they are present on all pages.
 *
 * ## Contract Compliance
 * - This is a standard Angular `Component`.
 * - It orchestrates the display of other components but contains no business logic itself,
 *   adhering to the "Dumb UI" principle at the root level.
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
