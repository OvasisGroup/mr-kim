import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import prisma from '@/lib/prisma';
import { createCalendarEvent } from '@/lib/google-calendar';

// GET - List all bookings for the logged-in user
export async function GET(req: NextRequest) {
  try {
    const session = await getSession();

    if (!session.isLoggedIn || !session.userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const role = searchParams.get('role'); // 'customer' or 'provider'

    const whereClause: any = {};

    // Filter by booking status if provided
    if (status) {
      whereClause.status = status;
    }

    // Filter by role (customer or provider)
    if (role === 'customer') {
      whereClause.customerId = session.userId;
    } else if (role === 'provider') {
      whereClause.providerId = session.userId;
    } else {
      // Default: show bookings where user is either customer or provider
      whereClause.OR = [
        { customerId: session.userId },
        { providerId: session.userId },
      ];
    }

    const bookings = await prisma.booking.findMany({
      where: whereClause,
      include: {
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            username: true,
            avatarUrl: true,
          },
        },
        provider: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            username: true,
            avatarUrl: true,
            serviceProviderProfile: true,
          },
        },
      },
      orderBy: {
        bookingDate: 'desc',
      },
    });

    return NextResponse.json({ bookings }, { status: 200 });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
}

// POST - Create a new booking
export async function POST(req: NextRequest) {
  try {
    const session = await getSession();

    if (!session.isLoggedIn || !session.userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { providerId, serviceType, serviceName, description, bookingDate, duration, notes } = body;

    // Validate required fields
    if (!providerId || !serviceType || !serviceName || !bookingDate) {
      return NextResponse.json(
        { error: 'Provider, service type, service name, and booking date are required' },
        { status: 400 }
      );
    }

    // Verify provider exists and is a service provider
    const provider = await prisma.user.findUnique({
      where: { id: providerId },
      include: {
        serviceProviderProfile: true,
      },
    });

    if (!provider || provider.role !== 'SERVICE_PROVIDER') {
      return NextResponse.json(
        { error: 'Invalid service provider' },
        { status: 400 }
      );
    }

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        customerId: session.userId,
        providerId,
        serviceType,
        serviceName,
        description,
        bookingDate: new Date(bookingDate),
        duration: duration || 60,
        notes,
        status: 'PENDING',
      },
      include: {
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            username: true,
            googleCalendarToken: true,
            googleCalendarRefresh: true,
          },
        },
        provider: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            username: true,
            googleCalendarToken: true,
            googleCalendarRefresh: true,
          },
        },
      },
    });

    // Try to create Google Calendar events for both customer and provider
    let customerEventId: string | undefined;
    let providerEventId: string | undefined;

    const startTime = new Date(bookingDate);
    const endTime = new Date(startTime.getTime() + (duration || 60) * 60000);

    // Create calendar event for customer if they have connected Google Calendar
    if (booking.customer.googleCalendarToken) {
      try {
        const customerEvent = await createCalendarEvent(
          booking.customer.googleCalendarToken,
          booking.customer.googleCalendarRefresh || undefined,
          {
            summary: `${serviceName} - Booking`,
            description: `Service: ${serviceName}\nType: ${serviceType}\nProvider: ${provider.firstName || provider.username || 'Service Provider'}\n\n${description || ''}`,
            startTime,
            endTime,
            attendees: provider.email ? [provider.email] : [],
          }
        );
        customerEventId = customerEvent.id || undefined;
      } catch (error) {
        console.error('Failed to create customer calendar event:', error);
      }
    }

    // Create calendar event for provider if they have connected Google Calendar
    if (booking.provider.googleCalendarToken) {
      try {
        const providerEvent = await createCalendarEvent(
          booking.provider.googleCalendarToken,
          booking.provider.googleCalendarRefresh || undefined,
          {
            summary: `${serviceName} - Booking`,
            description: `Service: ${serviceName}\nType: ${serviceType}\nCustomer: ${booking.customer.firstName || booking.customer.username || 'Customer'}\n\n${description || ''}`,
            startTime,
            endTime,
            attendees: booking.customer.email ? [booking.customer.email] : [],
          }
        );
        providerEventId = providerEvent.id || undefined;
      } catch (error) {
        console.error('Failed to create provider calendar event:', error);
      }
    }

    // Update booking with Google Calendar event ID (use customer's event ID as primary)
    if (customerEventId || providerEventId) {
      await prisma.booking.update({
        where: { id: booking.id },
        data: {
          googleCalendarEventId: customerEventId || providerEventId,
        },
      });
    }

    return NextResponse.json(
      {
        message: 'Booking created successfully',
        booking: {
          ...booking,
          googleCalendarEventId: customerEventId || providerEventId,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating booking:', error);
    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    );
  }
}
