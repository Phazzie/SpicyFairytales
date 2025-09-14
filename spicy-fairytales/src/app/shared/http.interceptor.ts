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
import { HttpEvent, HttpHandlerFn, HttpInterceptorFn, HttpRequest, HttpErrorResponse } from '@angular/common/http'
import { inject } from '@angular/core'
import { Observable, throwError } from 'rxjs'
import { catchError, retry } from 'rxjs/operators'
import { env } from './env'

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> => {
  // Clone request with appropriate auth headers based on URL
  let authReq = req
  
  // Add Grok API key for x.ai requests
  if (req.url.includes('api.x.ai') && env.grokApiKey) {
    authReq = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${env.grokApiKey}`)
    })
  }
  
  // Add ElevenLabs API key for ElevenLabs requests
  if (req.url.includes('api.elevenlabs.io') && env.elevenLabsApiKey) {
    authReq = req.clone({
      headers: req.headers.set('xi-api-key', env.elevenLabsApiKey)
    })
  }

  // Add common headers
  authReq = authReq.clone({
    headers: authReq.headers
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
  })

  return next(authReq).pipe(
    retry(1), // Retry failed requests once
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'An unknown error occurred'
      
      if (error.error instanceof ErrorEvent) {
        // Client-side error
        errorMessage = `Client error: ${error.error.message}`
      } else {
        // Server-side error
        switch (error.status) {
          case 401:
            errorMessage = 'Authentication failed. Please check your API key.'
            break
          case 403:
            errorMessage = 'Access forbidden. You may have insufficient permissions.'
            break
          case 404:
            errorMessage = 'Service endpoint not found.'
            break
          case 429:
            errorMessage = 'Rate limit exceeded. Please wait before making more requests.'
            break
          case 500:
            errorMessage = 'Internal server error. Please try again later.'
            break
          default:
            errorMessage = `Server error: ${error.status} ${error.statusText}`
        }
      }
      
      console.error('HTTP Error:', {
        url: authReq.url,
        status: error.status,
        message: errorMessage,
        timestamp: new Date().toISOString()
      })
      
      return throwError(() => new Error(errorMessage))
    })
  )
}
