import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';
import { checkoutGuard } from './core/guards/checkout.guard';

export const routes: Routes = [
  // Temporary development test route for real API testing
  {
    path: 'test-events',
    loadComponent: () => import('./features/test-events/test-events.component').then(m => m.TestEventsComponent),
    title: 'API Read Test — Event Park'
  },

  // Admin Portal (Protected by adminGuard, rendered with AdminLayout)
  {
    path: 'admin',
    loadComponent: () => import('./shared/layout/admin-layout/admin-layout.component').then(m => m.AdminLayoutComponent),
    canActivate: [adminGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./features/admin/dashboard/dashboard.component').then(m => m.AdminDashboardComponent),
        title: 'Admin Dashboard — Event Park'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/admin/dashboard/dashboard.component').then(m => m.AdminDashboardComponent),
        title: 'Admin Dashboard — Event Park'
      },
      {
        path: 'events',
        loadComponent: () => import('./features/admin/events/events.component').then(m => m.EventsComponent),
        title: 'Manage Events — Event Park Admin'
      },
      {
        path: 'categories',
        loadComponent: () => import('./features/admin/categories/categories.component').then(m => m.CategoriesComponent),
        title: 'Manage Categories — Event Park Admin'
      },
      {
        path: 'venues',
        loadComponent: () => import('./features/admin/venues/venues.component').then(m => m.VenuesComponent),
        title: 'Manage Venues — Event Park Admin'
      },
      {
        path: 'seats',
        loadComponent: () => import('./features/admin/seats/seats.component').then(m => m.SeatsComponent),
        title: 'Manage Seat Maps — Event Park Admin'
      },
      {
        path: 'parking',
        loadComponent: () => import('./features/admin/parking-management/parking-management.component').then(m => m.ParkingManagementComponent),
        title: 'Manage Parking Bays — Event Park Admin'
      },
      {
        path: 'bookings',
        loadComponent: () => import('./features/customer/my-bookings/my-bookings.component').then(m => m.MyBookingsComponent),
        title: 'Manage Bookings — Event Park Admin'
      },
      {
        path: 'customers',
        loadComponent: () => import('./features/admin/users-management/users-management.component').then(m => m.UsersManagementComponent),
        title: 'Manage Customers — Event Park Admin'
      },
      {
        path: 'users',
        loadComponent: () => import('./features/admin/users-management/users-management.component').then(m => m.UsersManagementComponent),
        title: 'Manage Users — Event Park Admin'
      },
      {
        path: 'payments',
        loadComponent: () => import('./features/customer/payment-history/payment-history.component').then(m => m.PaymentHistoryComponent),
        title: 'Manage Payments — Event Park Admin'
      },
      {
        path: 'notifications',
        loadComponent: () => import('./features/customer/notifications/notifications.component').then(m => m.NotificationsComponent),
        title: 'Manage Notifications — Event Park Admin'
      }
    ]
  },

  // Public & Customer Routes (Rendered inside CustomerLayout)
  {
    path: '',
    loadComponent: () => import('./shared/layout/customer-layout/customer-layout.component').then(m => m.CustomerLayoutComponent),
    children: [
      // Landing Page
      {
        path: '',
        loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent),
        title: 'Eventro — Event & Parking Reservation'
      },

      // Auth Routes
      {
        path: 'login',
        loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent),
        title: 'Sign In — Event Park'
      },
      {
        path: 'register',
        loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent),
        title: 'Create Account — Event Park'
      },
      {
        path: 'verify-email',
        loadComponent: () => import('./features/auth/verify-email/verify-email.component').then(m => m.VerifyEmailComponent),
        title: 'Verify Email — Event Park'
      },
      {
        path: 'forgot-password',
        loadComponent: () => import('./features/auth/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent),
        title: 'Forgot Password — Event Park'
      },
      {
        path: 'reset-password',
        loadComponent: () => import('./features/auth/reset-password/reset-password.component').then(m => m.ResetPasswordComponent),
        title: 'Reset Password — Event Park'
      },

      // Customer Portal Specific Routes
      {
        path: 'customer/dashboard',
        loadComponent: () => import('./features/customer/dashboard/dashboard.component').then(m => m.CustomerDashboardComponent),
        canActivate: [authGuard],
        title: 'Customer Dashboard — Event Park'
      },
      {
        path: 'customer/profile',
        loadComponent: () => import('./features/customer/profile/profile.component').then(m => m.ProfileComponent),
        canActivate: [authGuard],
        title: 'My Profile — Event Park'
      },
      {
        path: 'customer/events',
        loadComponent: () => import('./features/customer/events/events.component').then(m => m.EventsComponent),
        title: 'Browse Events — Event Park'
      },
      {
        path: 'customer/events/:id',
        loadComponent: () => import('./features/customer/event-details/event-details.component').then(m => m.EventDetailsComponent),
        title: 'Event Details — Event Park'
      },
      {
        path: 'customer/event-details/:id',
        loadComponent: () => import('./features/customer/event-details/event-details.component').then(m => m.EventDetailsComponent),
        title: 'Event Details — Event Park'
      },
      {
        path: 'customer/seat-selection/:id',
        loadComponent: () => import('./features/customer/seat-selection/seat-selection.component').then(m => m.SeatSelectionComponent),
        title: 'Select Seats — Event Park'
      },
      {
        path: 'customer/parking-selection/:id',
        loadComponent: () => import('./features/customer/parking-selection/parking-selection.component').then(m => m.ParkingSelectionComponent),
        title: 'Select Parking Bay — Event Park'
      },
      {
        path: 'customer/booking-summary',
        loadComponent: () => import('./features/customer/booking-summary/booking-summary.component').then(m => m.BookingSummaryComponent),
        canActivate: [authGuard, checkoutGuard],
        title: 'Booking Summary — Event Park'
      },
      {
        path: 'customer/payment',
        loadComponent: () => import('./features/customer/payment/payment.component').then(m => m.PaymentComponent),
        canActivate: [authGuard],
        title: 'Payment — Event Park'
      },
      {
        path: 'customer/booking-confirmation',
        loadComponent: () => import('./features/customer/booking-confirmation/booking-confirmation.component').then(m => m.BookingConfirmationComponent),
        title: 'Booking Confirmation — Event Park'
      },
      {
        path: 'customer/my-bookings',
        loadComponent: () => import('./features/customer/my-bookings/my-bookings.component').then(m => m.MyBookingsComponent),
        canActivate: [authGuard],
        title: 'My Bookings — Event Park'
      },
      {
        path: 'customer/payment-history',
        loadComponent: () => import('./features/customer/payment-history/payment-history.component').then(m => m.PaymentHistoryComponent),
        canActivate: [authGuard],
        title: 'Payment History — Event Park'
      },
      {
        path: 'customer/receipt/:id',
        loadComponent: () => import('./features/customer/receipt/receipt.component').then(m => m.ReceiptComponent),
        canActivate: [authGuard],
        title: 'Receipt — Event Park'
      },
      {
        path: 'customer/notifications',
        loadComponent: () => import('./features/customer/notifications/notifications.component').then(m => m.NotificationsComponent),
        canActivate: [authGuard],
        title: 'Notifications — Event Park'
      },

      // Canonical URLs and Legacy Aliases
      {
        path: 'events',
        loadComponent: () => import('./features/customer/events/events.component').then(m => m.EventsComponent),
        title: 'Browse Events — Event Park'
      },
      {
        path: 'events/:id',
        loadComponent: () => import('./features/customer/event-details/event-details.component').then(m => m.EventDetailsComponent),
        title: 'Event Details — Event Park'
      },
      {
        path: 'events/:id/seats',
        loadComponent: () => import('./features/customer/seat-selection/seat-selection.component').then(m => m.SeatSelectionComponent),
        title: 'Select Seats — Event Park'
      },
      {
        path: 'events/:id/parking',
        loadComponent: () => import('./features/customer/parking-selection/parking-selection.component').then(m => m.ParkingSelectionComponent),
        title: 'Select Parking Bay — Event Park'
      },
      {
        path: 'reservations/make-reservation',
        loadComponent: () => import('./features/customer/booking-summary/booking-summary.component').then(m => m.BookingSummaryComponent),
        canActivate: [authGuard, checkoutGuard],
        title: 'Confirm Reservation & Payment — Event Park'
      },
      {
        path: 'reservations/payment',
        loadComponent: () => import('./features/customer/payment/payment.component').then(m => m.PaymentComponent),
        canActivate: [authGuard],
        title: 'Payment — Event Park'
      },
      {
        path: 'reservations/success',
        loadComponent: () => import('./features/customer/booking-confirmation/booking-confirmation.component').then(m => m.BookingConfirmationComponent),
        title: 'Booking Confirmed — Event Park'
      },
      {
        path: 'reservations/my-reservations',
        loadComponent: () => import('./features/customer/my-bookings/my-bookings.component').then(m => m.MyBookingsComponent),
        canActivate: [authGuard],
        title: 'My Reservations — Event Park'
      },
      {
        path: 'profile',
        loadComponent: () => import('./features/customer/profile/profile.component').then(m => m.ProfileComponent),
        canActivate: [authGuard],
        title: 'My Profile — Event Park'
      }
    ]
  },

  // Fallback Wildcard
  {
    path: '**',
    redirectTo: ''
  }
];
