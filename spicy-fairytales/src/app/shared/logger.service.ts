/**
 * Comprehensive logging service for debugging and troubleshooting.
 * 
 * Provides structured logging with visual console interface, filtering capabilities,
 * and persistent storage for debugging complex workflows and API interactions.
 * Implements the logging standards as outlined in the PRD for consistent error tracking.
 * 
 * INPUT: Log messages with levels, context, and metadata
 * OUTPUT: Structured log entries, visual debug console, persistent log storage
 * DEPENDENCIES: RxJS for reactive log stream, localStorage for persistence
 * INTEGRATIONS: Used by all services and components for debugging and monitoring
 * FEATURES: Multiple log levels, contextual metadata, visual filtering, export capability
 */
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'success' | 'api' | 'user';

export interface LogEntry {
  id: string;
  timestamp: Date;
  level: LogLevel;
  message: string;
  context?: string;
  metadata?: Record<string, any>;
  stack?: string;
}

export interface OperationLogger {
  debug(message: string, context?: any): void;
  info(message: string, context?: any): void;
  warn(message: string, context?: any): void;
  error(message: string, context?: any): void;
  success(message: string, context?: any): void;
  api(message: string, context?: any): void;
  user(message: string, context?: any): void;
}

@Injectable({
  providedIn: 'root'
})
export class LoggerService {
  private logs$ = new BehaviorSubject<LogEntry[]>([]);
  private maxLogs = 1000; // Keep last 1000 logs
  private persistToStorage = true;

  public logs = this.logs$.asObservable();

  constructor() {
    this.loadPersistedLogs();
    this.log('info', 'Logger service initialized', 'LoggerService');
  }

  log(level: LogLevel, message: string, context?: string, metadata?: Record<string, any>): void {
    const entry: LogEntry = {
      id: this.generateId(),
      timestamp: new Date(),
      level,
      message,
      context,
      metadata,
      stack: level === 'error' ? new Error().stack : undefined
    };

    const currentLogs = this.logs$.value;
    const updatedLogs = [...currentLogs, entry].slice(-this.maxLogs);
    this.logs$.next(updatedLogs);

    // Console output with styling
    this.consoleOutput(entry);

    // Persist to localStorage
    if (this.persistToStorage) {
      this.persistLogs(updatedLogs);
    }
  }

  createLogger(operation: string): OperationLogger {
    return {
      debug: (message: string, context?: any) => 
        this.log('debug', message, operation, context),
      info: (message: string, context?: any) => 
        this.log('info', message, operation, context),
      warn: (message: string, context?: any) => 
        this.log('warn', message, operation, context),
      error: (message: string, context?: any) => 
        this.log('error', message, operation, context),
      success: (message: string, context?: any) => 
        this.log('success', message, operation, context),
      api: (message: string, context?: any) => 
        this.log('api', message, operation, context),
      user: (message: string, context?: any) => 
        this.log('user', message, operation, context),
    };
  }

  // Convenience methods
  debug(message: string, context?: string, metadata?: Record<string, any>): void {
    this.log('debug', message, context, metadata);
  }

  info(message: string, context?: string, metadata?: Record<string, any>): void {
    this.log('info', message, context, metadata);
  }

  warn(message: string, context?: string, metadata?: Record<string, any>): void {
    this.log('warn', message, context, metadata);
  }

  error(message: string, context?: string, metadata?: Record<string, any>): void {
    this.log('error', message, context, metadata);
  }

  success(message: string, context?: string, metadata?: Record<string, any>): void {
    this.log('success', message, context, metadata);
  }

  api(message: string, context?: string, metadata?: Record<string, any>): void {
    this.log('api', message, context, metadata);
  }

  user(message: string, context?: string, metadata?: Record<string, any>): void {
    this.log('user', message, context, metadata);
  }

  // Log management methods
  clear(): void {
    this.logs$.next([]);
    if (this.persistToStorage && typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem('spicyfairytales_logs');
    }
    this.log('info', 'Logs cleared', 'LoggerService');
  }

  export(): string {
    const logs = this.logs$.value;
    return JSON.stringify(logs, null, 2);
  }

  filterLogs(level?: LogLevel, context?: string, searchTerm?: string): LogEntry[] {
    let filtered = this.logs$.value;

    if (level) {
      filtered = filtered.filter(log => log.level === level);
    }

    if (context) {
      filtered = filtered.filter(log => log.context?.includes(context));
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(log => 
        log.message.toLowerCase().includes(term) ||
        log.context?.toLowerCase().includes(term)
      );
    }

    return filtered;
  }

  getLogStats(): { [key in LogLevel]: number } {
    const logs = this.logs$.value;
    const stats = {
      debug: 0,
      info: 0,
      warn: 0,
      error: 0,
      success: 0,
      api: 0,
      user: 0
    };

    logs.forEach(log => {
      stats[log.level]++;
    });

    return stats;
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private consoleOutput(entry: LogEntry): void {
    const timestamp = entry.timestamp.toISOString();
    const contextStr = entry.context ? ` [${entry.context}]` : '';
    const metadataStr = entry.metadata ? ` ${JSON.stringify(entry.metadata)}` : '';

    switch (entry.level) {
      case 'debug':
        console.debug(`🔍 ${timestamp}${contextStr} ${entry.message}${metadataStr}`);
        break;
      case 'info':
        console.info(`ℹ️ ${timestamp}${contextStr} ${entry.message}${metadataStr}`);
        break;
      case 'warn':
        console.warn(`⚠️ ${timestamp}${contextStr} ${entry.message}${metadataStr}`);
        break;
      case 'error':
        console.error(`❌ ${timestamp}${contextStr} ${entry.message}${metadataStr}`);
        if (entry.stack) {
          console.error(entry.stack);
        }
        break;
      case 'success':
        console.log(`✅ ${timestamp}${contextStr} ${entry.message}${metadataStr}`);
        break;
      case 'api':
        console.log(`🌐 ${timestamp}${contextStr} ${entry.message}${metadataStr}`);
        break;
      case 'user':
        console.log(`👤 ${timestamp}${contextStr} ${entry.message}${metadataStr}`);
        break;
    }
  }

  private loadPersistedLogs(): void {
    if (!this.persistToStorage || typeof window === 'undefined' || !window.localStorage) return;

    try {
      const stored = localStorage.getItem('spicyfairytales_logs');
      if (stored) {
        const logs = JSON.parse(stored) as LogEntry[];
        // Convert string timestamps back to Date objects
        logs.forEach(log => {
          log.timestamp = new Date(log.timestamp);
        });
        this.logs$.next(logs.slice(-this.maxLogs));
      }
    } catch (error) {
      console.warn('Failed to load persisted logs:', error);
    }
  }

  private persistLogs(logs: LogEntry[]): void {
    if (typeof window === 'undefined' || !window.localStorage) return;
    
    try {
      localStorage.setItem('spicyfairytales_logs', JSON.stringify(logs));
    } catch (error) {
      console.warn('Failed to persist logs:', error);
    }
  }
}