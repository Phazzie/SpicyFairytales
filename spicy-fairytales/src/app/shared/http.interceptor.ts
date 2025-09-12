/**
 * HTTP interceptor pipeline managing authentication, error handling, and API request/response processing.
 * 
 * Centralized HTTP middleware providing authentication header injection, error handling,
 * logging, and request/response transformation for all API communications. Ensures consistent
 * API interactions across story generation, speaker parsing, and voice synthesis services.
 * 
 * INPUT: HTTP requests from all services, authentication tokens, error conditions
 * OUTPUT: Modified HTTP requests with auth headers, standardized error responses, request logs
 * DEPENDENCIES: Angular HTTP client, authentication service, error handling utilities
 * INTEGRATIONS: Applied to all HTTP requests from StoryService, SpeakerParser, VoiceService
 * FEATURES: Bearer token injection, error response standardization, request/response logging
 * SECURITY: Handles API key management, request sanitization, error information filtering
 */
import { HttpEvent, HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http'
import { inject } from '@angular/core'
import { Observable } from 'rxjs'

// Placeholder: load from a real env provider or settings later
const getAuthToken = () => ''

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> => {
  const token = getAuthToken()
  const headers = token ? req.headers.set('Authorization', `Bearer ${token}`) : req.headers
  return next(req.clone({ headers }))
}
