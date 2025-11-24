'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import axios from 'axios';

function VerifyPhoneContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const phone = searchParams.get('phone');
  const [isLoading, setIsLoading] = useState(false);
  const [code, setCode] = useState('');
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    if (!phone) {
      toast.error('Phone number is required');
      router.push('/register');
    }
  }, [phone, router]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await axios.post('/api/auth/phone/verify', { phone, code });
      toast.success('Phone verified successfully!');
      router.push('/login');
    } catch (error: unknown) {
      const errorMessage = error && typeof error === 'object' && 'response' in error 
        ? (error.response as { data?: { error?: string } })?.data?.error || 'Verification failed'
        : 'Verification failed';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setIsResending(true);

    try {
      await axios.post('/api/auth/phone/request', { phone });
      toast.success('Verification code resent!');
    } catch (error: unknown) {
      const errorMessage = error && typeof error === 'object' && 'response' in error 
        ? (error.response as { data?: { error?: string } })?.data?.error || 'Failed to resend code'
        : 'Failed to resend code';
      toast.error(errorMessage);
    } finally {
      setIsResending(false);
    }
  };

  if (!phone) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="container mx-auto px-4 py-16">
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
              <CardTitle className="text-2xl">Verify Your Phone</CardTitle>
              <CardDescription>
                Enter the 6-digit code sent to {phone}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleVerify} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="code">Verification Code</Label>
                  <Input
                    id="code"
                    type="text"
                    maxLength={6}
                    placeholder="000000"
                    className="text-center text-2xl tracking-widest"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Verifying...' : 'Verify Phone'}
                </Button>
              </form>

              <div className="mt-6 text-center space-y-3">
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={isResending}
                  className="text-sm text-primary font-semibold hover:underline disabled:opacity-50"
                >
                  {isResending ? 'Resending...' : 'Resend Code'}
                </button>
                
                <p className="text-sm text-gray-600">
                  <Link href="/register" className="text-primary font-semibold hover:underline">
                    Back to Registration
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

export default function VerifyPhonePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyPhoneContent />
    </Suspense>
  );
}
