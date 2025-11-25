import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { getAuthUrl } from '@/lib/google-calendar';

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();

    if (!session.isLoggedIn || !session.userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const authUrl = getAuthUrl();

    return NextResponse.json({ authUrl }, { status: 200 });
  } catch (error) {
    console.error('Error generating Google OAuth URL:', error);
    return NextResponse.json(
      { error: 'Failed to generate OAuth URL' },
      { status: 500 }
    );
  }
}
