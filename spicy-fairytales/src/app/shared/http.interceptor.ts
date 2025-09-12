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
