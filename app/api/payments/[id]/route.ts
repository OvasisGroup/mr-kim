import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import prisma from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();

    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const payment = await prisma.payment.findUnique({
      where: { id },
      include: {
        payer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true,
            email: true,
            role: true,
            avatarUrl: true,
          },
        },
        recipient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true,
            email: true,
            role: true,
            avatarUrl: true,
          },
        },
        booking: {
          select: {
            id: true,
            serviceName: true,
            serviceType: true,
            bookingDate: true,
            description: true,
            status: true,
          },
        },
      },
    });

    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    // Check authorization
    if (
      session.role !== 'ADMIN' &&
      payment.payerId !== session.userId &&
      payment.recipientId !== session.userId
    ) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({ payment });
  } catch (error) {
    console.error('Error fetching payment:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payment' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();

    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    // Find the payment
    const existingPayment = await prisma.payment.findUnique({
      where: { id },
    });

    if (!existingPayment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    // Only admin or the payer can update payment
    if (session.role !== 'ADMIN' && existingPayment.payerId !== session.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Update payment
    const payment = await prisma.payment.update({
      where: { id },
      data: {
        status: body.status,
        transactionId: body.transactionId,
        metadata: body.metadata,
      },
      include: {
        payer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true,
            email: true,
            role: true,
            avatarUrl: true,
          },
        },
        recipient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true,
            email: true,
            role: true,
            avatarUrl: true,
          },
        },
        booking: {
          select: {
            id: true,
            serviceName: true,
            serviceType: true,
            bookingDate: true,
          },
        },
      },
    });

    return NextResponse.json({ payment });
  } catch (error) {
    console.error('Error updating payment:', error);
    return NextResponse.json(
      { error: 'Failed to update payment' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();

    if (!session?.userId || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    await prisma.payment.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Payment deleted successfully' });
  } catch (error) {
    console.error('Error deleting payment:', error);
    return NextResponse.json(
      { error: 'Failed to delete payment' },
      { status: 500 }
    );
  }
}
