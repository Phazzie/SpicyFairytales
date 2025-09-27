/**
 * Visual debug console component for real-time log monitoring and troubleshooting.
 * 
 * Provides an interactive interface for viewing application logs, filtering by level/context,
 * and exporting debug information. Essential for identifying issues when things don't work
 * as intended, as requested in the requirements.
 * 
 * INPUT: Log entries from LoggerService, user filter interactions
 * OUTPUT: Filtered log display, export functionality, real-time log streaming
 * DEPENDENCIES: LoggerService for log data, CommonModule for template directives
 * INTEGRATIONS: Embedded in testing section for comprehensive debugging capability
 * FEATURES: Real-time updates, filtering, search, export, color-coded levels, collapsible
 */
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { LoggerService, LogEntry, LogLevel } from './logger.service';

@Component({
  selector: 'app-debug-console',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="debug-console" [class.expanded]="isExpanded">
      <div class="console-header" (click)="toggleExpanded()">
        <div class="header-left">
          <span class="console-icon">🔍</span>
          <h4>Debug Console</h4>
          <span class="log-count">{{ filteredLogs.length }} logs</span>
        </div>
        <div class="header-right">
          <button class="btn-icon" (click)="exportLogs($event)" title="Export Logs">
            📥
          </button>
          <button class="btn-icon" (click)="clearLogs($event)" title="Clear Logs">
            🗑️
          </button>
          <button class="btn-icon expand-toggle" [class.expanded]="isExpanded">
            {{ isExpanded ? '🔽' : '🔼' }}
          </button>
        </div>
      </div>
      
      <div class="console-content" *ngIf="isExpanded">
        <!-- Filters -->
        <div class="console-filters">
          <div class="filter-group">
            <label>Level:</label>
            <select [(ngModel)]="selectedLevel" (change)="applyFilters()">
              <option value="">All Levels</option>
              <option value="debug">Debug</option>
              <option value="info">Info</option>
              <option value="warn">Warning</option>
              <option value="error">Error</option>
              <option value="success">Success</option>
              <option value="api">API</option>
              <option value="user">User</option>
            </select>
          </div>
          
          <div class="filter-group">
            <label>Context:</label>
            <input 
              type="text" 
              [(ngModel)]="contextFilter" 
              (input)="applyFilters()"
              placeholder="Filter by context..."
              class="context-input"
            />
          </div>
          
          <div class="filter-group">
            <label>Search:</label>
            <input 
              type="text" 
              [(ngModel)]="searchTerm" 
              (input)="applyFilters()"
              placeholder="Search messages..."
              class="search-input"
            />
          </div>
          
          <div class="filter-stats">
            <span class="stat-item" *ngFor="let level of logLevels" 
                  [class]="'level-' + level"
                  [title]="level + ' logs'">
              {{ level }}: {{ logStats[level] }}
            </span>
          </div>
        </div>
        
        <!-- Log entries -->
        <div class="console-logs" #logsContainer>
          <div 
            *ngFor="let log of filteredLogs; trackBy: trackByLogId" 
            class="log-entry"
            [class]="'level-' + log.level"
          >
            <div class="log-main">
              <span class="log-timestamp">{{ formatTimestamp(log.timestamp) }}</span>
              <span class="log-level" [class]="'level-' + log.level">
                {{ getLevelIcon(log.level) }} {{ log.level.toUpperCase() }}
              </span>
              <span class="log-context" *ngIf="log.context">[{{ log.context }}]</span>
              <span class="log-message">{{ log.message }}</span>
              <button 
                *ngIf="log.metadata || log.stack" 
                class="toggle-details"
                (click)="toggleLogDetails(log.id)"
                [class.expanded]="expandedLogs.has(log.id)"
              >
                {{ expandedLogs.has(log.id) ? '🔽' : '🔼' }}
              </button>
            </div>
            
            <div class="log-details" *ngIf="expandedLogs.has(log.id)">
              <div class="metadata" *ngIf="log.metadata">
                <h5>Metadata:</h5>
                <pre>{{ formatMetadata(log.metadata) }}</pre>
              </div>
              <div class="stack-trace" *ngIf="log.stack">
                <h5>Stack Trace:</h5>
                <pre>{{ log.stack }}</pre>
              </div>
            </div>
          </div>
          
          <div *ngIf="filteredLogs.length === 0" class="no-logs">
            <span class="no-logs-icon">📝</span>
            <p>No logs match the current filters</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .debug-console {
      background: var(--card-bg);
      border: 2px solid var(--border-color);
      border-radius: var(--space-md);
      margin-top: var(--space-lg);
      overflow: hidden;
      transition: all var(--transition-normal);
      box-shadow: var(--shadow-lg);
    }

    .debug-console.expanded {
      border-color: var(--primary-500);
      box-shadow: 
        var(--shadow-xl),
        0 0 20px rgba(99, 102, 241, 0.2);
    }

    .console-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--space-md) var(--space-lg);
      background: linear-gradient(135deg, #2d3748 0%, #4a5568 100%);
      color: white;
      cursor: pointer;
      transition: all var(--transition-normal);
    }

    .console-header:hover {
      background: linear-gradient(135deg, #1a202c 0%, #2d3748 100%);
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: var(--space-md);
    }

    .console-icon {
      font-size: 1.25rem;
    }

    .console-header h4 {
      margin: 0;
      font-size: 1.1rem;
      font-weight: 600;
    }

    .log-count {
      background: rgba(255, 255, 255, 0.2);
      padding: 0.25rem 0.5rem;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 500;
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: var(--space-sm);
    }

    .btn-icon {
      background: rgba(255, 255, 255, 0.1);
      border: none;
      color: white;
      padding: 0.5rem;
      border-radius: 6px;
      cursor: pointer;
      transition: all var(--transition-fast);
      font-size: 1rem;
    }

    .btn-icon:hover {
      background: rgba(255, 255, 255, 0.2);
      transform: translateY(-1px);
    }

    .expand-toggle.expanded {
      background: var(--primary-500);
    }

    .console-content {
      max-height: 400px;
      display: flex;
      flex-direction: column;
    }

    .console-filters {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-md);
      align-items: center;
      padding: var(--space-md) var(--space-lg);
      background: rgba(0, 0, 0, 0.02);
      border-bottom: 1px solid var(--border-color);
    }

    .filter-group {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .filter-group label {
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--text-secondary);
      white-space: nowrap;
    }

    .filter-group select,
    .context-input,
    .search-input {
      padding: 0.375rem 0.75rem;
      border: 1px solid var(--border-color);
      border-radius: 6px;
      font-size: 0.875rem;
      background: var(--card-bg);
      color: var(--text-color);
      min-width: 120px;
    }

    .filter-stats {
      display: flex;
      gap: var(--space-sm);
      margin-left: auto;
      flex-wrap: wrap;
    }

    .stat-item {
      padding: 0.25rem 0.5rem;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 500;
      white-space: nowrap;
    }

    .stat-item.level-debug { background: rgba(156, 163, 175, 0.2); color: #6b7280; }
    .stat-item.level-info { background: rgba(59, 130, 246, 0.2); color: #3b82f6; }
    .stat-item.level-warn { background: rgba(245, 158, 11, 0.2); color: #f59e0b; }
    .stat-item.level-error { background: rgba(239, 68, 68, 0.2); color: #ef4444; }
    .stat-item.level-success { background: rgba(34, 197, 94, 0.2); color: #22c55e; }
    .stat-item.level-api { background: rgba(168, 85, 247, 0.2); color: #a855f7; }
    .stat-item.level-user { background: rgba(236, 72, 153, 0.2); color: #ec4899; }

    .console-logs {
      flex: 1;
      overflow-y: auto;
      max-height: 300px;
      padding: var(--space-sm);
    }

    .log-entry {
      margin-bottom: var(--space-sm);
      border: 1px solid transparent;
      border-radius: 6px;
      overflow: hidden;
      transition: all var(--transition-fast);
    }

    .log-entry:hover {
      border-color: var(--border-color);
      background: rgba(0, 0, 0, 0.02);
    }

    .log-main {
      display: flex;
      align-items: center;
      gap: var(--space-sm);
      padding: 0.5rem var(--space-sm);
      font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
      font-size: 0.875rem;
      line-height: 1.4;
    }

    .log-timestamp {
      color: var(--text-muted);
      font-size: 0.75rem;
      white-space: nowrap;
    }

    .log-level {
      font-weight: 600;
      padding: 0.125rem 0.5rem;
      border-radius: 12px;
      font-size: 0.75rem;
      white-space: nowrap;
    }

    .log-level.level-debug { background: rgba(156, 163, 175, 0.2); color: #6b7280; }
    .log-level.level-info { background: rgba(59, 130, 246, 0.2); color: #3b82f6; }
    .log-level.level-warn { background: rgba(245, 158, 11, 0.2); color: #f59e0b; }
    .log-level.level-error { background: rgba(239, 68, 68, 0.2); color: #ef4444; }
    .log-level.level-success { background: rgba(34, 197, 94, 0.2); color: #22c55e; }
    .log-level.level-api { background: rgba(168, 85, 247, 0.2); color: #a855f7; }
    .log-level.level-user { background: rgba(236, 72, 153, 0.2); color: #ec4899; }

    .log-context {
      color: var(--text-secondary);
      font-weight: 500;
      font-size: 0.8rem;
    }

    .log-message {
      flex: 1;
      color: var(--text-color);
    }

    .toggle-details {
      background: none;
      border: none;
      color: var(--text-secondary);
      cursor: pointer;
      padding: 0.25rem;
      border-radius: 4px;
      transition: all var(--transition-fast);
    }

    .toggle-details:hover {
      background: var(--hover-bg);
      color: var(--text-color);
    }

    .log-details {
      padding: var(--space-sm) var(--space-md);
      background: rgba(0, 0, 0, 0.05);
      border-top: 1px solid var(--border-color);
    }

    .log-details h5 {
      margin: 0 0 0.5rem 0;
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--text-secondary);
    }

    .log-details pre {
      background: rgba(0, 0, 0, 0.05);
      padding: var(--space-sm);
      border-radius: 4px;
      font-size: 0.8rem;
      overflow-x: auto;
      white-space: pre-wrap;
      word-wrap: break-word;
      margin: 0;
      color: var(--text-color);
      border: 1px solid var(--border-color);
    }

    .no-logs {
      text-align: center;
      padding: var(--space-xl);
      color: var(--text-muted);
    }

    .no-logs-icon {
      font-size: 2rem;
      margin-bottom: var(--space-md);
      display: block;
    }

    .no-logs p {
      margin: 0;
      font-style: italic;
    }

    /* Responsive design */
    @media (max-width: 768px) {
      .console-filters {
        flex-direction: column;
        align-items: stretch;
        gap: var(--space-sm);
      }

      .filter-group {
        flex-direction: column;
        align-items: stretch;
      }

      .filter-stats {
        margin-left: 0;
        justify-content: center;
      }

      .log-main {
        flex-direction: column;
        align-items: stretch;
        gap: 0.25rem;
      }

      .log-timestamp,
      .log-level,
      .log-context {
        align-self: flex-start;
      }
    }
  `]
})
export class DebugConsoleComponent implements OnInit, OnDestroy {
  isExpanded = false;
  selectedLevel: LogLevel | '' = '';
  contextFilter = '';
  searchTerm = '';
  
  filteredLogs: LogEntry[] = [];
  expandedLogs = new Set<string>();
  logStats: { [key in LogLevel]: number } = {
    debug: 0, info: 0, warn: 0, error: 0, success: 0, api: 0, user: 0
  };
  
  logLevels: LogLevel[] = ['debug', 'info', 'warn', 'error', 'success', 'api', 'user'];
  
  private subscription?: Subscription;

  constructor(private logger: LoggerService) {}

  ngOnInit(): void {
    this.subscription = this.logger.logs.subscribe(logs => {
      this.logStats = this.logger.getLogStats();
      this.applyFilters();
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  toggleExpanded(): void {
    this.isExpanded = !this.isExpanded;
    this.logger.user(`Debug console ${this.isExpanded ? 'expanded' : 'collapsed'}`, 'DebugConsole');
  }

  applyFilters(): void {
    this.filteredLogs = this.logger.filterLogs(
      this.selectedLevel || undefined,
      this.contextFilter || undefined,
      this.searchTerm || undefined
    );
  }

  toggleLogDetails(logId: string): void {
    if (this.expandedLogs.has(logId)) {
      this.expandedLogs.delete(logId);
    } else {
      this.expandedLogs.add(logId);
    }
  }

  exportLogs(event: Event): void {
    event.stopPropagation();
    const logsJson = this.logger.export();
    const blob = new Blob([logsJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `spicyfairytales-logs-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    this.logger.user('Logs exported to file', 'DebugConsole');
  }

  clearLogs(event: Event): void {
    event.stopPropagation();
    this.logger.clear();
    this.expandedLogs.clear();
    this.logger.user('Debug console logs cleared', 'DebugConsole');
  }

  formatTimestamp(timestamp: Date): string {
    return timestamp.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit',
      fractionalSecondDigits: 3
    });
  }

  formatMetadata(metadata: Record<string, any>): string {
    return JSON.stringify(metadata, null, 2);
  }

  getLevelIcon(level: LogLevel): string {
    const icons: { [key in LogLevel]: string } = {
      debug: '🔍',
      info: 'ℹ️',
      warn: '⚠️',
      error: '❌',
      success: '✅',
      api: '🌐',
      user: '👤'
    };
    return icons[level];
  }

  trackByLogId(index: number, log: LogEntry): string {
    return log.id;
  }
}