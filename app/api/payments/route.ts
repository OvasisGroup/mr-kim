import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const filter = searchParams.get('filter') || 'all'; // all, sent, received

    let payments;

    if (session.role === 'ADMIN') {
      // Admins can see all payments
      payments = await prisma.payment.findMany({
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
        orderBy: {
          createdAt: 'desc',
        },
      });
    } else {
      // Regular users see their own payments
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const where: any = {};

      if (filter === 'sent') {
        where.payerId = session.userId;
      } else if (filter === 'received') {
        where.recipientId = session.userId;
      } else {
        // Show both sent and received
        where.OR = [
          { payerId: session.userId },
          { recipientId: session.userId },
        ];
      }

      payments = await prisma.payment.findMany({
        where,
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
        orderBy: {
          createdAt: 'desc',
        },
      });
    }

    // Calculate statistics
    const sentPayments = payments.filter(p => p.payerId === session.userId);
    const receivedPayments = payments.filter(p => p.recipientId === session.userId);

    const stats = {
      totalSent: sentPayments.reduce((sum, p) => sum + p.amount, 0),
      totalReceived: receivedPayments.reduce((sum, p) => sum + p.amount, 0),
      totalTransactions: payments.length,
      completedCount: payments.filter(p => p.status === 'COMPLETED').length,
      pendingCount: payments.filter(p => p.status === 'PENDING').length,
      failedCount: payments.filter(p => p.status === 'FAILED').length,
    };

    return NextResponse.json({ payments, stats });
  } catch (error) {
    console.error('Error fetching payments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payments' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      bookingId,
      recipientId,
      amount,
      currency = 'USD',
      paymentMethod,
      description,
      metadata,
    } = body;

    // Validate required fields
    if (!amount || !paymentMethod) {
      return NextResponse.json(
        { error: 'Amount and payment method are required' },
        { status: 400 }
      );
    }

    // Create payment
    const payment = await prisma.payment.create({
      data: {
        payerId: session.userId,
        recipientId,
        bookingId,
        amount: parseFloat(amount),
        currency,
        paymentMethod,
        description,
        metadata: metadata || {},
        status: 'PENDING',
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

    return NextResponse.json({ payment }, { status: 201 });
  } catch (error) {
    console.error('Error creating payment:', error);
    return NextResponse.json(
      { error: 'Failed to create payment' },
      { status: 500 }
    );
  }
}
