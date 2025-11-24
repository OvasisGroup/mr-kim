'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import VendorProfileForm from './profile-form';

export default function VendorDashboard() {
  const router = useRouter();
  const { user, isLoading, logout } = useAuth();

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'VENDOR')) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold">Vendor Dashboard</h1>
          <Button onClick={logout} variant="outline">
            Sign Out
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6 bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-semibold mb-2">
            Welcome, {user.email || user.phone}!
          </h2>
          <p className="text-gray-600">
            Manage your vendor profile and listings here.
          </p>
        </div>

        <VendorProfileForm />
      </main>
    </div>
  );
}
