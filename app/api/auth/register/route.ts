import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { username, email, phone, password, role } = await req.json();

    if ((!email && !phone) || !password || !role) {
      return NextResponse.json(
        { error: 'Email or phone, password, and role are required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = email 
      ? await prisma.user.findUnique({ where: { email } })
      : await prisma.user.findUnique({ where: { phone } });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 409 }
      );
    }

    // Check if username already exists
    if (username) {
      const existingUsername = await prisma.user.findUnique({ where: { username } });
      if (existingUsername) {
        return NextResponse.json(
          { error: 'Username already taken' },
          { status: 409 }
        );
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        ...(username && { username }),
        ...(email && { email }),
        ...(phone && { phone }),
        password: hashedPassword,
        role,
        emailVerified: email ? false : undefined,
        phoneVerified: phone ? false : undefined,
      },
    });

    return NextResponse.json(
      {
        message: `User created successfully. Please verify your ${email ? 'email' : 'phone'}.`,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          phone: user.phone,
          role: user.role,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Failed to register user' },
      { status: 500 }
    );
  }
}
