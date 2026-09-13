import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';

export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const toastService = inject(ToastService);

  if (authService.isLoggedIn() && authService.isAdmin()) {
    return true;
  }

  toastService.error('You do not have administrative privileges to access this area.', 'Access Denied');
  return router.createUrlTree(['/']);
};
