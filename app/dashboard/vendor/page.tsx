'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, ShoppingBag, Users, TrendingUp } from 'lucide-react';
import VendorProfileForm from './profile-form';

export default function VendorDashboard() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

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

  const stats = [
    {
      title: 'Total Products',
      value: '42',
      icon: Package,
      description: 'Active listings',
      color: 'text-blue-600 bg-blue-50',
    },
    {
      title: 'Total Orders',
      value: '156',
      icon: ShoppingBag,
      description: 'All time orders',
      color: 'text-green-600 bg-green-50',
    },
    {
      title: 'Customers',
      value: '89',
      icon: Users,
      description: 'Unique customers',
      color: 'text-purple-600 bg-purple-50',
    },
    {
      title: 'Revenue',
      value: 'KSh 324,000',
      icon: TrendingUp,
      description: 'Last 30 days',
      color: 'text-orange-600 bg-orange-50',
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user.username || user.email || user.phone}!
          </h1>
          <p className="text-gray-600 mt-2">
            Manage your vendor profile and product listings.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    {stat.title}
                  </CardTitle>
                  <div className={`p-2 rounded-lg ${stat.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                  <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <VendorProfileForm />
      </div>
    </DashboardLayout>
  );
}
