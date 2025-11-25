import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getSession();

    if (!session.isLoggedIn || !session.userId) {
      return NextResponse.json(
        { user: null, isLoggedIn: false },
        { status: 200 }
      );
    }

    // Fetch user data including avatarUrl from database
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        username: true,
        email: true,
        phone: true,
        role: true,
        avatarUrl: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { user: null, isLoggedIn: false },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          phone: user.phone,
          role: user.role,
          avatarUrl: user.avatarUrl,
        },
        isLoggedIn: true,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Session check error:', error);
    return NextResponse.json(
      { user: null, isLoggedIn: false },
      { status: 200 }
    );
  }
}
