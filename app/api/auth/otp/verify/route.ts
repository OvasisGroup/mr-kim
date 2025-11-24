import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyOTP } from '@/lib/otp';
import { getSession } from '@/lib/session';

export async function POST(req: NextRequest) {
  try {
    const { phone, code, role } = await req.json();

    if (!phone || !code) {
      return NextResponse.json(
        { error: 'Phone and code are required' },
        { status: 400 }
      );
    }

    // Find the most recent unconsumed OTP for this phone
    const otpRecord = await prisma.otpCode.findFirst({
      where: {
        identifier: phone,
        type: 'PHONE',
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

    // Check if user exists
    let user = await prisma.user.findUnique({
      where: { phone },
    });

    // If user doesn't exist, create one
    if (!user) {
      if (!role) {
        return NextResponse.json(
          { error: 'Role is required for new users' },
          { status: 400 }
        );
      }

      user = await prisma.user.create({
        data: {
          phone,
          role,
          phoneVerified: true,
        },
      });

      // Create session
      const session = await getSession();
      session.userId = user.id;
      session.phone = user.phone || undefined;
      session.role = user.role;
      session.isLoggedIn = true;
      await session.save();

      return NextResponse.json(
        {
          message: 'Account created and phone verified successfully',
          isNewUser: true,
          user: {
            id: user.id,
            phone: user.phone,
            role: user.role,
          },
        },
        { status: 201 }
      );
    }

    // Mark user's phone as verified
    await prisma.user.update({
      where: { phone },
      data: { phoneVerified: true },
    });

    // Create session
    const session = await getSession();
    session.userId = user.id;
    session.phone = user.phone || undefined;
    session.role = user.role;
    session.isLoggedIn = true;
    await session.save();

    return NextResponse.json(
      {
        message: 'Phone verified successfully',
        isNewUser: false,
        user: {
          id: user.id,
          phone: user.phone,
          role: user.role,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Phone OTP verification error:', error);
    return NextResponse.json(
      { error: 'Failed to verify OTP' },
      { status: 500 }
    );
  }
}
