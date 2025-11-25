# 📅 Booking System with Google Calendar Integration

## Overview

The Mr. Kim platform now includes a comprehensive booking system that allows customers to book services from service providers with automatic Google Calendar synchronization.

## Features

### Core Booking Features
- ✅ Create, view, update, and cancel bookings
- ✅ Book services from service providers
- ✅ Track booking status (Pending, Confirmed, Cancelled, Completed, No Show)
- ✅ Add notes and descriptions to bookings
- ✅ Set custom duration for each booking
- ✅ View all bookings in one place

### Google Calendar Integration
- ✅ One-click Google Calendar connection
- ✅ Automatic calendar event creation for bookings
- ✅ Real-time sync of booking updates to calendar
- ✅ Calendar event deletion when bookings are cancelled
- ✅ Separate events for customers and service providers
- ✅ Email notifications to all participants
- ✅ Smart reminders (1 day and 1 hour before)

## Quick Start

### 1. Database Setup

The booking system is already configured in your database with these changes:

**User Model Extensions:**
- `googleCalendarToken` - Stores Google OAuth access token
- `googleCalendarRefresh` - Stores refresh token for long-term access
- `customerBookings` - Relation to bookings as a customer
- `providerBookings` - Relation to bookings as a service provider

**New Booking Model:**
```prisma
model Booking {
  id                    String        @id
  customerId            String
  providerId            String
  serviceType           String
  serviceName           String
  description           String?
  bookingDate           DateTime
  duration              Int           @default(60)
  status                BookingStatus
  notes                 String?
  googleCalendarEventId String?
  // ... relations and timestamps
}
```

### 2. Google Calendar Setup

Follow the detailed setup guide in [GOOGLE-CALENDAR-SETUP.md](./GOOGLE-CALENDAR-SETUP.md):

1. Create a Google Cloud Project
2. Enable Google Calendar API
3. Configure OAuth consent screen
4. Create OAuth2 credentials
5. Update environment variables

### 3. Environment Variables

Add these to your `.env` file:

```env
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GOOGLE_REDIRECT_URI="http://localhost:3000/api/auth/google/callback"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

## User Guide

### For Customers

1. **Connect Google Calendar** (one-time)
   - Go to `/dashboard/customer/bookings`
   - Click "Connect Google Calendar"
   - Authorize the application
   - ✅ You're connected!

2. **Create a Booking**
   - Click "New Booking" button
   - Select a service provider
   - Choose service type and name
   - Pick date and time
   - Set duration (default: 60 minutes)
   - Add description and notes
   - Submit booking

3. **Manage Bookings**
   - View all your bookings
   - See status (Pending, Confirmed, etc.)
   - Cancel bookings if needed
   - Calendar events update automatically

### For Service Providers

1. **Connect Google Calendar**
   - Go to `/dashboard/service-provider/bookings`
   - Click "Connect Google Calendar"
   - Authorize the application

2. **Receive Bookings**
   - Customers book your services
   - You receive calendar events automatically
   - View all bookings in your dashboard
   - Confirm or manage bookings

3. **Update Booking Status**
   - Mark bookings as confirmed
   - Complete bookings after service
   - Calendar updates automatically

## API Reference

### Bookings API

#### List Bookings
```typescript
GET /api/bookings?role=customer&status=PENDING

Response: {
  bookings: Booking[]
}
```

#### Get Single Booking
```typescript
GET /api/bookings/:id

Response: {
  booking: Booking
}
```

#### Create Booking
```typescript
POST /api/bookings

Body: {
  providerId: string;
  serviceType: string;
  serviceName: string;
  description?: string;
  bookingDate: string; // ISO format
  duration?: number;   // minutes (default: 60)
  notes?: string;
}

Response: {
  message: string;
  booking: Booking;
}
```

#### Update Booking
```typescript
PUT /api/bookings/:id

Body: {
  serviceType?: string;
  serviceName?: string;
  description?: string;
  bookingDate?: string;
  duration?: number;
  notes?: string;
  status?: BookingStatus;
}

Response: {
  message: string;
  booking: Booking;
}
```

#### Delete Booking
```typescript
DELETE /api/bookings/:id

Response: {
  message: string;
}
```

### Google Calendar API

#### Get Auth URL
```typescript
GET /api/auth/google/connect

Response: {
  authUrl: string;
}
```

#### OAuth Callback
```typescript
GET /api/auth/google/callback?code=<auth-code>

// Stores tokens and redirects to bookings page
```

## Booking Statuses

| Status | Description |
|--------|-------------|
| `PENDING` | Booking created, awaiting confirmation |
| `CONFIRMED` | Service provider confirmed the booking |
| `CANCELLED` | Booking was cancelled |
| `COMPLETED` | Service was completed |
| `NO_SHOW` | Customer didn't show up |

## Calendar Sync Behavior

### When Creating a Booking
- Creates calendar event for customer (if connected)
- Creates calendar event for provider (if connected)
- Stores event ID in booking record
- Sends email notifications to both parties

### When Updating a Booking
- Updates both calendar events with new details
- Changes event status based on booking status
- Sends update notifications

### When Cancelling a Booking
- Marks calendar events as cancelled
- Keeps events visible with cancelled status
- Sends cancellation notifications

### When Deleting a Booking
- Completely removes calendar events
- Sends deletion notifications
- Removes booking from database

## UI Components

### Customer Bookings Page
- **Location**: `/app/dashboard/customer/bookings/page.tsx`
- **Features**:
  - List all bookings
  - Connect Google Calendar button
  - Create new booking button
  - Filter by status
  - Cancel bookings
  - View booking details

### Provider Bookings Page
- **Location**: `/app/dashboard/service-provider/bookings/page.tsx`
- **Features**: (Similar to customer page, provider perspective)

### Booking Cards
- Service name and type
- Date and time
- Duration
- Status badge with icon
- Provider/Customer information
- Google Calendar sync indicator
- Action buttons

## Technical Architecture

### Backend
- **API Routes**: `/app/api/bookings/`
- **Calendar Integration**: `/lib/google-calendar.ts`
- **Database**: Prisma with PostgreSQL

### Frontend
- **Framework**: Next.js 16 with App Router
- **UI**: shadcn/ui components
- **Styling**: Tailwind CSS
- **Date Formatting**: date-fns

### Google Integration
- **OAuth2**: google-auth-library
- **Calendar API**: googleapis
- **Scopes**: `calendar.events` (create/edit/delete events)

## Security

- OAuth2 tokens encrypted and stored securely
- Session-based authentication required for all booking operations
- Users can only access their own bookings
- Calendar access limited to event management only
- Refresh tokens enable long-term access without re-auth

## Limitations

- Google Calendar API has daily quota limits (check Google Cloud Console)
- Users must have a Google account to use calendar sync
- Calendar sync is optional (bookings work without it)
- Timezone is set to 'Africa/Nairobi' by default

## Future Enhancements

- [ ] Calendar view for bookings
- [ ] Recurring bookings
- [ ] Booking conflicts detection
- [ ] Payment integration
- [ ] Rating and review system
- [ ] SMS reminders
- [ ] Multiple calendar support (Outlook, Apple Calendar)
- [ ] Availability slots for providers
- [ ] Booking templates

## Troubleshooting

### Calendar Not Syncing
1. Check if user is connected (look for green banner)
2. Verify environment variables are set
3. Check server logs for API errors
4. Ensure Google Calendar API is enabled

### OAuth Errors
1. Verify client ID and secret
2. Check redirect URI matches exactly
3. Ensure consent screen is configured
4. Add test users if in testing mode

### Missing Bookings
1. Check booking status filter
2. Verify user role (customer vs provider)
3. Look for error messages in browser console

## Support

For detailed setup instructions, see [GOOGLE-CALENDAR-SETUP.md](./GOOGLE-CALENDAR-SETUP.md)

For general app setup, see [SETUP.md](./SETUP.md)

---

**Version**: 1.0.0  
**Last Updated**: November 2025
