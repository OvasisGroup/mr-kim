import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyOTP } from '@/lib/otp';

export async function POST(req: NextRequest) {
  try {
    const { email, code } = await req.json();

    if (!email || !code) {
      return NextResponse.json(
        { error: 'Email and code are required' },
        { status: 400 }
      );
    }

    // Find the most recent unconsumed OTP for this email
    const otpRecord = await prisma.otpCode.findFirst({
      where: {
        identifier: email,
        type: 'EMAIL',
        consumed: false,
        expiresAt: {
          gt: new Date(),
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!otpRecord) {
      return NextResponse.json(
        { error: 'Invalid or expired OTP' },
        { status: 400 }
      );
    }

    // Verify OTP
    const isValid = await verifyOTP(code, otpRecord.code);

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid OTP' },
        { status: 400 }
      );
    }

    // Mark OTP as consumed
    await prisma.otpCode.update({
      where: { id: otpRecord.id },
      data: { consumed: true },
    });

    // Mark user's email as verified
    await prisma.user.update({
      where: { email },
      data: { emailVerified: true },
    });

    return NextResponse.json(
      { message: 'Email verified successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Email OTP verification error:', error);
    return NextResponse.json(
      { error: 'Failed to verify OTP' },
      { status: 500 }
    );
  }
}
