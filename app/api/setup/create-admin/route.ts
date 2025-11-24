import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST() {
  try {
    const email = 'admin@mrkim.com';
    const password = 'Admin@123456';

    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email },
    });

    if (existingAdmin) {
      return NextResponse.json(
        { error: 'Admin user already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create admin user
    await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: 'ADMIN',
        emailVerified: true,
        phoneVerified: false,
      },
    });

    return NextResponse.json({
      message: 'Admin user created successfully!',
      credentials: {
        email,
        password,
        note: 'Please change password after first login',
      },
    });
  } catch (error) {
    console.error('Error creating admin:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create admin user',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
