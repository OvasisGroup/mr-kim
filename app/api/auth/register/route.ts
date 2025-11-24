import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { email, phone, password, role } = await req.json();

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

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
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
