'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

export default function ServiceProviderRegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [registrationType, setRegistrationType] = useState<'email' | 'phone'>('email');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (!agreedToTerms) {
      toast.error('Please agree to the Terms and Conditions and Privacy Policy');
      return;
    }

    setIsLoading(true);

    try {
      // Register user
      const registerData: { password: string; role: string; username?: string; email?: string; phone?: string } = {
        password: formData.password,
        role: 'SERVICE_PROVIDER',
      };

      if (formData.username) {
        registerData.username = formData.username;
      }

      if (registrationType === 'email') {
        registerData.email = formData.email;
      } else {
        registerData.phone = formData.phone;
      }

      await axios.post('/api/auth/register', registerData);

      toast.success('Registration successful!');
      
      // Request OTP
      if (registrationType === 'email') {
        await axios.post('/api/auth/email/request', { email: formData.email });
        router.push(`/verify-email?email=${encodeURIComponent(formData.email)}`);
      } else {
        await axios.post('/api/auth/phone/request', { phone: formData.phone });
        router.push(`/verify-phone?phone=${encodeURIComponent(formData.phone)}`);
      }
    } catch (error: unknown) {
      const errorMessage = error && typeof error === 'object' && 'response' in error 
        ? (error.response as { data?: { error?: string } })?.data?.error || 'Registration failed'
        : 'Registration failed';
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
        <div className="max-w-2xl mx-auto">
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
              <CardTitle className="text-2xl">Service Provider Registration</CardTitle>
              <CardDescription>
                Create your account to start offering services
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Account Information</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="username">Username (optional)</Label>
                    <Input
                      id="username"
                      type="text"
                      placeholder="johndoe"
                      value={formData.username}
                      onChange={(e) =>
                        setFormData({ ...formData, username: e.target.value })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Register with</Label>
                    <div className="flex gap-4">
                      <Button
                        type="button"
                        variant={registrationType === 'email' ? 'default' : 'outline'}
                        className="flex-1"
                        onClick={() => setRegistrationType('email')}
                      >
                        Email
                      </Button>
                      <Button
                        type="button"
                        variant={registrationType === 'phone' ? 'default' : 'outline'}
                        className="flex-1"
                        onClick={() => setRegistrationType('phone')}
                      >
                        Phone
                      </Button>
                    </div>
                  </div>

                  {registrationType === 'email' ? (
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="your.email@example.com"
                        required
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                      />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+254712345678"
                        required
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                      />
                    </div>
                  )}

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          required
                          value={formData.password}
                          onChange={(e) =>
                            setFormData({ ...formData, password: e.target.value })
                          }
                          className="pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm Password</Label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="••••••••"
                          required
                          value={formData.confirmPassword}
                          onChange={(e) =>
                            setFormData({ ...formData, confirmPassword: e.target.value })
                          }
                          className="pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                          {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-start space-x-2">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-2 focus:ring-primary"
                  />
                  <label htmlFor="terms" className="text-sm text-gray-600">
                    I agree to the{' '}
                    <Link href="/terms" className="text-primary font-semibold hover:underline">
                      Terms and Conditions
                    </Link>{' '}
                    and{' '}
                    <Link href="/privacy" className="text-primary font-semibold hover:underline">
                      Privacy Policy
                    </Link>
                  </label>
                </div>

                <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                  {isLoading ? 'Creating account...' : 'Create Service Provider Account'}
                </Button>
              </form>

              <div className="mt-6 text-center text-sm">
                <p className="text-gray-600">
                  Already have an account?{' '}
                  <Link href="/login" className="text-primary font-semibold hover:underline">
                    Sign in
                  </Link>
                </p>
                <p className="mt-2 text-gray-600">
                  Looking for services as a customer?{' '}
                  <Link href="/register/customer" className="text-primary font-semibold hover:underline">
                    Register here
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
