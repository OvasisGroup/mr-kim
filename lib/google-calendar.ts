/* eslint-disable @typescript-eslint/no-explicit-any */
import { google } from 'googleapis';
import type { OAuth2Client } from 'google-auth-library';

const SCOPES = ['https://www.googleapis.com/auth/calendar.events'];

// Create OAuth2 client
export function getOAuth2Client() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI || `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/google/callback`
  );
}

// Generate authorization URL
export function getAuthUrl() {
  const oauth2Client = getOAuth2Client();
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent',
  });
}

// Exchange authorization code for tokens
export async function getTokensFromCode(code: string) {
  const oauth2Client = getOAuth2Client();
  const { tokens } = await oauth2Client.getToken(code);
  return tokens;
}

// Set credentials for OAuth2 client
export function setCredentials(oauth2Client: OAuth2Client, accessToken: string, refreshToken?: string) {
  oauth2Client.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken,
  });
}

// Create calendar event
export async function createCalendarEvent(
  accessToken: string,
  refreshToken: string | undefined,
  eventDetails: {
    summary: string;
    description?: string;
    startTime: Date;
    endTime: Date;
    attendees?: string[];
    location?: string;
  }
) {
  const oauth2Client = getOAuth2Client();
  setCredentials(oauth2Client, accessToken, refreshToken);

  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

  const event = {
    summary: eventDetails.summary,
    description: eventDetails.description,
    location: eventDetails.location,
    start: {
      dateTime: eventDetails.startTime.toISOString(),
      timeZone: 'Africa/Nairobi', // Kenya timezone
    },
    end: {
      dateTime: eventDetails.endTime.toISOString(),
      timeZone: 'Africa/Nairobi',
    },
    attendees: eventDetails.attendees?.map(email => ({ email })),
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'email', minutes: 24 * 60 }, // 1 day before
        { method: 'popup', minutes: 60 }, // 1 hour before
      ],
    },
  };

  const response = await calendar.events.insert({
    calendarId: 'primary',
    requestBody: event,
    sendUpdates: 'all', // Send notifications to all attendees
  });

  return response.data;
}

// Update calendar event
export async function updateCalendarEvent(
  accessToken: string,
  refreshToken: string | undefined,
  eventId: string,
  eventDetails: {
    summary?: string;
    description?: string;
    startTime?: Date;
    endTime?: Date;
    attendees?: string[];
    location?: string;
    status?: 'confirmed' | 'tentative' | 'cancelled';
  }
) {
  const oauth2Client = getOAuth2Client();
  setCredentials(oauth2Client, accessToken, refreshToken);

  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

  const event: any = {};

  if (eventDetails.summary) event.summary = eventDetails.summary;
  if (eventDetails.description) event.description = eventDetails.description;
  if (eventDetails.location) event.location = eventDetails.location;
  if (eventDetails.status) event.status = eventDetails.status;
  
  if (eventDetails.startTime) {
    event.start = {
      dateTime: eventDetails.startTime.toISOString(),
      timeZone: 'Africa/Nairobi',
    };
  }
  
  if (eventDetails.endTime) {
    event.end = {
      dateTime: eventDetails.endTime.toISOString(),
      timeZone: 'Africa/Nairobi',
    };
  }
  
  if (eventDetails.attendees) {
    event.attendees = eventDetails.attendees.map(email => ({ email }));
  }

  const response = await calendar.events.patch({
    calendarId: 'primary',
    eventId,
    requestBody: event,
    sendUpdates: 'all',
  });

  return response.data;
}

// Delete calendar event
export async function deleteCalendarEvent(
  accessToken: string,
  refreshToken: string | undefined,
  eventId: string
) {
  const oauth2Client = getOAuth2Client();
  setCredentials(oauth2Client, accessToken, refreshToken);

  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

  await calendar.events.delete({
    calendarId: 'primary',
    eventId,
    sendUpdates: 'all',
  });
}

// Get calendar event
export async function getCalendarEvent(
  accessToken: string,
  refreshToken: string | undefined,
  eventId: string
) {
  const oauth2Client = getOAuth2Client();
  setCredentials(oauth2Client, accessToken, refreshToken);

  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

  const response = await calendar.events.get({
    calendarId: 'primary',
    eventId,
  });

  return response.data;
}

// List calendar events
export async function listCalendarEvents(
  accessToken: string,
  refreshToken: string | undefined,
  timeMin?: Date,
  timeMax?: Date,
  maxResults: number = 50
) {
  const oauth2Client = getOAuth2Client();
  setCredentials(oauth2Client, accessToken, refreshToken);

  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

  const response = await calendar.events.list({
    calendarId: 'primary',
    timeMin: timeMin?.toISOString(),
    timeMax: timeMax?.toISOString(),
    maxResults,
    singleEvents: true,
    orderBy: 'startTime',
  });

  return response.data.items || [];
}
