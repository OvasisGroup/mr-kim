import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();

    if (!session.isLoggedIn || !session.userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        emailNotifications: true,
        pushNotifications: true,
        smsNotifications: true,
        profileVisible: true,
        showEmail: true,
        showPhone: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getSession();

    if (!session.isLoggedIn || !session.userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const {
      emailNotifications,
      pushNotifications,
      smsNotifications,
      profileVisible,
      showEmail,
      showPhone,
    } = body;

    const updatedUser = await prisma.user.update({
      where: { id: session.userId },
      data: {
        emailNotifications,
        pushNotifications,
        smsNotifications,
        profileVisible,
        showEmail,
        showPhone,
      },
      select: {
        emailNotifications: true,
        pushNotifications: true,
        smsNotifications: true,
        profileVisible: true,
        showEmail: true,
        showPhone: true,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
