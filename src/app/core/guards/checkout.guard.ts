import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { BookingStateService } from '../services/booking-state.service';
import { ToastService } from '../services/toast.service';

export const checkoutGuard: CanActivateFn = () => {
  const bookingState = inject(BookingStateService);
  const router = inject(Router);
  const toastService = inject(ToastService);

  if (bookingState.hasSelection() || bookingState.activeHold()) {
    return true;
  }

  toastService.warning('Please select at least one seat before proceeding to reservation summary and checkout.', 'No Seats Selected');
  return router.createUrlTree(['/events']);
};
