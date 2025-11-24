'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';

export default function AdminDashboard() {
  const router = useRouter();
  const { user, isLoading, logout } = useAuth();

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'ADMIN')) {
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
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <Button onClick={logout} variant="outline">
            Sign Out
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-semibold mb-4">
            Welcome, Admin!
          </h2>
          <p className="text-gray-600 mb-6">
            Manage users, vendors, and service providers from this dashboard.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold text-lg mb-2">Users</h3>
              <p className="text-gray-600">Manage all registered users</p>
            </div>
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold text-lg mb-2">Vendors</h3>
              <p className="text-gray-600">Review and verify vendors</p>
            </div>
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold text-lg mb-2">Service Providers</h3>
              <p className="text-gray-600">Review and verify service providers</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
