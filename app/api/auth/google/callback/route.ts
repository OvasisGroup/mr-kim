import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { getTokensFromCode } from '@/lib/google-calendar';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();

    if (!session.isLoggedIn || !session.userId) {
      return NextResponse.redirect(new URL('/login', req.url));
    }

    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
      console.error('Google OAuth error:', error);
      return NextResponse.redirect(
        new URL('/dashboard/customer/bookings?error=google_auth_failed', req.url)
      );
    }

    if (!code) {
      return NextResponse.redirect(
        new URL('/dashboard/customer/bookings?error=no_code', req.url)
      );
    }

    // Exchange code for tokens
    const tokens = await getTokensFromCode(code);

    if (!tokens.access_token) {
      return NextResponse.redirect(
        new URL('/dashboard/customer/bookings?error=no_access_token', req.url)
      );
    }

    // Store tokens in database
    await prisma.user.update({
      where: { id: session.userId },
      data: {
        googleCalendarToken: tokens.access_token,
        googleCalendarRefresh: tokens.refresh_token,
      },
    });

    // Redirect to bookings page with success message
    return NextResponse.redirect(
      new URL('/dashboard/customer/bookings?calendar_connected=true', req.url)
    );
  } catch (error) {
    console.error('Error in Google OAuth callback:', error);
    return NextResponse.redirect(
      new URL('/dashboard/customer/bookings?error=callback_failed', req.url)
    );
  }
}
