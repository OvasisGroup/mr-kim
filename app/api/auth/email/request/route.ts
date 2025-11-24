import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { generateOTP, hashOTP, getOTPExpiration } from '@/lib/otp';
import { sendEmailOTP } from '@/lib/email';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    if (user.emailVerified) {
      return NextResponse.json(
        { error: 'Email already verified' },
        { status: 400 }
      );
    }

    // Generate OTP
    const code = generateOTP();
    const hashedCode = await hashOTP(code);

    // Store OTP in database
    await prisma.otpCode.create({
      data: {
        userId: user.id,
        identifier: email,
        code: hashedCode,
        type: 'EMAIL',
        expiresAt: getOTPExpiration(),
      },
    });

    // Send OTP via email
    await sendEmailOTP(email, code);

    return NextResponse.json(
      { message: 'OTP sent to your email' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Email OTP request error:', error);
    return NextResponse.json(
      { error: 'Failed to send OTP' },
      { status: 500 }
    );
  }
}
