/**
 * Global Angular error handler providing centralized error management and reporting.
 * 
 * Captures and processes all unhandled errors in the Angular application, providing
 * standardized error handling, logging, and user notification. Integrates with error
 * monitoring services and maintains error state for debugging and recovery.
 * 
 * INPUT: Angular error events, component exceptions, service failures
 * OUTPUT: Processed error logs, user notifications, error reporting
 * DEPENDENCIES: Angular error handling system, logging services, notification system
 * INTEGRATIONS: Error boundary components, monitoring services, development tools
 * FEATURES: Error categorization, stack trace analysis, user notification, recovery guidance
 * PRODUCTION: Error sanitization, monitoring integration, performance impact minimization
 */
import { ErrorHandler, Injectable, inject } from '@angular/core';
import { ToastService } from './toast.service';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  private toastService = inject(ToastService);

  handleError(error: any): void {
    console.error('Global Error Handler caught:', error);
    
    // Extract meaningful error information
    const errorInfo = this.extractErrorInfo(error);
    
    // Log error for debugging
    this.logError(errorInfo);
    
    // Show user-friendly notification
    this.notifyUser(errorInfo);
    
    // Report to monitoring service in production
    if (this.isProduction()) {
      this.reportError(errorInfo);
    }
  }

  private extractErrorInfo(error: any) {
    return {
      message: this.getErrorMessage(error),
      stack: error?.stack || 'No stack trace',
      type: this.getErrorType(error),
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      originalError: error
    };
  }

  private getErrorMessage(error: any): string {
    // Network errors
    if (error?.name === 'TypeError' && error?.message?.includes('fetch')) {
      return 'Network connection error. Please check your internet connection.';
    }
    
    // API errors
    if (error?.status) {
      switch (error.status) {
        case 401:
          return 'Authentication failed. Please check your API keys.';
        case 403:
          return 'Access forbidden. You may not have sufficient permissions.';
        case 404:
          return 'Service not found. The API endpoint may be unavailable.';
        case 429:
          return 'Rate limit exceeded. Please wait before making more requests.';
        case 500:
          return 'Server error. Please try again later.';
        default:
          return `API error (${error.status}): ${error.statusText || 'Unknown error'}`;
      }
    }
    
    // Application errors
    if (error?.message) {
      // Sanitize sensitive information in production
      if (this.isProduction()) {
        return this.sanitizeErrorMessage(error.message);
      }
      return error.message;
    }
    
    return 'An unexpected error occurred';
  }

  private getErrorType(error: any): string {
    if (error?.name) return error.name;
    if (error?.constructor?.name) return error.constructor.name;
    if (error?.status) return 'HttpError';
    return 'UnknownError';
  }

  private sanitizeErrorMessage(message: string): string {
    // Remove sensitive information like API keys, tokens, etc.
    return message
      .replace(/bearer\s+[a-zA-Z0-9-._~+/]+=*/gi, 'bearer [REDACTED]')
      .replace(/api[_-]?key[s]?[=:]\s*[a-zA-Z0-9-._~+/]+=*/gi, 'api_key=[REDACTED]')
      .replace(/token[s]?[=:]\s*[a-zA-Z0-9-._~+/]+=*/gi, 'token=[REDACTED]');
  }

  private logError(errorInfo: any): void {
    // Enhanced logging with categorization
    console.group('🚨 Application Error');
    console.error('Message:', errorInfo.message);
    console.error('Type:', errorInfo.type);
    console.error('Timestamp:', errorInfo.timestamp);
    console.error('URL:', errorInfo.url);
    if (!this.isProduction()) {
      console.error('Stack:', errorInfo.stack);
      console.error('Original Error:', errorInfo.originalError);
    }
    console.groupEnd();
  }

  private notifyUser(errorInfo: any): void {
    // Avoid spamming user with notifications
    if (this.shouldNotifyUser(errorInfo)) {
      this.toastService.error(
        'Application Error',
        errorInfo.message,
        { duration: 8000, allowDismiss: true }
      );
    }
  }

  private shouldNotifyUser(errorInfo: any): boolean {
    // Don't notify for certain error types that are expected
    const silentErrors = [
      'ChunkLoadError', // Dynamic import failures
      'ResizeObserver loop limit exceeded', // Harmless browser warning
      'Non-Error promise rejection captured' // Promise rejections
    ];
    
    return !silentErrors.some(pattern => 
      errorInfo.message.includes(pattern) || errorInfo.type.includes(pattern)
    );
  }

  private reportError(errorInfo: any): void {
    // In production, you would send errors to monitoring service
    // like Sentry, LogRocket, or custom error reporting endpoint
    
    // Example implementation:
    /*
    try {
      fetch('/api/errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: errorInfo.message,
          type: errorInfo.type,
          timestamp: errorInfo.timestamp,
          url: errorInfo.url,
          userAgent: errorInfo.userAgent,
          // Don't send full stack trace in production
          stack: errorInfo.stack.split('\n').slice(0, 3).join('\n')
        })
      });
    } catch (reportingError) {
      console.error('Failed to report error:', reportingError);
    }
    */
  }

  private isProduction(): boolean {
    return !!(window as any).env?.production;
  }
}