/**
 * @fileoverview HTTP interceptor for API requests.
 *
 * ## Architecture Context
 * This interceptor is a key part of the application's error handling and
 * resilience strategy. It sits between the application's HTTP calls and the
 * backend, applying global policies to all outgoing requests.
 *
 * ## Information Flow
 * 1. When a service (e.g., `HttpStoryService`) makes an HTTP request, this
 *    interceptor catches it.
 * 2. It adds a timeout to prevent requests from hanging indefinitely.
 * 3. It implements a retry mechanism with exponential backoff to handle
 *    transient network errors gracefully.
 * 4. The request then proceeds to the network.
 *
 * ## Contract Compliance
 * - Implements the `HttpInterceptor` interface from `@angular/common/http`.
 * - It is provided via the `provideHttpClient` function in `app.config.ts`.
 */
import { HttpEvent, HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http'
import { inject } from '@angular/core'
import { Observable, timer } from 'rxjs'
import { retry, timeout } from 'rxjs/operators'

const MAX_RETRIES = 2
const RETRY_DELAY_MS = 1000
const TIMEOUT_MS = 15000 // 15 seconds

// Placeholder: load from a real env provider or settings later
const getAuthToken = () => ''

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> => {
  const token = getAuthToken()
  const headers = token ? req.headers.set('Authorization', `Bearer ${token}`) : req.headers
  return next(req.clone({ headers }))
}

export const apiRequestInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    timeout(TIMEOUT_MS),
    retry({
      count: MAX_RETRIES,
      delay: (error, retryCount) => {
        // Use exponential backoff for retries
        return timer(RETRY_DELAY_MS * Math.pow(2, retryCount - 1))
      },
    }),
  )
}
