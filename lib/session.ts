import { getIronSession, IronSession, SessionOptions } from 'iron-session';
import { cookies } from 'next/headers';

export interface SessionData {
  userId: string;
  username?: string;
  email?: string;
  phone?: string;
  role: 'CUSTOMER' | 'VENDOR' | 'SERVICE_PROVIDER' | 'ADMIN';
  isLoggedIn: boolean;
}

export const defaultSession: SessionData = {
  userId: '',
  role: 'CUSTOMER',
  isLoggedIn: false,
};

export const sessionOptions: SessionOptions = {
  password: process.env.SESSION_SECRET || 'complex_password_at_least_32_characters_long',
  cookieName: 'mrkim-session',
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  },
};

export async function getSession(): Promise<IronSession<SessionData>> {
  const cookieStore = await cookies();
  return getIronSession<SessionData>(cookieStore, sessionOptions);
}
