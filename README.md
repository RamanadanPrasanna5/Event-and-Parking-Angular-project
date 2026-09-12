# VenueGo — Event and Parking Reservation System (Frontend)

Modern, high-performance Angular frontend built for the **Event & Parking Reservation System**, designed with standalone components, Angular Signals, reactive forms, and seamless integration with the ASP.NET Core Web API backend.

---

## 🏛️ Directory Structure

The frontend architecture strictly adheres to a modular, feature-oriented structure:

```text
event-parking-frontend/
│
├── src/
│   ├── app/
│   │
│   ├── core/
│   │   ├── guards/
│   │   │   ├── auth.guard.ts
│   │   │   ├── admin.guard.ts
│   │   │   └── checkout.guard.ts
│   │   │
│   │   ├── interceptors/
│   │   │   └── auth.interceptor.ts
│   │   │
│   │   ├── services/
│   │   │   ├── auth.service.ts
│   │   │   ├── event.service.ts
│   │   │   ├── seat.service.ts
│   │   │   ├── parking.service.ts
│   │   │   ├── booking.service.ts
│   │   │   ├── payment.service.ts
│   │   │   ├── customer.service.ts
│   │   │   ├── notification.service.ts
│   │   │   ├── category.service.ts
│   │   │   ├── venue.service.ts
│   │   │   ├── dashboard.service.ts
│   │   │   └── toast.service.ts
│   │   │
│   │   └── models/
│   │       ├── auth.model.ts
│   │       ├── event.model.ts
│   │       ├── seat.model.ts
│   │       ├── parking.model.ts
│   │       ├── booking.model.ts
│   │       ├── payment.model.ts
│   │       ├── customer.model.ts
│   │       ├── notification.model.ts
│   │       ├── category.model.ts
│   │       ├── venue.model.ts
│   │       └── dashboard.model.ts
│   │
│   ├── shared/
│   │   ├── components/
│   │   │   ├── navbar/
│   │   │   ├── footer/
│   │   │   ├── sidebar/
│   │   │   ├── loading/
│   │   │   ├── confirmation-dialog/
│   │   │   ├── empty-state/
│   │   │   └── toast/
│   │   │
│   │   └── layout/
│   │       ├── customer-layout/
│   │       └── admin-layout/
│   │
│   ├── features/
│   │   ├── auth/
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   ├── forgot-password/
│   │   │   ├── reset-password/
│   │   │   └── verify-email/
│   │   │
│   │   ├── customer/
│   │   │   ├── dashboard/
│   │   │   ├── profile/
│   │   │   ├── events/
│   │   │   ├── event-details/
│   │   │   ├── seat-selection/
│   │   │   ├── parking-selection/
│   │   │   ├── booking-summary/
│   │   │   ├── payment/
│   │   │   ├── booking-confirmation/
│   │   │   ├── my-bookings/
│   │   │   ├── payment-history/
│   │   │   ├── receipt/
│   │   │   └── notifications/
│   │   │
│   │   └── admin/
│   │       ├── dashboard/
│   │       ├── events/
│   │       ├── categories/
│   │       ├── venues/
│   │       ├── seats/
│   │       ├── parking/
│   │       ├── bookings/
│   │       ├── customers/
│   │       ├── payments/
│   │       └── notifications/
│   │
│   ├── app.routes.ts
│   ├── app.config.ts
│   │
│   ├── environments/
│   │   ├── environment.ts
│   │   └── environment.development.ts
│   │
│   ├── assets/
│   │   ├── images/
│   │   └── icons/
│   │
│   └── styles.css
│
├── angular.json
├── package.json
├── tsconfig.json
└── README.md
```

---

## ⚡ Core Features

### 👤 Customer Experience
* **Discovery & Event Catalogue**: Browse upcoming events with live search, category filtering, and venue sorting.
* **Visual Interactive Seat Map**: Real-time interactive seat matrix with VIP/Standard zones, real-time total pricing calculation, and lock protection.
* **Smart Parking Slot Reservation**: Dedicated visual vehicle bay selection with vehicle type matching (Car, SUV, Bike) and combined checkout.
* **Unified Checkout & Payments**: Streamlined booking summary, 10-minute hold countdown timer, mock payment gateway integration, instant PDF receipts, and transaction history.
* **Self-Service Dashboard**: Manage profile, view all active and historical bookings, cancel tickets with instant release, and check notification bulletins.

### 🛡️ Administrator Operations
* **System Metrics Dashboard**: Overview of total revenue, active holds, venue utilization, and customer registrations.
* **Event & Master Catalogue**: Full CRUD for events, categories, and venues.
* **Auditorium Seat & Parking Layout Generator**: Visual grid generator to configure seat rows and parking bays per event.
* **Bookings & Payments Auditor**: Real-time monitor for all reservations across the platform with force-release actions and financial transaction ledgers.
* **Customer & Notification Management**: Search user accounts, activate/deactivate privileges, and manage outbound broadcasts.

---

## 🚀 Getting Started

### Prerequisites
* **Node.js**: v18.19.0 or higher (v20+ recommended)
* **npm**: v9+
* **Backend API**: ASP.NET Core Web API running at `http://localhost:5000` (or configured port)

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd event-parking-frontend

# Install dependencies
npm install
```

### Configure Backend API Endpoint
Edit `src/environments/environment.ts` and `src/environments/environment.development.ts`:
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:5000' // Target your ASP.NET Core backend URL
};
```

### Run Locally
```bash
# Start the Angular development server
npm start
# OR
ng serve --port 4200
```
Open `http://localhost:4200/` in your browser.

### Production Build
```bash
npm run build
```
Compiled output will be generated in `dist/frontend/browser/`.

---

## 🔒 Security & Architecture Standards
* **Authentication**: JWT Bearer token authentication handled via `auth.interceptor.ts`.
* **Route Guards**: `authGuard` verifies authenticated user sessions; `adminGuard` restricts access to users with `Admin` roles.
* **Reactive State Management**: Uses Angular Signals for reactive UI state, compute cart totals, and manage live hold expiration timers.
* **Responsive Layouts**: Multi-device support for desktop, tablet, and mobile with glassmorphic cards and accessible contrast ratios.
