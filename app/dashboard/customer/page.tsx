'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingBag, Calendar, MessageSquare, CreditCard } from 'lucide-react';

export default function CustomerDashboard() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'CUSTOMER')) {
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
      title: 'Active Bookings',
      value: '3',
      icon: Calendar,
      description: 'Services in progress',
      color: 'text-blue-600 bg-blue-50',
    },
    {
      title: 'Total Orders',
      value: '24',
      icon: ShoppingBag,
      description: 'Completed purchases',
      color: 'text-green-600 bg-green-50',
    },
    {
      title: 'Messages',
      value: '8',
      icon: MessageSquare,
      description: 'Unread messages',
      color: 'text-purple-600 bg-purple-50',
    },
    {
      title: 'Total Spent',
      value: 'KSh 45,000',
      icon: CreditCard,
      description: 'Last 30 days',
      color: 'text-orange-600 bg-orange-50',
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user.username || user.email || user.phone}!
          </h1>
          <p className="text-gray-600 mt-2">
            Here's what's happening with your account today.
          </p>
        </div>

        {/* Stats Grid */}
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

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Bookings</CardTitle>
              <CardDescription>Your latest service bookings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Home Cleaning</p>
                    <p className="text-sm text-gray-500">Tomorrow at 10:00 AM</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Plumbing Service</p>
                    <p className="text-sm text-gray-500">Dec 1, 2025 at 2:00 PM</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks and shortcuts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
                  <ShoppingBag className="w-6 h-6 text-green-600 mb-2" />
                  <p className="font-medium text-sm text-gray-900">Browse Services</p>
                </button>
                <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
                  <Calendar className="w-6 h-6 text-blue-600 mb-2" />
                  <p className="font-medium text-sm text-gray-900">My Bookings</p>
                </button>
                <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
                  <MessageSquare className="w-6 h-6 text-purple-600 mb-2" />
                  <p className="font-medium text-sm text-gray-900">Messages</p>
                </button>
                <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
                  <CreditCard className="w-6 h-6 text-orange-600 mb-2" />
                  <p className="font-medium text-sm text-gray-900">Payment History</p>
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
