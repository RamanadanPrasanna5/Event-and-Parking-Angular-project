import { HttpErrorResponse, HttpEvent, HttpHandlerFn, HttpInterceptorFn, HttpRequest, HttpResponse } from '@angular/common/http';
import { Observable, delay, of } from 'rxjs';
import { EventDto } from '../models/event.model';
import { Venue } from '../models/venue.model';
import { EventCategory } from '../models/category.model';
import { SeatDto } from '../models/seat.model';
import { ParkingSlotDto } from '../models/parking.model';
import { CustomerBookingDto } from '../models/booking.model';
import { CustomerAdminView, CustomerProfileDto } from '../models/customer.model';
import { CustomerNotificationItem } from '../models/notification.model';
import { PaymentHistoryDto, ReceiptDto } from '../models/payment.model';
import { environment } from '../../../environments/environment';

const MOCK_STORAGE_KEY = 'venuego_mock_database_v1';

interface MockDatabase {
  categories: EventCategory[];
  venues: Venue[];
  events: EventDto[];
  seats: { [eventId: number]: SeatDto[] };
  parkingSlots: { [eventId: number]: ParkingSlotDto[] };
  bookings: CustomerBookingDto[];
  payments: PaymentHistoryDto[];
  notifications: CustomerNotificationItem[];
  customers: CustomerAdminView[];
}

function getInitialDatabase(): MockDatabase {
  const venues: Venue[] = [
    {
      id: 1,
      name: 'Nelum Pokuna Mahinda Rajapaksa Theatre',
      location: '110 Ananda Coomaraswamy Mawatha, Colombo 07',
      capacity: 1288,
      isActive: true
    },
    {
      id: 2,
      name: 'Sugathadasa Indoor Stadium',
      location: 'Prince of Wales Ave, Colombo 14',
      capacity: 5000,
      isActive: true
    },
    {
      id: 3,
      name: 'BMICH Main Exhibition Center',
      location: 'Bauddhaloka Mawatha, Colombo 07',
      capacity: 1600,
      isActive: true
    },
    {
      id: 4,
      name: 'Galle Face Open Air Arena',
      location: 'Galle Face Green, Colombo 03',
      capacity: 15000,
      isActive: true
    }
  ];

  const categories: EventCategory[] = [
    { id: 1, name: 'Music & Concerts', description: 'Live classical, rock, acoustic, and orchestral performances' },
    { id: 2, name: 'Sports & Tournaments', description: 'Indoor championships, futsal leagues, and combat sports' },
    { id: 3, name: 'Theatre & Performing Arts', description: 'Drama, musical plays, and traditional dance showcases' },
    { id: 4, name: 'Tech & Business Conferences', description: 'Keynotes, developer summits, and industry expos' },
    { id: 5, name: 'Comedy & Entertainment', description: 'Stand-up comedy tours, magic acts, and gala evenings' }
  ];

  const events: EventDto[] = [
    {
      id: 1,
      title: 'Symphony Under the Stars 2026',
      description: 'An enchanting evening of classical masterpieces and modern film scores performed by the National Philharmonic Orchestra.',
      eventDate: '2026-10-24',
      time: '19:30',
      startTime: '19:30',
      endTime: '22:30',
      capacity: 1288,
      availableSeats: 840,
      venueName: 'Nelum Pokuna Mahinda Rajapaksa Theatre',
      categoryName: 'Music & Concerts',
      status: 'Upcoming',
      imageUrl: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=1200',
      price: 3500,
      venueId: 1,
      categoryId: 1
    },
    {
      id: 2,
      title: 'Colombo Premier League Futsal Final',
      description: 'The adrenaline-fueled climax of the National Indoor Football Season with electrifying halftime entertainment.',
      eventDate: '2026-10-30',
      time: '17:00',
      startTime: '17:00',
      endTime: '20:30',
      capacity: 5000,
      availableSeats: 2200,
      venueName: 'Sugathadasa Indoor Stadium',
      categoryName: 'Sports & Tournaments',
      status: 'Upcoming',
      imageUrl: 'https://images.unsplash.com/photo-1518091043644-c1d4457512c6?w=1200',
      price: 1500,
      venueId: 2,
      categoryId: 2
    },
    {
      id: 3,
      title: 'Sri Lanka Tech Summit & AI Expo',
      description: 'Connecting top tech founders, artificial intelligence researchers, and software innovators across South Asia.',
      eventDate: '2026-11-12',
      time: '09:00',
      startTime: '09:00',
      endTime: '18:00',
      capacity: 1600,
      availableSeats: 620,
      venueName: 'BMICH Main Exhibition Center',
      categoryName: 'Tech & Business Conferences',
      status: 'Upcoming',
      imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200',
      price: 6500,
      venueId: 3,
      categoryId: 4
    },
    {
      id: 4,
      title: 'Sunset Waves Electronic Music Fest',
      description: 'World-renowned DJs, vibrant laser installations, and festival food trucks overlooking the Indian Ocean.',
      eventDate: '2026-11-20',
      time: '16:00',
      startTime: '16:00',
      endTime: '23:59',
      capacity: 15000,
      availableSeats: 4800,
      venueName: 'Galle Face Open Air Arena',
      categoryName: 'Music & Concerts',
      status: 'Upcoming',
      imageUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1200',
      price: 4500,
      venueId: 4,
      categoryId: 1
    },
    {
      id: 5,
      title: 'Laughter Therapy Stand-Up Comedy Special',
      description: 'An unforgettable night of observational humor, witty punchlines, and live improvisational banter.',
      eventDate: '2026-11-28',
      time: '20:00',
      startTime: '20:00',
      endTime: '22:30',
      capacity: 1288,
      availableSeats: 410,
      venueName: 'Nelum Pokuna Mahinda Rajapaksa Theatre',
      categoryName: 'Comedy & Entertainment',
      status: 'Upcoming',
      imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200',
      price: 2500,
      venueId: 1,
      categoryId: 5
    },
    {
      id: 6,
      title: 'Phantom of the Opera — Broadway Tribute',
      description: 'A grand theatrical experience with lavish costumes, live orchestra, and critically acclaimed vocalists.',
      eventDate: '2026-12-05',
      time: '19:00',
      startTime: '19:00',
      endTime: '22:00',
      capacity: 1288,
      availableSeats: 350,
      venueName: 'Nelum Pokuna Mahinda Rajapaksa Theatre',
      categoryName: 'Theatre & Performing Arts',
      status: 'Upcoming',
      imageUrl: 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=1200',
      price: 5000,
      venueId: 1,
      categoryId: 3
    }
  ];

  const seats: { [eventId: number]: SeatDto[] } = {};
  const parkingSlots: { [eventId: number]: ParkingSlotDto[] } = {};

  // Auto-populate seats and parking for all 6 events
  events.forEach((ev) => {
    const evSeats: SeatDto[] = [];
    const rows = ['A', 'B', 'C', 'D', 'E', 'F'];
    let seatIdCounter = 1;
    const base = ev.price || 2500;

    rows.forEach((row, rIdx) => {
      const multiplier = rIdx < 2 ? 1.5 : rIdx < 4 ? 1.25 : 1.0;
      const seatPrice = Math.round(base * multiplier);

      for (let num = 1; num <= 10; num++) {
        // Mark selected seats as already booked for realistic feel
        const isBooked = (rIdx === 0 && (num === 4 || num === 5)) || (rIdx === 2 && num === 7);
        evSeats.push({
          id: ev.id * 1000 + seatIdCounter++,
          eventId: ev.id,
          row,
          seatNumber: num,
          status: isBooked ? 'Booked' : 'Available',
          price: seatPrice
        });
      }
    });
    seats[ev.id] = evSeats;

    const evSlots: ParkingSlotDto[] = [];
    for (let slotNum = 101; slotNum <= 125; slotNum++) {
      const zone = slotNum <= 110 ? 'Zone A (Near Entrance)' : slotNum <= 120 ? 'Zone B (General)' : 'Zone C (Economy)';
      const fee = slotNum <= 110 ? 750 : slotNum <= 120 ? 500 : 350;
      const isReserved = slotNum === 103 || slotNum === 108 || slotNum === 115;

      evSlots.push({
        id: ev.id * 500 + slotNum,
        eventId: ev.id,
        zone,
        slotNumber: slotNum,
        fee,
        status: isReserved ? 'Reserved' : 'Available'
      });
    }
    parkingSlots[ev.id] = evSlots;
  });

  const bookings: CustomerBookingDto[] = [
    {
      id: 101,
      bookingNumber: 'VG-849201',
      eventId: 1,
      eventName: 'Symphony Under the Stars 2026',
      eventDate: '2026-10-24',
      eventTime: '19:30',
      venue: 'Nelum Pokuna Mahinda Rajapaksa Theatre',
      totalPrice: 8750,
      status: 'Confirmed',
      paymentStatus: 'Paid',
      seatNumbers: ['Row A - Seat 4', 'Row A - Seat 5'],
      parkingDetails: 'Zone A - Bay P-103',
      parkingSlot: 'Bay P-103 (Zone A)',
      customerName: 'Demo Customer',
      createdAt: new Date(Date.now() - 3600 * 48 * 1000).toISOString()
    }
  ];

  const payments: PaymentHistoryDto[] = [
    {
      paymentId: 501,
      bookingId: 101,
      receiptNumber: 'RCT-2026-98124',
      amount: 8750,
      paymentDate: new Date(Date.now() - 3600 * 48 * 1000).toISOString()
    }
  ];

  const notifications: CustomerNotificationItem[] = [
    {
      id: 1,
      customerId: 1,
      bookingId: 101,
      title: 'Booking Confirmed!',
      message: 'Your seats for Symphony Under the Stars 2026 and vehicle bay P-103 are reserved.',
      type: 'booking',
      isRead: false,
      createdAt: new Date(Date.now() - 3600 * 24 * 1000).toISOString(),
      icon: 'fa-solid fa-circle-check text-success'
    },
    {
      id: 2,
      customerId: 1,
      title: 'Welcome to VenueGo',
      message: 'Explore prime arena events with interactive seat maps and guaranteed parking.',
      type: 'system',
      isRead: true,
      createdAt: new Date(Date.now() - 3600 * 72 * 1000).toISOString(),
      icon: 'fa-solid fa-sparkles text-primary'
    }
  ];

  const customers: CustomerAdminView[] = [
    {
      id: 1,
      name: 'System Administrator',
      email: 'admin@venuego.com',
      phone: '+94 77 000 0001',
      status: 'Active',
      role: 'Admin',
      emailVerified: true,
      createdAt: '2026-01-10'
    },
    {
      id: 2,
      name: 'Demo Customer',
      email: 'customer@venuego.com',
      phone: '+94 77 123 4567',
      status: 'Active',
      role: 'Customer',
      emailVerified: true,
      createdAt: '2026-02-15'
    }
  ];

  return {
    categories,
    venues,
    events,
    seats,
    parkingSlots,
    bookings,
    payments,
    notifications,
    customers
  };
}

function loadDatabase(): MockDatabase {
  try {
    const raw = localStorage.getItem(MOCK_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.events) && Array.isArray(parsed.venues) && Array.isArray(parsed.categories)) {
        parsed.events.forEach((ev: any) => {
          if (!ev.startTime && ev.time) ev.startTime = ev.time;
          if (!ev.time && ev.startTime) ev.time = ev.startTime;
        });
        if (!parsed.seats) parsed.seats = {};
        if (!parsed.parkingSlots) parsed.parkingSlots = {};
        if (!Array.isArray(parsed.bookings)) parsed.bookings = [];
        if (!Array.isArray(parsed.payments)) parsed.payments = [];
        if (!Array.isArray(parsed.notifications)) parsed.notifications = [];
        if (!Array.isArray(parsed.customers)) parsed.customers = [];
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed to parse mock database from storage, re-initializing.', e);
  }

  const initial = getInitialDatabase();
  saveDatabase(initial);
  return initial;
}

function saveDatabase(db: MockDatabase): void {
  try {
    localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(db));
  } catch (e) {
    console.error('Failed to save mock database', e);
  }
}

function createJwtToken(id: number, email: string, role: string): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(
    JSON.stringify({
      sub: id.toString(),
      email,
      role,
      exp: Math.floor(Date.now() / 1000) + 86400 * 7
    })
  );
  const signature = btoa('venuego_client_signature_secret');
  return `${header}.${payload}.${signature}`;
}

export const mockBackendInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> => {
  // If mock backend is explicitly disabled, forward to real backend
  if ((environment as any).useMockBackend === false) {
    return next(req);
  }

  // Only intercept API calls
  if (!req.url.includes('/api/')) {
    return next(req);
  }

  const url = new URL(req.url, 'http://localhost');
  const pathname = url.pathname.toLowerCase();
  const method = req.method.toUpperCase();
  const db = loadDatabase();

  // Helper for 200 OK Response
  const ok = (body: any): Observable<HttpEvent<any>> => {
    return of(new HttpResponse({ status: 200, body })).pipe(delay(50));
  };

  // Helper for 201 Created Response
  const created = (body: any): Observable<HttpEvent<any>> => {
    return of(new HttpResponse({ status: 201, body })).pipe(delay(50));
  };

  // 1. AUTHENTICATION ENDPOINTS
  if (pathname === '/api/auth/login' && method === 'POST') {
    const body: any = req.body || {};
    const email = (body.email || 'customer@venuego.com').toLowerCase();
    const isAdmin = email.includes('admin');
    const role = isAdmin ? 'Admin' : 'Customer';
    const id = isAdmin ? 1 : 2;
    const token = createJwtToken(id, email, role);

    return ok({
      token,
      Token: token,
      customerId: id,
      CustomerId: id,
      email,
      role,
      message: 'Signed in successfully'
    });
  }

  if (pathname === '/api/auth/register' && method === 'POST') {
    const body: any = req.body || {};
    const newCustomer: CustomerAdminView = {
      id: db.customers.length + 1,
      name: body.name || 'New Customer',
      email: body.email || 'user@venuego.com',
      phone: body.phone || '+94 77 999 8888',
      status: 'Active',
      role: 'Customer',
      emailVerified: true,
      createdAt: new Date().toISOString().split('T')[0]
    };
    db.customers.push(newCustomer);
    saveDatabase(db);

    return ok({
      message: 'User registered successfully. Please verify your email.'
    });
  }

  if (pathname === '/api/auth/verify-email') {
    return ok({ message: 'Email verified successfully.' });
  }

  if (pathname === '/api/auth/forgot-password') {
    return ok({ message: 'Password reset instructions sent to your email.' });
  }

  if (pathname === '/api/auth/reset-password') {
    return ok({ message: 'Password has been updated successfully.' });
  }

  if (pathname === '/api/auth/resend-verification') {
    return ok({ message: 'Verification link resent.' });
  }

  // 2. DASHBOARD METRICS
  if (pathname === '/api/dashboard/metrics' && method === 'GET') {
    const totalRev = db.bookings
      .filter((b) => b.paymentStatus === 'Paid')
      .reduce((sum, b) => sum + (b.totalPrice || 0), 0);

    return ok({
      totalEvents: db.events.length,
      totalBookings: db.bookings.length,
      availableSeats: 1240,
      occupiedParkingSlots: 62,
      totalRevenue: totalRev > 0 ? totalRev : 2845000,
      totalCustomers: db.customers.length
    });
  }

  // 3. CATEGORIES
  if (pathname === '/api/categories') {
    if (method === 'GET') {
      return ok(db.categories);
    }
    if (method === 'POST') {
      const body: any = req.body;
      const newCat: EventCategory = {
        id: db.categories.length > 0 ? Math.max(...db.categories.map((c) => c.id)) + 1 : 1,
        name: body.name,
        description: body.description || ''
      };
      db.categories.push(newCat);
      saveDatabase(db);
      return created(newCat);
    }
  }

  const catMatch = pathname.match(/^\/api\/categories\/(\d+)$/);
  if (catMatch) {
    const catId = parseInt(catMatch[1], 10);
    if (method === 'PUT') {
      const body: any = req.body;
      const cat = db.categories.find((c) => c.id === catId);
      if (cat) {
        cat.name = body.name || cat.name;
        cat.description = body.description || cat.description;
        saveDatabase(db);
      }
      return ok({ message: 'Category updated.' });
    }
    if (method === 'DELETE') {
      db.categories = db.categories.filter((c) => c.id !== catId);
      saveDatabase(db);
      return ok({ message: 'Category deleted.' });
    }
  }

  // 4. VENUES
  if (pathname === '/api/venues' && method === 'GET') {
    return ok(db.venues);
  }
  if (pathname === '/api/venues/available' && method === 'GET') {
    return ok(db.venues);
  }
  if (pathname === '/api/venues' && method === 'POST') {
    const body: any = req.body;
    const newVenue: Venue = {
      id: db.venues.length > 0 ? Math.max(...db.venues.map((v) => v.id)) + 1 : 1,
      name: body.name,
      location: body.location,
      capacity: body.capacity || 1000,
      isActive: true
    };
    db.venues.push(newVenue);
    saveDatabase(db);
    return created(newVenue);
  }

  const venueMatch = pathname.match(/^\/api\/venues\/(\d+)$/);
  if (venueMatch) {
    const venueId = parseInt(venueMatch[1], 10);
    if (method === 'GET') {
      const v = db.venues.find((item) => item.id === venueId);
      return ok(v || db.venues[0]);
    }
    if (method === 'PUT') {
      const body: any = req.body;
      const v = db.venues.find((item) => item.id === venueId);
      if (v) {
        v.name = body.name || v.name;
        v.location = body.location || v.location;
        v.capacity = body.capacity || v.capacity;
        saveDatabase(db);
      }
      return ok({ message: 'Venue updated.' });
    }
    if (method === 'DELETE') {
      db.venues = db.venues.filter((v) => v.id !== venueId);
      saveDatabase(db);
      return ok({ message: 'Venue deleted.' });
    }
  }

  // 5. SEATS MANAGEMENT & FETCH
  const seatsMatch = pathname.match(/^\/api\/events\/(\d+)\/seats$/);
  if (seatsMatch) {
    const eventId = parseInt(seatsMatch[1], 10);
    if (method === 'GET') {
      if (!db.seats[eventId] || db.seats[eventId].length === 0) {
        // generate default 50 seats for event
        const ev = db.events.find((e) => e.id === eventId);
        const base = ev?.price || 2500;
        const rows = ['A', 'B', 'C', 'D', 'E'];
        const genSeats: SeatDto[] = [];
        let counter = 1;
        rows.forEach((r, idx) => {
          const mult = idx < 2 ? 1.5 : idx < 3 ? 1.25 : 1.0;
          for (let n = 1; n <= 10; n++) {
            genSeats.push({
              id: eventId * 1000 + counter++,
              eventId,
              row: r,
              seatNumber: n,
              status: (idx === 1 && n === 4) || (idx === 2 && n === 5) ? 'Booked' : 'Available',
              price: Math.round(base * mult)
            });
          }
        });
        db.seats[eventId] = genSeats;
        saveDatabase(db);
      }
      return ok(db.seats[eventId]);
    }

    if (method === 'POST') {
      const dto: any = req.body || {};
      const numRows = Math.min(dto.rows || 5, 26);
      const seatsPerRow = Math.min(dto.seatsPerRow || 10, 30);
      const basePrice = dto.basePrice || 2000;
      const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      const genSeats: SeatDto[] = [];
      let counter = 1;

      for (let r = 0; r < numRows; r++) {
        const rowChar = alphabet[r];
        for (let s = 1; s <= seatsPerRow; s++) {
          genSeats.push({
            id: eventId * 1000 + counter++,
            eventId,
            row: rowChar,
            seatNumber: s,
            status: 'Available',
            price: basePrice
          });
        }
      }
      db.seats[eventId] = genSeats;
      saveDatabase(db);
      return ok({ message: 'Seat map generated successfully.' });
    }
  }

  const singleSeatMatch = pathname.match(/^\/api\/events\/(\d+)\/seats\/(\d+)$/);
  if (singleSeatMatch) {
    const eventId = parseInt(singleSeatMatch[1], 10);
    const seatId = parseInt(singleSeatMatch[2], 10);
    const evSeats = db.seats[eventId] || [];

    if (method === 'PUT') {
      const body: any = req.body || {};
      const st = evSeats.find((s) => s.id === seatId);
      if (st) {
        st.row = body.row || st.row;
        st.seatNumber = body.seatNumber || st.seatNumber;
        st.price = body.price || st.price;
        saveDatabase(db);
      }
      return ok({ message: 'Seat updated.' });
    }
    if (method === 'DELETE') {
      db.seats[eventId] = evSeats.filter((s) => s.id !== seatId);
      saveDatabase(db);
      return ok({ message: 'Seat deleted.' });
    }
  }

  // 6. PARKING SLOTS MANAGEMENT & FETCH
  const parkingMatch = pathname.match(/^\/api\/events\/(\d+)\/parking-slots$/);
  if (parkingMatch) {
    const eventId = parseInt(parkingMatch[1], 10);
    if (method === 'GET') {
      if (!db.parkingSlots[eventId] || db.parkingSlots[eventId].length === 0) {
        const genSlots: ParkingSlotDto[] = [];
        for (let num = 101; num <= 125; num++) {
          genSlots.push({
            id: eventId * 500 + num,
            eventId,
            zone: num <= 110 ? 'Zone A (Near Entrance)' : num <= 120 ? 'Zone B (General)' : 'Zone C (Economy)',
            slotNumber: num,
            fee: num <= 110 ? 750 : num <= 120 ? 500 : 350,
            status: num === 104 || num === 111 ? 'Reserved' : 'Available'
          });
        }
        db.parkingSlots[eventId] = genSlots;
        saveDatabase(db);
      }
      return ok(db.parkingSlots[eventId]);
    }

    if (method === 'POST') {
      const dto: any = req.body || {};
      const numSlots = dto.numberOfSlots || 20;
      const zone = dto.zone || 'General';
      const fee = dto.defaultFee || 500;
      const genSlots: ParkingSlotDto[] = [];

      for (let s = 1; s <= numSlots; s++) {
        genSlots.push({
          id: eventId * 500 + s + 100,
          eventId,
          zone,
          slotNumber: s + 100,
          fee,
          status: 'Available'
        });
      }
      db.parkingSlots[eventId] = genSlots;
      saveDatabase(db);
      return ok({ message: 'Parking layout created.' });
    }
  }

  const singleSlotMatch = pathname.match(/^\/api\/events\/(\d+)\/parking-slots\/(\d+)$/);
  if (singleSlotMatch) {
    const eventId = parseInt(singleSlotMatch[1], 10);
    const slotId = parseInt(singleSlotMatch[2], 10);
    const slots = db.parkingSlots[eventId] || [];

    if (method === 'PUT') {
      const body: any = req.body || {};
      const sl = slots.find((s) => s.id === slotId);
      if (sl) {
        sl.zone = body.zone || sl.zone;
        sl.slotNumber = body.slotNumber || sl.slotNumber;
        sl.fee = body.fee || sl.fee;
        saveDatabase(db);
      }
      return ok({ message: 'Parking slot updated.' });
    }
    if (method === 'DELETE') {
      db.parkingSlots[eventId] = slots.filter((s) => s.id !== slotId);
      saveDatabase(db);
      return ok({ message: 'Parking slot deleted.' });
    }
  }

  // 7. EVENTS
  if (pathname === '/api/events') {
    if (method === 'GET') {
      let filtered = [...db.events];
      const search = url.searchParams.get('search');
      const categoryId = url.searchParams.get('categoryId');
      const venueId = url.searchParams.get('venueId');
      const maxPrice = url.searchParams.get('maxPrice');

      if (search) {
        const s = search.toLowerCase();
        filtered = filtered.filter(
          (e) =>
            e.title.toLowerCase().includes(s) ||
            e.description.toLowerCase().includes(s) ||
            e.venueName.toLowerCase().includes(s)
        );
      }
      if (categoryId) {
        filtered = filtered.filter((e) => e.categoryId === parseInt(categoryId, 10));
      }
      if (venueId) {
        filtered = filtered.filter((e) => e.venueId === parseInt(venueId, 10));
      }
      if (maxPrice) {
        filtered = filtered.filter((e) => (e.price || 0) <= parseInt(maxPrice, 10));
      }

      return ok(filtered);
    }

    if (method === 'POST') {
      const body: any = req.body;
      const venue = db.venues.find((v) => v.id === body.venueId);
      const cat = db.categories.find((c) => c.id === body.categoryId);
      const newEvent: EventDto = {
        id: db.events.length > 0 ? Math.max(...db.events.map((e) => e.id)) + 1 : 1,
        title: body.title,
        description: body.description,
        eventDate: body.eventDate,
        time: body.time || body.startTime || '19:00',
        startTime: body.startTime || body.time || '19:00',
        endTime: body.endTime || '22:00',
        capacity: body.capacity || 1000,
        availableSeats: body.capacity || 1000,
        venueName: venue?.name || 'Grand Arena',
        categoryName: cat?.name || 'General Event',
        status: 'Upcoming',
        imageUrl: body.imageUrl || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200',
        price: body.price || 3000,
        venueId: body.venueId,
        categoryId: body.categoryId
      };
      db.events.unshift(newEvent);
      saveDatabase(db);
      return created(newEvent);
    }
  }

  const eventMatch = pathname.match(/^\/api\/events\/(\d+)$/);
  if (eventMatch) {
    const eventId = parseInt(eventMatch[1], 10);
    if (method === 'GET') {
      const ev = db.events.find((e) => e.id === eventId);
      return ok(ev || db.events[0]);
    }
    if (method === 'PUT') {
      const body: any = req.body;
      const ev = db.events.find((e) => e.id === eventId);
      if (ev) {
        ev.title = body.title || ev.title;
        ev.description = body.description || ev.description;
        ev.eventDate = body.eventDate || ev.eventDate;
        ev.time = body.time || ev.time;
        ev.startTime = body.startTime || body.time || ev.startTime;
        ev.endTime = body.endTime || ev.endTime;
        ev.capacity = body.capacity || ev.capacity;
        ev.imageUrl = body.imageUrl || ev.imageUrl;
        ev.price = body.price || ev.price;
        if (body.venueId) {
          ev.venueId = body.venueId;
          const v = db.venues.find((item) => item.id === body.venueId);
          if (v) ev.venueName = v.name;
        }
        if (body.categoryId) {
          ev.categoryId = body.categoryId;
          const c = db.categories.find((item) => item.id === body.categoryId);
          if (c) ev.categoryName = c.name;
        }
        saveDatabase(db);
      }
      return ok({ message: 'Event updated.' });
    }
    if (method === 'DELETE') {
      db.events = db.events.filter((e) => e.id !== eventId);
      saveDatabase(db);
      return ok({ message: 'Event deleted.' });
    }
  }

  // 8. UNIFIED BOOKING CREATION
  if (pathname === '/api/bookings' && method === 'POST') {
    const body: any = req.body || {};
    const seatIds: number[] = body.seatIds || [];
    const parkingSlotId: number | null = body.parkingSlotId ?? null;

    let targetEvent: EventDto | undefined;
    const seatNumbers: string[] = [];
    let totalPrice = 0;

    // Search and mark seats as Booked
    for (const [evIdStr, evSeats] of Object.entries(db.seats)) {
      evSeats.forEach((s) => {
        if (seatIds.includes(s.id)) {
          s.status = 'Booked';
          seatNumbers.push(`Row ${s.row} - Seat ${s.seatNumber}`);
          totalPrice += s.price;
          if (!targetEvent) {
            targetEvent = db.events.find((e) => e.id === parseInt(evIdStr, 10));
          }
        }
      });
    }

    let parkingDetails = 'No parking selected';
    let parkingSlotDesc = '';
    if (parkingSlotId) {
      for (const evSlots of Object.values(db.parkingSlots)) {
        const slot = evSlots.find((sl) => sl.id === parkingSlotId);
        if (slot) {
          slot.status = 'Reserved';
          totalPrice += slot.fee;
          parkingDetails = `${slot.zone} - Bay P-${slot.slotNumber}`;
          parkingSlotDesc = `Bay P-${slot.slotNumber} (${slot.zone})`;
        }
      }
    }

    const newBookingId = db.bookings.length > 0 ? Math.max(...db.bookings.map((b) => b.id)) + 1 : 101;
    const bookingNumber = 'VG-' + Math.floor(100000 + Math.random() * 900000);
    const holdExpiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

    const newBooking: CustomerBookingDto = {
      id: newBookingId,
      bookingNumber,
      eventId: targetEvent?.id || 1,
      eventName: targetEvent?.title || 'Premier Event Experience',
      eventDate: targetEvent?.eventDate || '2026-10-24',
      eventTime: targetEvent?.time || '19:30',
      venue: targetEvent?.venueName || 'Nelum Pokuna Theatre',
      totalPrice,
      status: 'Pending',
      paymentStatus: 'Pending',
      seatNumbers,
      parkingDetails,
      parkingSlot: parkingSlotDesc,
      customerName: 'Demo Customer',
      createdAt: new Date().toISOString()
    };

    db.bookings.unshift(newBooking);
    saveDatabase(db);

    return ok({
      message: '15-Minute hold confirmed successfully.',
      bookingId: newBookingId,
      bookingNumber,
      holdExpiresAt
    });
  }

  // 9. MY BOOKINGS & SINGLE BOOKING
  if (pathname === '/api/bookings/my-bookings' && method === 'GET') {
    return ok(db.bookings);
  }

  const singleBookingMatch = pathname.match(/^\/api\/bookings\/([a-zA-Z0-9_-]+)$/);
  if (singleBookingMatch && method === 'GET') {
    const rawId = singleBookingMatch[1];
    const b = db.bookings.find((item) => item.id.toString() === rawId || item.bookingNumber === rawId);
    return ok(b || db.bookings[0]);
  }

  if (singleBookingMatch && method === 'DELETE') {
    const rawId = singleBookingMatch[1];
    const b = db.bookings.find((item) => item.id.toString() === rawId || item.bookingNumber === rawId);
    if (b) {
      b.status = 'Cancelled';
      saveDatabase(db);
    }
    return ok({ message: 'Booking released and cancelled.' });
  }

  // 10. HOLD STATUS
  const holdMatch = pathname.match(/^\/api\/bookings\/(\d+)\/hold-status$/);
  if (holdMatch && method === 'GET') {
    const bookingId = parseInt(holdMatch[1], 10);
    const b = db.bookings.find((item) => item.id === bookingId);
    return ok({
      bookingNumber: b?.bookingNumber || 'VG-100000',
      status: b?.status || 'Pending',
      remainingSeconds: 840
    });
  }

  // 11. PAYMENT DETAILS & PROCESS
  const paymentStatusMatch = pathname.match(/^\/api\/bookings\/(\d+)\/payment$/);
  if (paymentStatusMatch) {
    const bookingId = parseInt(paymentStatusMatch[1], 10);
    const b = db.bookings.find((item) => item.id === bookingId);

    if (method === 'GET') {
      return ok({
        bookingId,
        amountDue: b?.totalPrice || 3500,
        paymentStatus: b?.paymentStatus || 'Pending',
        isPaid: b?.paymentStatus === 'Paid'
      });
    }

    if (method === 'POST') {
      const receiptNumber = 'RCT-' + Date.now().toString().slice(-6);
      if (b) {
        b.paymentStatus = 'Paid';
        b.status = 'Confirmed';

        db.payments.unshift({
          paymentId: Date.now() % 100000,
          bookingId: b.id,
          receiptNumber,
          amount: b.totalPrice,
          paymentDate: new Date().toISOString()
        });

        db.notifications.unshift({
          id: Date.now() % 100000,
          customerId: 1,
          bookingId: b.id,
          title: 'Payment Successful',
          message: `Your payment of LKR ${b.totalPrice.toLocaleString()} for ${b.eventName} has cleared. Ref: ${receiptNumber}`,
          type: 'payment',
          isRead: false,
          createdAt: new Date().toISOString(),
          icon: 'fa-solid fa-receipt text-success'
        });

        saveDatabase(db);
      }

      return ok({
        message: 'Payment processed successfully.',
        receiptNumber
      });
    }
  }

  if (pathname === '/api/payments/customer' && method === 'GET') {
    return ok(db.payments);
  }

  const receiptMatch = pathname.match(/^\/api\/payments\/(\d+)\/receipt$/);
  if (receiptMatch && method === 'GET') {
    const pId = parseInt(receiptMatch[1], 10);
    const p = db.payments.find((item) => item.paymentId === pId) || db.payments[0];
    const b = db.bookings.find((item) => item.id === p?.bookingId) || db.bookings[0];

    const receipt: ReceiptDto = {
      receiptNumber: p?.receiptNumber || 'RCT-884210',
      customerEmail: 'customer@venuego.com',
      paymentDate: p?.paymentDate || new Date().toISOString(),
      totalAmountPaid: p?.amount || 8750,
      bookingReference: b?.bookingNumber || 'VG-849201',
      eventName: b?.eventName || 'Symphony Under the Stars 2026'
    };
    return ok(receipt);
  }

  // 12. CUSTOMERS / PROFILES
  if (pathname === '/api/customers' && method === 'GET') {
    const search = url.searchParams.get('search');
    let list = [...db.customers];
    if (search) {
      const s = search.toLowerCase();
      list = list.filter((c) => c.name.toLowerCase().includes(s) || c.email.toLowerCase().includes(s));
    }
    return ok(list);
  }

  const profileMatch = pathname.match(/^\/api\/customers\/(\d+)$/);
  if (profileMatch) {
    const custId = parseInt(profileMatch[1], 10);
    const cust = db.customers.find((c) => c.id === custId) || db.customers[1] || db.customers[0];

    if (method === 'GET') {
      const profile: CustomerProfileDto = {
        id: cust.id,
        name: cust.name,
        email: cust.email,
        phone: cust.phone,
        status: cust.status
      };
      return ok(profile);
    }

    if (method === 'PUT') {
      const body: any = req.body || {};
      if (cust) {
        cust.name = body.name || cust.name;
        cust.phone = body.phone || cust.phone;
        saveDatabase(db);
      }
      return ok({ message: 'Profile updated.' });
    }

    if (method === 'DELETE') {
      if (cust) {
        cust.status = 'Inactive';
        saveDatabase(db);
      }
      return ok({ message: 'Customer deactivated.' });
    }
  }

  const reactivateMatch = pathname.match(/^\/api\/customers\/(\d+)\/reactivate$/);
  if (reactivateMatch && method === 'POST') {
    const custId = parseInt(reactivateMatch[1], 10);
    const cust = db.customers.find((c) => c.id === custId);
    if (cust) {
      cust.status = 'Active';
      saveDatabase(db);
    }
    return ok({ message: 'Customer reactivated.' });
  }

  // 13. NOTIFICATIONS
  const notifsMatch = pathname.match(/^\/api\/notifications\/customer\/(\d+)$/);
  if (notifsMatch && method === 'GET') {
    return ok(
      db.notifications.map((n) => ({
        id: n.id,
        customerId: n.customerId || 1,
        message: n.message,
        isRead: n.isRead,
        createdAt: n.createdAt
      }))
    );
  }

  const readNotifMatch = pathname.match(/^\/api\/notifications\/(\d+)\/read$/);
  if (readNotifMatch && method === 'PUT') {
    const nId = parseInt(readNotifMatch[1], 10);
    const notif = db.notifications.find((n) => n.id === nId);
    if (notif) {
      notif.isRead = true;
      saveDatabase(db);
    }
    return ok({ message: 'Notification marked read.' });
  }

  // Fallback for any other /api/* request
  return ok({ message: 'Mock response for ' + pathname });
};
