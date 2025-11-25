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
        id: true,
        username: true,
        email: true,
        phone: true,
        role: true,
        firstName: true,
        lastName: true,
        address: true,
        city: true,
        bio: true,
        avatarUrl: true,
        emailVerified: true,
        phoneVerified: true,
        createdAt: true,
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
    console.error('Error fetching profile:', error);
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
    const { username, firstName, lastName, email, phone, address, city, bio } = body;

    // Check if username is being changed and is already taken
    if (username) {
      const existingUser = await prisma.user.findUnique({
        where: { username },
      });

      if (existingUser && existingUser.id !== session.userId) {
        return NextResponse.json(
          { error: 'Username already taken' },
          { status: 400 }
        );
      }
    }

    // Check if email is being changed and is already taken
    if (email) {
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser && existingUser.id !== session.userId) {
        return NextResponse.json(
          { error: 'Email already in use' },
          { status: 400 }
        );
      }
    }

    // Check if phone is being changed and is already taken
    if (phone) {
      const existingUser = await prisma.user.findUnique({
        where: { phone },
      });

      if (existingUser && existingUser.id !== session.userId) {
        return NextResponse.json(
          { error: 'Phone number already in use' },
          { status: 400 }
        );
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.userId },
      data: {
        username,
        firstName,
        lastName,
        email,
        phone,
        address,
        city,
        bio,
      },
      select: {
        id: true,
        username: true,
        email: true,
        phone: true,
        role: true,
        firstName: true,
        lastName: true,
        address: true,
        city: true,
        bio: true,
        avatarUrl: true,
        emailVerified: true,
        phoneVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
