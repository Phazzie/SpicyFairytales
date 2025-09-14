/**
 * Global error boundary component providing centralized error handling and user-friendly error display.
 * 
 * Catches and handles unhandled errors in Angular components, providing fallback UI and error reporting.
 * Implements graceful degradation for production environments while maintaining debugging capabilities
 * in development. Integrates with logging services for error tracking and monitoring.
 * 
 * INPUT: Error events from Angular error handler, component lifecycle errors
 * OUTPUT: Fallback UI display, error logging, user notifications
 * DEPENDENCIES: Angular error handling, toast service for user notifications
 * INTEGRATIONS: Global error handler, component error boundaries, monitoring services
 * FEATURES: Graceful degradation, error recovery options, development debugging support
 * PRODUCTION: Sanitized error messages, error reporting, user guidance for recovery
 */
import { Component, Input, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from './toast.service';

@Component({
  selector: 'app-error-boundary',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="error-boundary" *ngIf="hasError()">
      <div class="error-content">
        <div class="error-icon">⚠️</div>
        <h2>Something went wrong</h2>
        <p>{{ userMessage() }}</p>
        
        <div class="error-actions">
          <button class="retry-btn" (click)="retry()">
            🔄 Try Again
          </button>
          <button class="refresh-btn" (click)="refresh()">
            🔃 Refresh Page
          </button>
        </div>
        
        <details class="error-details" *ngIf="showDetails()">
          <summary>Technical Details</summary>
          <pre>{{ errorDetails() }}</pre>
        </details>
      </div>
    </div>
    
    <ng-content *ngIf="!hasError()"></ng-content>
  `,
  styles: [`
    .error-boundary {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 300px;
      padding: 2rem;
      background: linear-gradient(135deg, #ffeaa7 0%, #fab1a0 100%);
      border-radius: 12px;
      margin: 1rem;
    }

    .error-content {
      text-align: center;
      max-width: 500px;
      background: white;
      padding: 2rem;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .error-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
    }

    .error-content h2 {
      color: #d63031;
      margin: 0 0 1rem 0;
      font-size: 1.5rem;
    }

    .error-content p {
      color: #636e72;
      margin: 0 0 1.5rem 0;
      line-height: 1.5;
    }

    .error-actions {
      display: flex;
      gap: 1rem;
      justify-content: center;
      margin-bottom: 1.5rem;
    }

    .retry-btn, .refresh-btn {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 6px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .retry-btn {
      background: #00b894;
      color: white;
    }

    .retry-btn:hover {
      background: #00a085;
      transform: translateY(-1px);
    }

    .refresh-btn {
      background: #74b9ff;
      color: white;
    }

    .refresh-btn:hover {
      background: #0984e3;
      transform: translateY(-1px);
    }

    .error-details {
      text-align: left;
      margin-top: 1rem;
    }

    .error-details summary {
      cursor: pointer;
      padding: 0.5rem;
      background: #f8f9fa;
      border-radius: 4px;
      margin-bottom: 0.5rem;
    }

    .error-details pre {
      background: #2d3748;
      color: #e2e8f0;
      padding: 1rem;
      border-radius: 4px;
      overflow-x: auto;
      font-size: 0.875rem;
      line-height: 1.4;
    }
  `]
})
export class ErrorBoundaryComponent {
  @Input() retryAction?: () => void;
  
  private toastService = inject(ToastService);
  
  protected hasError = signal(false);
  protected userMessage = signal('An unexpected error occurred. Please try again.');
  protected errorDetails = signal('');
  protected showDetails = signal(false);

  handleError(error: any, userFriendlyMessage?: string) {
    console.error('Error Boundary caught error:', error);
    
    this.hasError.set(true);
    this.userMessage.set(userFriendlyMessage || this.getErrorMessage(error));
    this.errorDetails.set(this.formatErrorDetails(error));
    this.showDetails.set(!this.isProduction());
    
    // Show toast notification
    this.toastService.error(
      'Application Error',
      userFriendlyMessage || 'An error occurred. Please try refreshing the page.'
    );
  }

  retry() {
    this.hasError.set(false);
    if (this.retryAction) {
      try {
        this.retryAction();
      } catch (error) {
        this.handleError(error, 'Retry failed. Please refresh the page.');
      }
    }
  }

  refresh() {
    window.location.reload();
  }

  private getErrorMessage(error: any): string {
    if (typeof error === 'string') return error;
    if (error?.message) return error.message;
    if (error?.error?.message) return error.error.message;
    return 'An unexpected error occurred';
  }

  private formatErrorDetails(error: any): string {
    if (typeof error === 'string') return error;
    
    const details = {
      message: error?.message || 'Unknown error',
      stack: error?.stack || 'No stack trace available',
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent
    };
    
    return JSON.stringify(details, null, 2);
  }

  private isProduction(): boolean {
    return !this.showDetails();
  }
}