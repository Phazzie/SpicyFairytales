import { HttpEvent, HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http'
import { Observable, retry, timeout, catchError, throwError, timer } from 'rxjs'

// Placeholder: load from a real env provider or settings later
const getAuthToken = () => ''

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> => {
  const token = getAuthToken()
  const headers = token ? req.headers.set('Authorization', `Bearer ${token}`) : req.headers
  return next(req.clone({ headers }))
}

export const apiRequestInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> => {
  return next(req).pipe(
    timeout(30000), // 30 second timeout
    retry({
      count: 3,
      delay: (error, retryCount) => {
        // Exponential backoff: 1s, 2s, 4s
        const delay = Math.pow(2, retryCount - 1) * 1000
        console.warn(`API request failed (attempt ${retryCount}), retrying in ${delay}ms:`, error)
        return timer(delay)
      }
    }),
    catchError((error) => {
      console.error('API request failed after retries:', error)
      return throwError(() => error)
    })
  )
}
