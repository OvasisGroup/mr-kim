import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { generateOTP, hashOTP, getOTPExpiration } from '@/lib/otp';
import { sendPhoneOTP } from '@/lib/sms';

export async function POST(req: NextRequest) {
  try {
    const { phone, role } = await req.json();

    if (!phone) {
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 }
      );
    }

    // Generate OTP
    const code = generateOTP();
    const hashedCode = await hashOTP(code);

    // Store OTP in database (no userId yet if user doesn't exist)
    await prisma.otpCode.create({
      data: {
        identifier: phone,
        code: hashedCode,
        type: 'PHONE',
        expiresAt: getOTPExpiration(),
      },
    });

    // Send OTP via SMS
    await sendPhoneOTP(phone, code);

    return NextResponse.json(
      { message: 'OTP sent to your phone' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Phone OTP request error:', error);
    return NextResponse.json(
      { error: 'Failed to send OTP' },
      { status: 500 }
    );
  }
}
