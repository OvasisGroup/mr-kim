'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import axios from 'axios';
import { useAuth } from '@/contexts/auth-context';

export default function OTPLoginPage() {
  const router = useRouter();
  const { refreshSession } = useAuth();
  const [step, setStep] = useState<'phone' | 'verify'>('phone');
  const [isLoading, setIsLoading] = useState(false);
  const [phone, setPhone] = useState('+254');
  const [code, setCode] = useState('');
  const [role, setRole] = useState('CUSTOMER');

  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await axios.post('/api/auth/otp/request', { phone, role });
      toast.success('OTP sent to your phone!');
      setStep('verify');
    } catch (error: unknown) {
      const errorMessage = error && typeof error === 'object' && 'response' in error 
        ? (error.response as { data?: { error?: string } })?.data?.error || 'Failed to send OTP'
        : 'Failed to send OTP';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await axios.post('/api/auth/otp/verify', { phone, code, role });
      await refreshSession();
      toast.success('Logged in successfully!');
      router.push('/dashboard');
      router.refresh();
    } catch (error: unknown) {
      const errorMessage = error && typeof error === 'object' && 'response' in error 
        ? (error.response as { data?: { error?: string } })?.data?.error || 'Verification failed'
        : 'Verification failed';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-green-800 flex items-center justify-center relative">
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
        style={{ backgroundImage: 'url(/images/bg-vector.png)' }}
      />
      <main className="container mx-auto px-4 relative z-10">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <Image
                  src="/images/mrkim-logo.svg"
                  alt="Mr. Kim Logo"
                  width={169}
                  height={169}
                  priority
                />
              </div>
              <CardTitle className="text-2xl">Phone Login</CardTitle>
              <CardDescription>
                {step === 'phone'
                  ? 'Enter your phone number'
                  : 'Enter the verification code'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {step === 'phone' ? (
                <form onSubmit={handleRequestOTP} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      required
                      placeholder="+254712345678"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                    <p className="text-xs text-gray-500">
                      Kenya country code (+254)
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="role">I am a</Label>
                    <select
                      id="role"
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                    >
                      <option value="CUSTOMER">Customer</option>
                      <option value="VENDOR">Vendor</option>
                      <option value="SERVICE_PROVIDER">Service Provider</option>
                    </select>
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Sending...' : 'Send Verification Code'}
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOTP} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="code">Verification Code</Label>
                    <Input
                      id="code"
                      type="text"
                      required
                      maxLength={6}
                      className="text-center text-2xl tracking-widest"
                      value={code}
                      onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="000000"
                    />
                    <p className="text-xs text-gray-500 text-center">
                      Code sent to {phone}
                    </p>
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Verifying...' : 'Verify & Login'}
                  </Button>

                  <button
                    type="button"
                    onClick={() => setStep('phone')}
                    className="w-full text-sm text-gray-600 hover:underline"
                  >
                    Change phone number
                  </button>
                </form>
              )}

              <div className="mt-6 text-center text-sm">
                <p className="text-gray-600">
                  Prefer email?{' '}
                  <Link href="/login" className="text-primary font-semibold hover:underline">
                    Sign in with email
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
