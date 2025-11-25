'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  CreditCard,
  ArrowUpRight,
  ArrowDownLeft,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
} from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import { format } from 'date-fns';

type PaymentStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'REFUNDED' | 'CANCELLED';
type PaymentMethod = 'CREDIT_CARD' | 'DEBIT_CARD' | 'BANK_TRANSFER' | 'PAYPAL' | 'STRIPE' | 'CASH' | 'OTHER';

interface Payment {
  id: string;
  amount: number;
  currency: string;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  transactionId?: string;
  description?: string;
  createdAt: string;
  payer: {
    id: string;
    firstName?: string;
    lastName?: string;
    username?: string;
    email?: string;
    role: string;
    avatarUrl?: string;
  };
  recipient?: {
    id: string;
    firstName?: string;
    lastName?: string;
    username?: string;
    email?: string;
    role: string;
    avatarUrl?: string;
  };
  booking?: {
    id: string;
    serviceName: string;
    serviceType: string;
    bookingDate: string;
  };
}

interface PaymentStats {
  totalSent: number;
  totalReceived: number;
  totalTransactions: number;
  completedCount: number;
  pendingCount: number;
  failedCount: number;
}

export default function PaymentHistoryPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [stats, setStats] = useState<PaymentStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'sent' | 'received'>('all');

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'VENDOR')) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      fetchPayments();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, filter]);

  const fetchPayments = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`/api/payments?filter=${filter}`);
      setPayments(response.data.payments);
      setStats(response.data.stats);
    } catch (error) {
      console.error('Failed to fetch payments:', error);
      toast.error('Failed to load payment history');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: PaymentStatus) => {
    const variants: Record<
      PaymentStatus,
      { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }
    > = {
      PENDING: { label: 'Pending', variant: 'outline' },
      PROCESSING: { label: 'Processing', variant: 'default' },
      COMPLETED: { label: 'Completed', variant: 'secondary' },
      FAILED: { label: 'Failed', variant: 'destructive' },
      REFUNDED: { label: 'Refunded', variant: 'outline' },
      CANCELLED: { label: 'Cancelled', variant: 'destructive' },
    };

    return variants[status] || variants.PENDING;
  };

  const getStatusIcon = (status: PaymentStatus) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'FAILED':
      case 'CANCELLED':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'PROCESSING':
      case 'PENDING':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'REFUNDED':
        return <ArrowDownLeft className="w-4 h-4 text-blue-600" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getPaymentMethodLabel = (method: PaymentMethod) => {
    const labels: Record<PaymentMethod, string> = {
      CREDIT_CARD: 'Credit Card',
      DEBIT_CARD: 'Debit Card',
      BANK_TRANSFER: 'Bank Transfer',
      PAYPAL: 'PayPal',
      STRIPE: 'Stripe',
      CASH: 'Cash',
      OTHER: 'Other',
    };
    return labels[method] || method;
  };

  const getUserName = (user: Payment['payer'] | Payment['recipient']) => {
    if (!user) return 'N/A';
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user.username || user.email || 'Unknown User';
  };

  const getUserInitials = (user: Payment['payer'] | Payment['recipient']) => {
    if (!user) return 'NA';
    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    if (user.username) {
      return user.username.substring(0, 2).toUpperCase();
    }
    if (user.email) {
      return user.email.substring(0, 2).toUpperCase();
    }
    return 'U';
  };

  const isPaymentSent = (payment: Payment) => {
    return payment.payer.id === user?.id;
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Payment History</h1>
            <p className="text-gray-600 mt-1">View and manage your transactions</p>
          </div>
        </div>

        {/* Statistics Cards */}
        {stats && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Sent</CardTitle>
                <TrendingUp className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${stats.totalSent.toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Payments made to providers
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Received</CardTitle>
                <TrendingDown className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${stats.totalReceived.toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Refunds and credits
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.completedCount}</div>
                <p className="text-xs text-muted-foreground">
                  Successful transactions
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending</CardTitle>
                <Clock className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.pendingCount}</div>
                <p className="text-xs text-muted-foreground">
                  Awaiting processing
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters */}
        <Tabs value={filter} onValueChange={(v) => setFilter(v as 'all' | 'sent' | 'received')}>
          <TabsList>
            <TabsTrigger value="all">All Payments</TabsTrigger>
            <TabsTrigger value="sent">Sent</TabsTrigger>
            <TabsTrigger value="received">Received</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Payment List */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : payments.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <CreditCard className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold mb-2">No payment history</h3>
                <p className="text-gray-600 mb-4">
                  Your payment transactions will appear here
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {payments.map((payment) => {
              const statusInfo = getStatusBadge(payment.status);
              const isSent = isPaymentSent(payment);
              const otherParty = isSent ? payment.recipient : payment.payer;

              return (
                <Card key={payment.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex items-start gap-3">
                        {isSent ? (
                          <ArrowUpRight className="w-5 h-5 text-red-600 mt-1" />
                        ) : (
                          <ArrowDownLeft className="w-5 h-5 text-green-600 mt-1" />
                        )}
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            {isSent ? 'Payment Sent' : 'Payment Received'}
                            {getStatusIcon(payment.status)}
                          </CardTitle>
                          <CardDescription>
                            {payment.description || payment.booking?.serviceName || 'Payment transaction'}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-2xl font-bold ${isSent ? 'text-red-600' : 'text-green-600'}`}>
                          {isSent ? '-' : '+'}${payment.amount.toFixed(2)}
                        </div>
                        <Badge variant={statusInfo.variant} className="mt-1">
                          {statusInfo.label}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-start gap-3">
                        {otherParty && (
                          <>
                            <Avatar className="w-10 h-10">
                              <AvatarImage src={otherParty.avatarUrl} />
                              <AvatarFallback>{getUserInitials(otherParty)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium">
                                {isSent ? 'Paid to' : 'Received from'}
                              </p>
                              <p className="text-sm text-gray-600">{getUserName(otherParty)}</p>
                              <Badge variant="outline" className="text-xs mt-1">
                                {otherParty.role.replace('_', ' ')}
                              </Badge>
                            </div>
                          </>
                        )}
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <CreditCard className="w-4 h-4 text-gray-500" />
                          <span>{getPaymentMethodLabel(payment.paymentMethod)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          <span>{format(new Date(payment.createdAt), 'PPp')}</span>
                        </div>
                        {payment.transactionId && (
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-gray-500" />
                            <span className="text-xs font-mono">{payment.transactionId}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {payment.booking && (
                      <div className="bg-gray-50 rounded-lg p-3 mt-3">
                        <p className="text-sm font-medium mb-1">Related Booking</p>
                        <p className="text-sm text-gray-600">{payment.booking.serviceName}</p>
                        <p className="text-xs text-gray-500">
                          {format(new Date(payment.booking.bookingDate), 'PPP')}
                        </p>
                      </div>
                    )}

                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/dashboard/vendor/payments/${payment.id}`)}
                      >
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
