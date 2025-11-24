import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();

    if (!session.isLoggedIn || session.role !== 'SERVICE_PROVIDER') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { serviceName, serviceType, description } = await req.json();

    if (!serviceName || !serviceType) {
      return NextResponse.json(
        { error: 'Service name and type are required' },
        { status: 400 }
      );
    }

    const profile = await prisma.serviceProviderProfile.upsert({
      where: { userId: session.userId },
      update: {
        serviceName,
        serviceType,
        description,
      },
      create: {
        userId: session.userId,
        serviceName,
        serviceType,
        description,
      },
    });

    return NextResponse.json(
      { message: 'Profile updated successfully', profile },
      { status: 200 }
    );
  } catch (error) {
    console.error('Service provider profile error:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await getSession();

    if (!session.isLoggedIn || session.role !== 'SERVICE_PROVIDER') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const profile = await prisma.serviceProviderProfile.findUnique({
      where: { userId: session.userId },
    });

    return NextResponse.json({ profile }, { status: 200 });
  } catch (error) {
    console.error('Service provider profile fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}
