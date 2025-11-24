import crypto from 'crypto';
import bcrypt from 'bcryptjs';

/**
 * Generate a 6-digit OTP code
 */
export function generateOTP(): string {
  return crypto.randomInt(100000, 999999).toString();
}

/**
 * Hash an OTP code
 */
export async function hashOTP(code: string): Promise<string> {
  return bcrypt.hash(code, 10);
}

/**
 * Verify an OTP code against a hash
 */
export async function verifyOTP(code: string, hash: string): Promise<boolean> {
  return bcrypt.compare(code, hash);
}

/**
 * Generate OTP expiration time (10 minutes from now)
 */
export function getOTPExpiration(): Date {
  return new Date(Date.now() + 10 * 60 * 1000);
}
