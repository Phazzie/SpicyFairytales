/**
 * Centralized notification service for user feedback and system status communication.
 * 
 * Manages application-wide toast notifications for user feedback, error reporting, and
 * status updates. Provides programmatic notification creation with auto-dismissal,
 * action buttons, and accessibility support for comprehensive user communication.
 * 
 * INPUT: Notification requests (type, title, message, duration, actions)
 * OUTPUT: Toast notification queue, display events, dismissal events
 * DEPENDENCIES: RxJS for reactive notification management, Angular DI for global availability
 * INTEGRATIONS: Consumed by all components for user feedback, displayed by toast container
 * FEATURES: Multiple notification types, auto-dismissal, manual actions, queue management
 * ACCESSIBILITY: Screen reader announcements, keyboard navigation, focus management
 */
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
  duration?: number;
  allowDismiss?: boolean;
  action?: {
    label: string;
    callback: () => void;
  };
}

export interface ToastOptions {
  duration?: number;
  allowDismiss?: boolean;
  action?: {
    label: string;
    callback: () => void;
  };
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toasts$ = new BehaviorSubject<Toast[]>([]);
  public toasts = this.toasts$.asObservable();

  show(toast: Omit<Toast, 'id'>) {
    const newToast: Toast = {
      ...toast,
      id: Date.now().toString(),
      duration: toast.duration ?? 5000
    };

    const currentToasts = this.toasts$.value;
    this.toasts$.next([...currentToasts, newToast]);

    // Auto remove after duration
    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        this.remove(newToast.id);
      }, newToast.duration);
    }

    return newToast.id;
  }

  remove(id: string) {
    const currentToasts = this.toasts$.value;
    this.toasts$.next(currentToasts.filter(toast => toast.id !== id));
  }

  clear() {
    this.toasts$.next([]);
  }

  // Convenience methods
  success(title: string, message: string, options?: ToastOptions) {
    return this.show({ 
      type: 'success', 
      title, 
      message, 
      duration: options?.duration,
      allowDismiss: options?.allowDismiss,
      action: options?.action
    });
  }

  error(title: string, message: string, options?: ToastOptions) {
    return this.show({ 
      type: 'error', 
      title, 
      message, 
      duration: options?.duration || 8000, // Longer duration for errors
      allowDismiss: options?.allowDismiss ?? true,
      action: options?.action
    });
  }

  info(title: string, message: string, options?: ToastOptions) {
    return this.show({ 
      type: 'info', 
      title, 
      message, 
      duration: options?.duration,
      allowDismiss: options?.allowDismiss,
      action: options?.action
    });
  }

  warning(title: string, message: string, options?: ToastOptions) {
    return this.show({ 
      type: 'warning', 
      title, 
      message, 
      duration: options?.duration,
      allowDismiss: options?.allowDismiss,
      action: options?.action
    });
  }
}