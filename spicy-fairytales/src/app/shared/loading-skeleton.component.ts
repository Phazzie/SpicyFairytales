/**
 * Loading skeleton component for displaying placeholder content during async operations.
 */
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading-skeleton',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="skeleton-container" [ngClass]="type">
      <div class="skeleton" *ngFor="let item of items" [style.width]="getWidth(item)"></div>
    </div>
  `,
  styles: [`
    .skeleton-container {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .skeleton-container.text {
      gap: 0.75rem;
    }

    .skeleton-container.card {
      gap: 1rem;
      padding: 1.5rem;
      background: var(--card-bg, #ffffff);
      border-radius: 8px;
      border: 1px solid var(--border-color, #e1e5e9);
    }

    .skeleton {
      height: 1rem;
      background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
      background-size: 200% 100%;
      animation: loading 1.5s infinite;
      border-radius: 4px;
    }

    .skeleton-container.text .skeleton {
      height: 1.2rem;
    }

    .skeleton-container.card .skeleton {
      height: 1.5rem;
    }

    .skeleton-container.card .skeleton:first-child {
      height: 2rem;
      width: 60% !important;
    }

    .skeleton-container.card .skeleton:last-child {
      height: 1rem;
      width: 40% !important;
    }

    @keyframes loading {
      0% {
        background-position: 200% 0;
      }
      100% {
        background-position: -200% 0;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .skeleton {
        animation: none;
        background: #f0f0f0;
      }
    }
  `]
})
export class LoadingSkeletonComponent {
  @Input() type: 'text' | 'card' = 'text';
  @Input() lines: number = 3;

  get items(): number[] {
    return Array.from({ length: this.lines }, (_, i) => i);
  }

  getWidth(index: number): string {
    const widths = ['100%', '90%', '80%', '95%', '85%', '75%'];
    return widths[index % widths.length];
  }
}