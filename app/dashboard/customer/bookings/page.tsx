'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, User, CheckCircle, XCircle, AlertCircle, Loader2, CalendarDays } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, startOfWeek, endOfWeek } from 'date-fns';

type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW';

interface Booking {
  id: string;
  serviceType: string;
  serviceName: string;
  description?: string;
  bookingDate: string;
  duration: number;
  status: BookingStatus;
  notes?: string;
  googleCalendarEventId?: string;
  provider: {
    id: string;
    firstName?: string;
    lastName?: string;
    username?: string;
    email?: string;
    phone?: string;
    avatarUrl?: string;
  };
}

function BookingsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading: authLoading } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [calendarConnected, setCalendarConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'CUSTOMER')) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    // Check for calendar connection success
    if (searchParams.get('calendar_connected') === 'true') {
      toast.success('Google Calendar connected successfully!');
      setCalendarConnected(true);
    }

    if (searchParams.get('error')) {
      toast.error('Failed to connect Google Calendar');
    }
  }, [searchParams]);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get('/api/bookings?role=customer');
      setBookings(response.data.bookings);
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
      toast.error('Failed to load bookings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnectCalendar = async () => {
    try {
      setIsConnecting(true);
      const response = await axios.get('/api/auth/google/connect');
      window.location.href = response.data.authUrl;
    } catch (error) {
      console.error('Failed to connect calendar:', error);
      toast.error('Failed to connect Google Calendar');
      setIsConnecting(false);
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    try {
      await axios.put(`/api/bookings/${bookingId}`, { status: 'CANCELLED' });
      toast.success('Booking cancelled successfully');
      fetchBookings();
    } catch (error) {
      console.error('Failed to cancel booking:', error);
      toast.error('Failed to cancel booking');
    }
  };

  const getStatusBadge = (status: BookingStatus) => {
    const variants: Record<BookingStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      PENDING: { label: 'Pending', variant: 'outline' },
      CONFIRMED: { label: 'Confirmed', variant: 'default' },
      CANCELLED: { label: 'Cancelled', variant: 'destructive' },
      COMPLETED: { label: 'Completed', variant: 'secondary' },
      NO_SHOW: { label: 'No Show', variant: 'destructive' },
    };

    return variants[status] || variants.PENDING;
  };

  const getStatusIcon = (status: BookingStatus) => {
    switch (status) {
      case 'CONFIRMED':
        return <CheckCircle className="w-4 h-4" />;
      case 'CANCELLED':
      case 'NO_SHOW':
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getCalendarDays = () => {
    const start = startOfWeek(startOfMonth(currentDate));
    const end = endOfWeek(endOfMonth(currentDate));
    return eachDayOfInterval({ start, end });
  };

  const getBookingsForDay = (day: Date) => {
    return bookings.filter(booking => 
      isSameDay(new Date(booking.bookingDate), day)
    );
  };

  const renderCalendarView = () => {
    const days = getCalendarDays();
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{format(currentDate, 'MMMM yyyy')}</CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentDate(new Date())}
              >
                Today
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
              >
                Next
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {weekDays.map(day => (
              <div key={day} className="text-center font-semibold text-sm py-2">
                {day}
              </div>
            ))}
            {days.map((day, idx) => {
              const dayBookings = getBookingsForDay(day);
              const isCurrentMonth = isSameMonth(day, currentDate);
              const isToday = isSameDay(day, new Date());

              return (
                <div
                  key={idx}
                  className={`min-h-24 border rounded-lg p-2 ${
                    !isCurrentMonth ? 'bg-gray-50 text-gray-400' : ''
                  } ${isToday ? 'border-primary border-2' : ''}`}
                >
                  <div className="text-sm font-medium mb-1">
                    {format(day, 'd')}
                  </div>
                  <div className="space-y-1">
                    {dayBookings.map(booking => {
                      const statusInfo = getStatusBadge(booking.status);
                      return (
                        <div
                          key={booking.id}
                          className="text-xs p-1 rounded cursor-pointer hover:bg-gray-100"
                          onClick={() => router.push(`/dashboard/customer/bookings/${booking.id}`)}
                        >
                          <div className="font-medium truncate">{booking.serviceName}</div>
                          <div className="text-gray-600">{format(new Date(booking.bookingDate), 'p')}</div>
                          <Badge variant={statusInfo.variant} className="text-xs py-0 px-1 mt-1">
                            {statusInfo.label}
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    );
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
            <h1 className="text-3xl font-bold">My Bookings</h1>
            <p className="text-gray-600 mt-1">Manage your service bookings</p>
          </div>
          <div className="flex gap-3">
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <AlertCircle className="w-4 h-4 mr-2" />
              List
            </Button>
            <Button
              variant={viewMode === 'calendar' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('calendar')}
            >
              <CalendarDays className="w-4 h-4 mr-2" />
              Calendar
            </Button>
            {!calendarConnected && (
              <Button onClick={handleConnectCalendar} variant="outline" disabled={isConnecting}>
                {isConnecting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Calendar className="w-4 h-4 mr-2" />
                    Connect Google Calendar
                  </>
                )}
              </Button>
            )}
            <Button onClick={() => router.push('/dashboard/customer/bookings/new')}>
              <Calendar className="w-4 h-4 mr-2" />
              New Booking
            </Button>
          </div>
        </div>

        {calendarConnected && (
          <Card className="border-green-200 bg-green-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <p className="text-green-800">Google Calendar is connected. Your bookings will sync automatically.</p>
              </div>
            </CardContent>
          </Card>
        )}

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : bookings.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <Calendar className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold mb-2">No bookings yet</h3>
                <p className="text-gray-600 mb-4">Start by creating your first booking</p>
                <Button onClick={() => router.push('/dashboard/customer/bookings/new')}>
                  Create Booking
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : viewMode === 'calendar' ? (
          renderCalendarView()
        ) : (
          <div className="grid gap-4">
            {bookings.map((booking) => {
              const statusInfo = getStatusBadge(booking.status);
              const providerName = booking.provider.firstName && booking.provider.lastName
                ? `${booking.provider.firstName} ${booking.provider.lastName}`
                : booking.provider.username || 'Service Provider';

              return (
                <Card key={booking.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {booking.serviceName}
                          {getStatusIcon(booking.status)}
                        </CardTitle>
                        <CardDescription>{booking.serviceType}</CardDescription>
                      </div>
                      <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span>{format(new Date(booking.bookingDate), 'PPP')}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span>{format(new Date(booking.bookingDate), 'p')} ({booking.duration} min)</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm col-span-2">
                        <User className="w-4 h-4 text-gray-500" />
                        <span>Provider: {providerName}</span>
                      </div>
                    </div>

                    {booking.description && (
                      <div className="text-sm text-gray-600">
                        <p>{booking.description}</p>
                      </div>
                    )}

                    {booking.googleCalendarEventId && (
                      <div className="flex items-center gap-2 text-xs text-green-600">
                        <CheckCircle className="w-3 h-3" />
                        <span>Synced with Google Calendar</span>
                      </div>
                    )}

                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/dashboard/customer/bookings/${booking.id}`)}
                      >
                        View Details
                      </Button>
                      {booking.status === 'PENDING' && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleCancelBooking(booking.id)}
                        >
                          Cancel
                        </Button>
                      )}
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

export default function CustomerBookingsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    }>
      <BookingsContent />
    </Suspense>
  );
}
