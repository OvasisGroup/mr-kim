# Google Calendar Integration Setup

## Overview

This guide walks you through setting up Google Calendar integration for the Mr. Kim booking system. Once configured, bookings will automatically sync with users' Google Calendars.

## Features

- ✅ Automatic calendar event creation when bookings are made
- ✅ Real-time sync of booking updates to Google Calendar
- ✅ Calendar event deletion when bookings are cancelled
- ✅ OAuth2 authentication for secure access
- ✅ Separate calendar events for customers and service providers
- ✅ Email notifications to all participants
- ✅ Reminders (1 day before and 1 hour before)

## Prerequisites

- A Google Cloud Platform account
- Admin access to your application

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Enter project name: "Mr Kim Calendar Integration"
4. Click "Create"

## Step 2: Enable Google Calendar API

1. In the Google Cloud Console, go to "APIs & Services" → "Library"
2. Search for "Google Calendar API"
3. Click on it and press "Enable"

## Step 3: Configure OAuth Consent Screen

1. Go to "APIs & Services" → "OAuth consent screen"
2. Select "External" (or "Internal" if you have a Google Workspace)
3. Fill in the required information:
   - **App name**: Mr Kim
   - **User support email**: Your email
   - **Developer contact**: Your email
4. Click "Save and Continue"
5. On the "Scopes" page, click "Add or Remove Scopes"
6. Search for and add: `https://www.googleapis.com/auth/calendar.events`
7. Click "Update" and then "Save and Continue"
8. On "Test users", add your email for testing
9. Click "Save and Continue"

## Step 4: Create OAuth2 Credentials

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth client ID"
3. Select "Web application"
4. Fill in the details:
   - **Name**: Mr Kim Web Client
   - **Authorized JavaScript origins**: 
     - `http://localhost:3000` (for development)
     - Your production URL (e.g., `https://mrkim.com`)
   - **Authorized redirect URIs**:
     - `http://localhost:3000/api/auth/google/callback` (for development)
     - Your production callback URL (e.g., `https://mrkim.com/api/auth/google/callback`)
5. Click "Create"
6. Copy the **Client ID** and **Client Secret**

## Step 5: Update Environment Variables

Add the following to your `.env` file:

```env
# Google Calendar Integration
GOOGLE_CLIENT_ID="your-client-id-from-step-4"
GOOGLE_CLIENT_SECRET="your-client-secret-from-step-4"
GOOGLE_REDIRECT_URI="http://localhost:3000/api/auth/google/callback"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

For production, update these values accordingly.

## Step 6: Test the Integration

1. Start your development server: `pnpm dev`
2. Log in as a customer
3. Navigate to "Bookings" page
4. Click "Connect Google Calendar"
5. Authorize the application
6. Create a new booking
7. Check your Google Calendar to see the event

## Usage

### For Customers

1. Navigate to `/dashboard/customer/bookings`
2. Click "Connect Google Calendar" (one-time setup)
3. Authorize the app to access your calendar
4. Create bookings - they'll automatically appear in your calendar

### For Service Providers

1. Navigate to `/dashboard/service-provider/bookings`
2. Click "Connect Google Calendar" (one-time setup)
3. Authorize the app
4. When customers book your services, events will appear in your calendar

## API Endpoints

### Connect Google Calendar
```
GET /api/auth/google/connect
Returns: { authUrl: string }
```

### OAuth Callback
```
GET /api/auth/google/callback?code=<auth-code>
Stores tokens and redirects to bookings page
```

### Create Booking
```
POST /api/bookings
Body: {
  providerId: string,
  serviceType: string,
  serviceName: string,
  description?: string,
  bookingDate: string (ISO),
  duration?: number (minutes),
  notes?: string
}
```

### Update Booking
```
PUT /api/bookings/:id
Body: {
  serviceType?: string,
  serviceName?: string,
  description?: string,
  bookingDate?: string (ISO),
  duration?: number,
  status?: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW'
}
```

### Delete Booking
```
DELETE /api/bookings/:id
```

### List Bookings
```
GET /api/bookings?role=customer&status=PENDING
```

## Database Schema

### User Model (Extended)
```prisma
model User {
  // ... existing fields
  googleCalendarToken    String?
  googleCalendarRefresh  String?
  customerBookings       Booking[] @relation("CustomerBookings")
  providerBookings       Booking[] @relation("ProviderBookings")
}
```

### Booking Model
```prisma
model Booking {
  id                    String        @id @default(cuid())
  customerId            String
  providerId            String
  serviceType           String
  serviceName           String
  description           String?
  bookingDate           DateTime
  duration              Int           @default(60)
  status                BookingStatus @default(PENDING)
  notes                 String?
  googleCalendarEventId String?
  createdAt             DateTime      @default(now())
  updatedAt             DateTime      @updatedAt
  customer              User          @relation("CustomerBookings")
  provider              User          @relation("ProviderBookings")
}

enum BookingStatus {
  PENDING
  CONFIRMED
  CANCELLED
  COMPLETED
  NO_SHOW
}
```

## Troubleshooting

### Error: "Invalid OAuth2 credentials"
- Verify your `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are correct
- Ensure the redirect URI matches exactly (including http vs https)

### Error: "Access not configured"
- Make sure Google Calendar API is enabled in your Google Cloud project

### Calendar events not appearing
- Check that the user has connected their Google Calendar
- Verify the user's `googleCalendarToken` is stored in the database
- Check server logs for API errors

### Token expired errors
- The refresh token should automatically renew the access token
- If issues persist, the user may need to reconnect their calendar

## Security Notes

- OAuth2 tokens are stored securely in the database
- Refresh tokens allow long-term access without re-authorization
- Calendar access is limited to event creation/modification only
- Users can revoke access anytime from their Google account settings

## Production Deployment

Before deploying to production:

1. Update OAuth consent screen to "Production" status
2. Update authorized redirect URIs with production URL
3. Update environment variables in production
4. Test the complete flow in production environment
5. Monitor for any API quota issues (Google Calendar API has daily limits)

## Support

For issues or questions:
- Check the [Google Calendar API documentation](https://developers.google.com/calendar)
- Review server logs for detailed error messages
- Ensure all environment variables are correctly set

---

**Last Updated**: November 2025
