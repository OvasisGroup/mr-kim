import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/session';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        username: true,
        email: true,
        phone: true,
        password: true,
        role: true,
        emailVerified: true,
        avatarUrl: true,
      },
    });

    if (!user || !user.password) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Block login if email not verified
    if (!user.emailVerified) {
      return NextResponse.json(
        { error: 'Email not verified. Please verify your email first.' },
        { status: 403 }
      );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Create session
    const session = await getSession();
    session.userId = user.id;
    session.username = user.username || undefined;
    session.email = user.email || undefined;
    session.role = user.role;
    session.isLoggedIn = true;
    await session.save();

    return NextResponse.json(
      {
        message: 'Login successful',
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          phone: user.phone,
          role: user.role,
          avatarUrl: user.avatarUrl,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Failed to login' },
      { status: 500 }
    );
  }
}
