import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';
import { checkoutGuard } from './core/guards/checkout.guard';

export const routes: Routes = [
  // 1. SPLASH SCREEN (Standalone fullscreen view)
  {
    path: 'splash',
    loadComponent: () => import('./features/splash/splash.component').then(m => m.SplashComponent),
    title: 'EventPark — Event & Parking'
  },

  // 2. PUBLIC & CUSTOMER APPLICATION (Rendered with CustomerLayout)
  {
    path: '',
    loadComponent: () => import('./shared/layout/customer-layout/customer-layout.component').then(m => m.CustomerLayoutComponent),
    children: [
      // 2.1 LANDING PAGE (Route: /)
      {
        path: '',
        loadComponent: () => import('./features/landing/landing.component').then(m => m.LandingComponent),
        title: 'EventPark — Event & Parking Reservation Platform'
      },

      // 2.2 AUTHENTICATION ROUTES
      {
        path: 'login',
        loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent),
        title: 'Sign In — EventPark'
      },
      {
        path: 'register',
        loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent),
        title: 'Create Account — EventPark'
      },
      {
        path: 'verify-email',
        loadComponent: () => import('./features/auth/verify-email/verify-email.component').then(m => m.VerifyEmailComponent),
        title: 'Verify Email — EventPark'
      },
      {
        path: 'forgot-password',
        loadComponent: () => import('./features/auth/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent),
        title: 'Forgot Password — EventPark'
      },
      {
        path: 'reset-password',
        loadComponent: () => import('./features/auth/reset-password/reset-password.component').then(m => m.ResetPasswordComponent),
        title: 'Reset Password — EventPark'
      },

      // 2.3 CUSTOMER HOME (Route: /customer/home)
      {
        path: 'customer/home',
        loadComponent: () => import('./features/customer/dashboard/dashboard.component').then(m => m.CustomerDashboardComponent),
        canActivate: [authGuard],
        title: 'Customer Home — EventPark'
      },
      {
        path: 'customer/dashboard',
        redirectTo: 'customer/home',
        pathMatch: 'full'
      },

      // 2.4 EVENTS CATALOGUE & DETAILS
      {
        path: 'events',
        loadComponent: () => import('./features/customer/events/events.component').then(m => m.EventsComponent),
        title: 'Discover Events — EventPark'
      },
      {
        path: 'events/:eventId',
        loadComponent: () => import('./features/customer/event-details/event-details.component').then(m => m.EventDetailsComponent),
        title: 'Event Details — EventPark'
      },

      // 2.5 BOOKING WORKFLOW ROUTES
      // Seat Selection
      {
        path: 'booking/seats/:eventId',
        loadComponent: () => import('./features/customer/seat-selection/seat-selection.component').then(m => m.SeatSelectionComponent),
        title: 'Select Seats — EventPark'
      },
      // Parking Selection
      {
        path: 'booking/parking/:eventId',
        loadComponent: () => import('./features/customer/parking-selection/parking-selection.component').then(m => m.ParkingSelectionComponent),
        title: 'Select Parking — EventPark'
      },
      // Booking Summary
      {
        path: 'booking/summary',
        loadComponent: () => import('./features/customer/booking-summary/booking-summary.component').then(m => m.BookingSummaryComponent),
        canActivate: [checkoutGuard],
        title: 'Booking Summary — EventPark'
      },
      // Payment UI
      {
        path: 'payment/:bookingId',
        loadComponent: () => import('./features/customer/payment/payment.component').then(m => m.PaymentComponent),
        title: 'Payment Checkout — EventPark'
      },
      // Payment Success
      {
        path: 'payment-success/:bookingId',
        loadComponent: () => import('./features/customer/booking-confirmation/booking-confirmation.component').then(m => m.BookingConfirmationComponent),
        title: 'Booking Confirmed — EventPark'
      },

      // 2.6 MY BOOKINGS & DETAILS
      {
        path: 'my-bookings',
        loadComponent: () => import('./features/customer/my-bookings/my-bookings.component').then(m => m.MyBookingsComponent),
        canActivate: [authGuard],
        title: 'My Bookings — EventPark'
      },
      {
        path: 'my-bookings/:bookingId',
        loadComponent: () => import('./features/customer/booking-details/booking-details.component').then(m => m.BookingDetailsComponent),
        canActivate: [authGuard],
        title: 'Booking Details — EventPark'
      },

      // 2.7 NOTIFICATIONS & PROFILE
      {
        path: 'notifications',
        loadComponent: () => import('./features/customer/notifications/notifications.component').then(m => m.NotificationsComponent),
        canActivate: [authGuard],
        title: 'Notifications — EventPark'
      },
      {
        path: 'profile',
        loadComponent: () => import('./features/customer/profile/profile.component').then(m => m.ProfileComponent),
        canActivate: [authGuard],
        title: 'My Profile — EventPark'
      },

      // 2.8 BACKWARD COMPATIBILITY ALIASES
      { path: 'customer/events', redirectTo: 'events', pathMatch: 'full' },
      { path: 'customer/events/:id', redirectTo: ({ params }) => `events/${params['id']}` },
      { path: 'events/:id/seats', redirectTo: ({ params }) => `booking/seats/${params['id']}` },
      { path: 'events/:id/parking', redirectTo: ({ params }) => `booking/parking/${params['id']}` },
      { path: 'customer/seat-selection/:id', redirectTo: ({ params }) => `booking/seats/${params['id']}` },
      { path: 'customer/parking-selection/:id', redirectTo: ({ params }) => `booking/parking/${params['id']}` },
      { path: 'customer/booking-summary', redirectTo: 'booking/summary', pathMatch: 'full' },
      { path: 'reservations/make-reservation', redirectTo: 'booking/summary', pathMatch: 'full' },
      { path: 'customer/payment', redirectTo: 'payment/1', pathMatch: 'full' },
      { path: 'reservations/payment', redirectTo: 'payment/1', pathMatch: 'full' },
      { path: 'customer/booking-confirmation', redirectTo: 'payment-success/1', pathMatch: 'full' },
      { path: 'reservations/success', redirectTo: 'payment-success/1', pathMatch: 'full' },
      { path: 'customer/my-bookings', redirectTo: 'my-bookings', pathMatch: 'full' },
      { path: 'reservations/my-reservations', redirectTo: 'my-bookings', pathMatch: 'full' },
      { path: 'customer/notifications', redirectTo: 'notifications', pathMatch: 'full' },
      { path: 'customer/profile', redirectTo: 'profile', pathMatch: 'full' }
    ]
  },

  // 3. ADMIN PORTAL (Untouched as requested)
  {
    path: 'admin',
    loadComponent: () => import('./shared/layout/admin-layout/admin-layout.component').then(m => m.AdminLayoutComponent),
    canActivate: [adminGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./features/admin/dashboard/dashboard.component').then(m => m.AdminDashboardComponent),
        title: 'Admin Dashboard — VenueGo'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/admin/dashboard/dashboard.component').then(m => m.AdminDashboardComponent),
        title: 'Admin Dashboard — VenueGo'
      },
      {
        path: 'events',
        loadComponent: () => import('./features/admin/events/events.component').then(m => m.EventsComponent),
        title: 'Manage Events — VenueGo Admin'
      },
      {
        path: 'categories',
        loadComponent: () => import('./features/admin/categories/categories.component').then(m => m.CategoriesComponent),
        title: 'Manage Categories — VenueGo Admin'
      },
      {
        path: 'venues',
        loadComponent: () => import('./features/admin/venues/venues.component').then(m => m.VenuesComponent),
        title: 'Manage Venues — VenueGo Admin'
      },
      {
        path: 'seats',
        loadComponent: () => import('./features/admin/seats/seats.component').then(m => m.SeatsComponent),
        title: 'Manage Seat Maps — VenueGo Admin'
      },
      {
        path: 'parking',
        loadComponent: () => import('./features/admin/parking/parking.component').then(m => m.ParkingComponent),
        title: 'Manage Parking Bays — VenueGo Admin'
      },
      {
        path: 'bookings',
        loadComponent: () => import('./features/admin/bookings/bookings.component').then(m => m.BookingsComponent),
        title: 'Manage Bookings — VenueGo Admin'
      },
      {
        path: 'customers',
        loadComponent: () => import('./features/admin/customers/customers.component').then(m => m.CustomersComponent),
        title: 'Manage Customers — VenueGo Admin'
      },
      {
        path: 'users',
        loadComponent: () => import('./features/admin/customers/customers.component').then(m => m.CustomersComponent),
        title: 'Manage Users — VenueGo Admin'
      },
      {
        path: 'payments',
        loadComponent: () => import('./features/admin/payments/payments.component').then(m => m.PaymentsComponent),
        title: 'Manage Payments — VenueGo Admin'
      },
      {
        path: 'notifications',
        loadComponent: () => import('./features/admin/notifications/notifications.component').then(m => m.NotificationsComponent),
        title: 'Manage Notifications — VenueGo Admin'
      }
    ]
  },

  // Fallback Wildcard
  {
    path: '**',
    redirectTo: ''
  }
];
