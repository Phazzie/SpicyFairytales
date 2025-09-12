import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { ToastService, Toast } from './toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container" *ngIf="toasts.length > 0">
      <div
        class="toast"
        [ngClass]="toast.type"
        *ngFor="let toast of toasts"
        [@toastAnimation]
      >
        <div class="toast-content">
          <div class="toast-icon">
            <span [class]="getIconClass(toast.type)">!</span>
          </div>
          <div class="toast-text">
            <div class="toast-title">{{ toast.title }}</div>
            <div class="toast-message">{{ toast.message }}</div>
          </div>
          <button
            class="toast-close"
            (click)="removeToast(toast.id)"
            aria-label="Close notification"
          >
            ×
          </button>
        </div>
        <div class="toast-progress" *ngIf="toast.duration && toast.duration > 0">
          <div
            class="toast-progress-bar"
            [style.animation-duration]="toast.duration + 'ms'"
          ></div>
        </div>
        <div class="toast-action" *ngIf="toast.action">
          <button
            class="toast-action-btn"
            (click)="executeAction(toast)"
          >
            {{ toast.action.label }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 1000;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      max-width: 400px;
    }

    .toast {
      background: white;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      border-left: 4px solid;
      overflow: hidden;
      animation: slideIn 0.3s ease-out;
    }

    .toast.success {
      border-left-color: #10b981;
    }

    .toast.error {
      border-left-color: #ef4444;
    }

    .toast.warning {
      border-left-color: #f59e0b;
    }

    .toast.info {
      border-left-color: #3b82f6;
    }

    .toast-content {
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
      padding: 1rem;
    }

    .toast-icon {
      flex-shrink: 0;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: bold;
      color: white;
    }

    .toast.success .toast-icon {
      background: #10b981;
    }

    .toast.error .toast-icon {
      background: #ef4444;
    }

    .toast.warning .toast-icon {
      background: #f59e0b;
    }

    .toast.info .toast-icon {
      background: #3b82f6;
    }

    .toast-text {
      flex: 1;
      min-width: 0;
    }

    .toast-title {
      font-weight: 600;
      font-size: 0.875rem;
      margin-bottom: 0.25rem;
      color: #1f2937;
    }

    .toast-message {
      font-size: 0.875rem;
      color: #6b7280;
      line-height: 1.4;
    }

    .toast-close {
      background: none;
      border: none;
      font-size: 1.25rem;
      color: #9ca3af;
      cursor: pointer;
      padding: 0;
      width: 20px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 4px;
      transition: all 0.2s;
      flex-shrink: 0;
    }

    .toast-close:hover {
      background: #f3f4f6;
      color: #6b7280;
    }

    .toast-progress {
      height: 3px;
      background: #f3f4f6;
      position: relative;
    }

    .toast-progress-bar {
      height: 100%;
      background: currentColor;
      animation: progress linear;
      transform-origin: left;
    }

    .toast-action {
      padding: 0 1rem 1rem 1rem;
      text-align: right;
    }

    .toast-action-btn {
      background: transparent;
      border: 1px solid currentColor;
      color: inherit;
      padding: 0.375rem 0.75rem;
      border-radius: 4px;
      font-size: 0.875rem;
      cursor: pointer;
      transition: all 0.2s;
    }

    .toast-action-btn:hover {
      background: currentColor;
      color: white;
    }

    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    @keyframes progress {
      from {
        transform: scaleX(1);
      }
      to {
        transform: scaleX(0);
      }
    }

    @media (max-width: 640px) {
      .toast-container {
        left: 20px;
        right: 20px;
        max-width: none;
      }
    }
  `]
})
export class ToastContainerComponent implements OnInit, OnDestroy {
  toasts: Toast[] = [];
  private subscription?: Subscription;

  constructor(private toastService: ToastService) {}

  ngOnInit() {
    this.subscription = this.toastService.toasts.subscribe(toasts => {
      this.toasts = toasts;
    });
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }

  removeToast(id: string) {
    this.toastService.remove(id);
  }

  executeAction(toast: Toast) {
    if (toast.action) {
      toast.action.callback();
      this.removeToast(toast.id);
    }
  }

  getIconClass(type: string): string {
    const icons = {
      success: '✓',
      error: '✕',
      warning: '⚠',
      info: 'ℹ'
    };
    return icons[type as keyof typeof icons] || 'ℹ';
  }
}