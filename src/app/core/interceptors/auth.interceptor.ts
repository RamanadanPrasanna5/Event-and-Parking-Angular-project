import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const toastService = inject(ToastService);
  const token = authService.getToken();

  let authReq = req;
  if (token) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        // Do not toast or logout automatically if failing a login attempt itself
        if (!req.url.includes('/api/auth/login')) {
          toastService.error('Your session has expired. Please sign in again.', 'Unauthorized');
          authService.logout('/login');
        }
      } else if (error.status === 403) {
        toastService.error('You do not have permission to perform this action.', 'Access Forbidden');
      } else if (error.status === 0) {
        toastService.error('Unable to connect to the backend server. Please verify the API is running.', 'Connection Error');
      }

      return throwError(() => error);
    })
  );
};
