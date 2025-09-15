/**
 * Enhanced HTTP interceptor for Spicy FairyTales application.
 * 
 * Provides comprehensive error handling, automatic retries, API key injection,
 * timeout management, and request/response logging. Critical component for
 * all external API communication with robust failure recovery.
 * 
 * FEATURES:
 * - Automatic API key injection for Grok and ElevenLabs
 * - Exponential backoff retry logic for transient failures
 * - Comprehensive error categorization and handling
 * - Request/response logging with security considerations
 * - Timeout management and cancellation
 * - Rate limiting and quota management
 */
import { HttpInterceptorFn, HttpErrorResponse, HttpEventType } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, throwError, timer, retry, catchError, timeout, finalize } from 'rxjs';
import { env } from './env';

/**
 * Error categories for better error handling and user messaging
 */
enum ErrorCategory {
  NETWORK = 'network',
  AUTHENTICATION = 'authentication', 
  RATE_LIMIT = 'rate_limit',
  VALIDATION = 'validation',
  SERVER = 'server',
  TIMEOUT = 'timeout',
  UNKNOWN = 'unknown'
}

/**
 * Enhanced error information with context and recovery suggestions
 */
interface EnhancedError {
  category: ErrorCategory;
  message: string;
  userMessage: string;
  retryable: boolean;
  statusCode?: number;
  originalError: any;
  timestamp: Date;
  url: string;
  context?: any;
}

/**
 * Request tracking for logging and debugging
 */
interface RequestTracker {
  url: string;
  method: string;
  startTime: number;
  retryCount: number;
  apiService?: string;
}

/**
 * Categorize HTTP errors for appropriate handling
 */
function categorizeError(error: HttpErrorResponse, url: string): EnhancedError {
  let category: ErrorCategory;
  let userMessage: string;
  let retryable = false;

  // Network/connectivity errors
  if (error.status === 0) {
    category = ErrorCategory.NETWORK;
    userMessage = 'Unable to connect to the service. Please check your internet connection.';
    retryable = true;
  }
  // Authentication errors
  else if (error.status === 401 || error.status === 403) {
    category = ErrorCategory.AUTHENTICATION;
    userMessage = 'Authentication failed. Please check your API configuration.';
    retryable = false;
  }
  // Rate limiting
  else if (error.status === 429) {
    category = ErrorCategory.RATE_LIMIT;
    userMessage = 'Service temporarily unavailable due to high demand. Please try again later.';
    retryable = true;
  }
  // Client errors
  else if (error.status >= 400 && error.status < 500) {
    category = ErrorCategory.VALIDATION;
    userMessage = 'Invalid request. Please check your input and try again.';
    retryable = false;
  }
  // Server errors
  else if (error.status >= 500) {
    category = ErrorCategory.SERVER;
    userMessage = 'Service temporarily unavailable. Please try again in a few moments.';
    retryable = true;
  }
  // Timeout or unknown
  else {
    category = ErrorCategory.UNKNOWN;
    userMessage = 'An unexpected error occurred. Please try again.';
    retryable = true;
  }

  return {
    category,
    message: error.message || `HTTP ${error.status}: ${error.statusText}`,
    userMessage,
    retryable,
    statusCode: error.status,
    originalError: error,
    timestamp: new Date(),
    url,
    context: {
      headers: error.headers,
      body: error.error
    }
  };
}

/**
 * Determine which API service is being called based on URL
 */
function getApiService(url: string): string | undefined {
  if (url.includes('api.x.ai')) return 'grok';
  if (url.includes('api.elevenlabs.io')) return 'elevenlabs';
  return undefined;
}

/**
 * Get appropriate API key for the service
 */
function getApiKeyForService(url: string): string | null {
  const service = getApiService(url);
  if (!service) return null;
  
  return env.getApiKey(service as 'grok' | 'elevenlabs');
}

/**
 * Log request/response for debugging (with security considerations)
 */
function logRequest(tracker: RequestTracker, event?: any): void {
  if (env.isProduction) return; // No logging in production
  
  const duration = Date.now() - tracker.startTime;
  const logData = {
    url: tracker.url.replace(/\/v1.*/, '/v1/***'), // Mask sensitive parts
    method: tracker.method,
    duration: `${duration}ms`,
    retryCount: tracker.retryCount,
    service: tracker.apiService,
    eventType: event?.type || 'unknown'
  };
  
  console.log(`🌐 HTTP ${tracker.method}:`, logData);
}

/**
 * Enhanced retry logic with exponential backoff
 */
function createRetryLogic(tracker: RequestTracker) {
  return retry<any>({
    count: env.maxRetries,
    delay: (error: HttpErrorResponse, retryIndex: number) => {
      const enhancedError = categorizeError(error, tracker.url);
      
      // Don't retry non-retryable errors
      if (!enhancedError.retryable) {
        throw enhancedError;
      }
      
      // Exponential backoff: 1s, 2s, 4s, 8s
      const delayMs = Math.min(1000 * Math.pow(2, retryIndex), 10000);
      
      tracker.retryCount = retryIndex + 1;
      console.log(`🔄 Retrying request (${tracker.retryCount}/${env.maxRetries}) in ${delayMs}ms:`, tracker.url);
      
      return timer(delayMs);
    }
  });
}

/**
 * Main HTTP interceptor function with comprehensive error handling
 */
export const httpInterceptor: HttpInterceptorFn = (req, next) => {
  const startTime = Date.now();
  const tracker: RequestTracker = {
    url: req.url,
    method: req.method,
    startTime,
    retryCount: 0,
    apiService: getApiService(req.url)
  };

  // Clone request for modification
  let modifiedReq = req;

  // Add API key authentication for external APIs
  const apiKey = getApiKeyForService(req.url);
  if (apiKey) {
    modifiedReq = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${apiKey}`)
    });
  }

  // Add ElevenLabs specific header
  if (tracker.apiService === 'elevenlabs') {
    const elevenLabsKey = env.getApiKey('elevenlabs');
    if (elevenLabsKey) {
      modifiedReq = modifiedReq.clone({
        headers: modifiedReq.headers.set('xi-api-key', elevenLabsKey)
      });
    }
  }

  // Add standard headers for external APIs
  if (tracker.apiService) {
    modifiedReq = modifiedReq.clone({
      headers: modifiedReq.headers
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .set('User-Agent', 'SpicyFairytales/1.0.0')
    });
  }

  // Log initial request
  logRequest(tracker);

  return next(modifiedReq).pipe(
    // Add timeout for all requests
    timeout(env.apiTimeout),
    
    // Add retry logic for retryable errors
    createRetryLogic(tracker),
    
    // Enhanced error handling
    catchError((error: any) => {
      // Handle timeout errors
      if (error.name === 'TimeoutError') {
        const timeoutError: EnhancedError = {
          category: ErrorCategory.TIMEOUT,
          message: `Request timed out after ${env.apiTimeout}ms`,
          userMessage: 'The request took too long to complete. Please try again.',
          retryable: true,
          originalError: error,
          timestamp: new Date(),
          url: tracker.url
        };
        
        console.error('⏱️ Request timeout:', timeoutError);
        return throwError(() => timeoutError);
      }

      // Handle HTTP errors
      if (error instanceof HttpErrorResponse) {
        const enhancedError = categorizeError(error, tracker.url);
        console.error(`❌ HTTP Error [${enhancedError.category}]:`, enhancedError);
        return throwError(() => enhancedError);
      }

      // Handle other errors
      const unknownError: EnhancedError = {
        category: ErrorCategory.UNKNOWN,
        message: error.message || 'Unknown error occurred',
        userMessage: 'An unexpected error occurred. Please try again.',
        retryable: false,
        originalError: error,
        timestamp: new Date(),
        url: tracker.url
      };

      console.error('💥 Unknown error:', unknownError);
      return throwError(() => unknownError);
    }),
    
    // Log successful responses
    finalize(() => {
      logRequest(tracker, { type: HttpEventType.Response });
    })
  );
};
