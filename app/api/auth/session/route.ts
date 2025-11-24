import { NextResponse } from 'next/server';
import { getSession, defaultSession } from '@/lib/session';

export async function GET() {
  try {
    const session = await getSession();

    if (!session.isLoggedIn) {
      return NextResponse.json(
        { user: null, isLoggedIn: false },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        user: {
          id: session.userId,
          email: session.email,
          phone: session.phone,
          role: session.role,
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
