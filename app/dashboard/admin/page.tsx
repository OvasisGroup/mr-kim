'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, ShoppingBag, TrendingUp, Shield } from 'lucide-react';

export default function AdminDashboard() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

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

  const stats = [
    {
      title: 'Total Users',
      value: '2,547',
      icon: Users,
      description: 'Registered users',
      color: 'text-blue-600 bg-blue-50',
    },
    {
      title: 'Total Orders',
      value: '8,234',
      icon: ShoppingBag,
      description: 'All time orders',
      color: 'text-green-600 bg-green-50',
    },
    {
      title: 'Revenue',
      value: 'KSh 12.4M',
      icon: TrendingUp,
      description: 'Total platform revenue',
      color: 'text-purple-600 bg-purple-50',
    },
    {
      title: 'Active Vendors',
      value: '342',
      icon: Shield,
      description: 'Verified vendors',
      color: 'text-orange-600 bg-orange-50',
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, Admin!
          </h1>
          <p className="text-gray-600 mt-2">
            Manage users, vendors, and service providers from this dashboard.
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Users</CardTitle>
              <CardDescription>Manage all registered users</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Customers</span>
                  <span className="font-medium">1,234</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Vendors</span>
                  <span className="font-medium">342</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Service Providers</span>
                  <span className="font-medium">971</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Vendors</CardTitle>
              <CardDescription>Review and verify vendors</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Verified</span>
                  <span className="font-medium text-green-600">342</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Pending</span>
                  <span className="font-medium text-orange-600">23</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Suspended</span>
                  <span className="font-medium text-red-600">8</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Service Providers</CardTitle>
              <CardDescription>Review and verify service providers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Verified</span>
                  <span className="font-medium text-green-600">971</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Pending</span>
                  <span className="font-medium text-orange-600">45</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Suspended</span>
                  <span className="font-medium text-red-600">12</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
