'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, Briefcase } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();

  const handleSelection = (type: 'customer' | 'service_provider') => {
    // Navigate to respective registration form
    if (type === 'customer') {
      router.push('/register/customer');
    } else {
      router.push('/register/service-provider');
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <main className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
          
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Join Mr. Kim
            </h1>
            <p className="text-lg text-gray-600">
              Choose how you want to get started
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Customer Card */}
            <Card 
              className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-primary"
              onClick={() => handleSelection('customer')}
            >
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-2xl">Customer</CardTitle>
                <CardDescription className="text-base">
                  Find and hire trusted service providers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" size="lg">
                  Register as Customer
                </Button>
              </CardContent>
            </Card>

            {/* Service Provider Card */}
            <Card 
              className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-primary"
              onClick={() => handleSelection('service_provider')}
            >
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <Briefcase className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-2xl">Service Provider</CardTitle>
                <CardDescription className="text-base">
                  Offer your services and grow your business
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" size="lg">
                  Register as Provider
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-8">
            <p className="text-gray-600">
              Already have an account?{' '}
              <a href="/login" className="text-primary font-semibold hover:underline">
                Sign in
              </a>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
