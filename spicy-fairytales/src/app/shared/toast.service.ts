/**
 * Service for displaying temporary notification messages to users.
 */
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
  duration?: number;
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
  success(title: string, message: string, duration?: number) {
    return this.show({ type: 'success', title, message, duration });
  }

  error(title: string, message: string, duration?: number) {
    return this.show({ type: 'error', title, message, duration });
  }

  info(title: string, message: string, duration?: number) {
    return this.show({ type: 'info', title, message, duration });
  }

  warning(title: string, message: string, duration?: number) {
    return this.show({ type: 'warning', title, message, duration });
  }
}