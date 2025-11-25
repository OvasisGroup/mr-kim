import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import prisma from '@/lib/prisma';
import { updateCalendarEvent, deleteCalendarEvent } from '@/lib/google-calendar';

// GET - Get a specific booking by ID
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();

    if (!session.isLoggedIn || !session.userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;

    const booking = await prisma.booking.findUnique({
      where: { id },
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
    });

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Check if user is authorized to view this booking
    if (booking.customerId !== session.userId && booking.providerId !== session.userId) {
      return NextResponse.json(
        { error: 'Unauthorized to view this booking' },
        { status: 403 }
      );
    }

    return NextResponse.json({ booking }, { status: 200 });
  } catch (error) {
    console.error('Error fetching booking:', error);
    return NextResponse.json(
      { error: 'Failed to fetch booking' },
      { status: 500 }
    );
  }
}

// PUT - Update a booking
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();

    if (!session.isLoggedIn || !session.userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        customer: {
          select: {
            googleCalendarToken: true,
            googleCalendarRefresh: true,
            email: true,
          },
        },
        provider: {
          select: {
            googleCalendarToken: true,
            googleCalendarRefresh: true,
            email: true,
          },
        },
      },
    });

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Check if user is authorized to update this booking
    if (booking.customerId !== session.userId && booking.providerId !== session.userId) {
      return NextResponse.json(
        { error: 'Unauthorized to update this booking' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { serviceType, serviceName, description, bookingDate, duration, notes, status } = body;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: any = {};
    
    if (serviceType !== undefined) updateData.serviceType = serviceType;
    if (serviceName !== undefined) updateData.serviceName = serviceName;
    if (description !== undefined) updateData.description = description;
    if (bookingDate !== undefined) updateData.bookingDate = new Date(bookingDate);
    if (duration !== undefined) updateData.duration = duration;
    if (notes !== undefined) updateData.notes = notes;
    if (status !== undefined) updateData.status = status;

    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: updateData,
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
    });

    // Update Google Calendar events if booking details changed
    if (booking.googleCalendarEventId && (bookingDate || duration || serviceName || description || status)) {
      const startTime = bookingDate ? new Date(bookingDate) : booking.bookingDate;
      const endTime = new Date(startTime.getTime() + (duration || booking.duration) * 60000);

      const calendarStatus = status === 'CANCELLED' ? 'cancelled' as const :
                            status === 'CONFIRMED' ? 'confirmed' as const :
                            'tentative' as const;

      // Update customer's calendar event
      if (booking.customer.googleCalendarToken) {
        try {
          await updateCalendarEvent(
            booking.customer.googleCalendarToken,
            booking.customer.googleCalendarRefresh || undefined,
            booking.googleCalendarEventId,
            {
              summary: serviceName ? `${serviceName} - Booking` : undefined,
              description: description !== undefined ? description : undefined,
              startTime: bookingDate ? startTime : undefined,
              endTime: bookingDate || duration ? endTime : undefined,
              status: calendarStatus,
            }
          );
        } catch (error) {
          console.error('Failed to update customer calendar event:', error);
        }
      }

      // Update provider's calendar event
      if (booking.provider.googleCalendarToken) {
        try {
          await updateCalendarEvent(
            booking.provider.googleCalendarToken,
            booking.provider.googleCalendarRefresh || undefined,
            booking.googleCalendarEventId,
            {
              summary: serviceName ? `${serviceName} - Booking` : undefined,
              description: description !== undefined ? description : undefined,
              startTime: bookingDate ? startTime : undefined,
              endTime: bookingDate || duration ? endTime : undefined,
              status: calendarStatus,
            }
          );
        } catch (error) {
          console.error('Failed to update provider calendar event:', error);
        }
      }
    }

    return NextResponse.json(
      { message: 'Booking updated successfully', booking: updatedBooking },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating booking:', error);
    return NextResponse.json(
      { error: 'Failed to update booking' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a booking
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();

    if (!session.isLoggedIn || !session.userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        customer: {
          select: {
            googleCalendarToken: true,
            googleCalendarRefresh: true,
          },
        },
        provider: {
          select: {
            googleCalendarToken: true,
            googleCalendarRefresh: true,
          },
        },
      },
    });

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Check if user is authorized to delete this booking
    if (booking.customerId !== session.userId && booking.providerId !== session.userId) {
      return NextResponse.json(
        { error: 'Unauthorized to delete this booking' },
        { status: 403 }
      );
    }

    // Delete Google Calendar events
    if (booking.googleCalendarEventId) {
      // Delete from customer's calendar
      if (booking.customer.googleCalendarToken) {
        try {
          await deleteCalendarEvent(
            booking.customer.googleCalendarToken,
            booking.customer.googleCalendarRefresh || undefined,
            booking.googleCalendarEventId
          );
        } catch (error) {
          console.error('Failed to delete customer calendar event:', error);
        }
      }

      // Delete from provider's calendar
      if (booking.provider.googleCalendarToken) {
        try {
          await deleteCalendarEvent(
            booking.provider.googleCalendarToken,
            booking.provider.googleCalendarRefresh || undefined,
            booking.googleCalendarEventId
          );
        } catch (error) {
          console.error('Failed to delete provider calendar event:', error);
        }
      }
    }

    // Delete booking from database
    await prisma.booking.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: 'Booking deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting booking:', error);
    return NextResponse.json(
      { error: 'Failed to delete booking' },
      { status: 500 }
    );
  }
}
