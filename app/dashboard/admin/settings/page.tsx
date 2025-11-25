'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Bell, Lock, Eye, EyeOff, Globe, Shield, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminSettings() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [notifications, setNotifications] = useState({
    emailBookings: true,
    emailMessages: true,
    emailPromotions: false,
    pushBookings: true,
    pushMessages: true,
    smsBookings: false,
  });

  const [privacy, setPrivacy] = useState({
    profileVisible: true,
    showEmail: false,
    showPhone: false,
  });

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

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    try {
      // TODO: Implement API call to change password
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Password changed successfully!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast.error('Failed to change password');
    }
  };

  const handleNotificationUpdate = async () => {
    try {
      // TODO: Implement API call to update notifications
      await new Promise(resolve => setTimeout(resolve, 500));
      toast.success('Notification preferences updated');
    } catch (error) {
      toast.error('Failed to update preferences');
    }
  };

  const handlePrivacyUpdate = async () => {
    try {
      // TODO: Implement API call to update privacy settings
      await new Promise(resolve => setTimeout(resolve, 500));
      toast.success('Privacy settings updated');
    } catch (error) {
      toast.error('Failed to update settings');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-2">
            Manage your account settings and preferences
          </p>
        </div>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-green-600" />
              <CardTitle>Security</CardTitle>
            </div>
            <CardDescription>Update your password and security settings</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    placeholder="Enter current password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showNewPassword ? 'text' : 'password'}
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    placeholder="Enter new password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    placeholder="Confirm new password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button type="submit">Change Password</Button>
            </form>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-green-600" />
              <CardTitle>Notifications</CardTitle>
            </div>
            <CardDescription>Manage how you receive notifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-4">Email Notifications</h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">Booking Updates</p>
                    <p className="text-sm text-gray-500">Get notified about booking status changes</p>
                  </div>
                  <Switch
                    checked={notifications.emailBookings}
                    onCheckedChange={(checked) => {
                      setNotifications({ ...notifications, emailBookings: checked });
                      handleNotificationUpdate();
                    }}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">Messages</p>
                    <p className="text-sm text-gray-500">Get notified when you receive messages</p>
                  </div>
                  <Switch
                    checked={notifications.emailMessages}
                    onCheckedChange={(checked) => {
                      setNotifications({ ...notifications, emailMessages: checked });
                      handleNotificationUpdate();
                    }}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">Promotions</p>
                    <p className="text-sm text-gray-500">Receive promotional offers and updates</p>
                  </div>
                  <Switch
                    checked={notifications.emailPromotions}
                    onCheckedChange={(checked) => {
                      setNotifications({ ...notifications, emailPromotions: checked });
                      handleNotificationUpdate();
                    }}
                  />
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-4">Push Notifications</h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">Booking Updates</p>
                    <p className="text-sm text-gray-500">Push notifications for bookings</p>
                  </div>
                  <Switch
                    checked={notifications.pushBookings}
                    onCheckedChange={(checked) => {
                      setNotifications({ ...notifications, pushBookings: checked });
                      handleNotificationUpdate();
                    }}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">Messages</p>
                    <p className="text-sm text-gray-500">Push notifications for messages</p>
                  </div>
                  <Switch
                    checked={notifications.pushMessages}
                    onCheckedChange={(checked) => {
                      setNotifications({ ...notifications, pushMessages: checked });
                      handleNotificationUpdate();
                    }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Privacy Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-green-600" />
              <CardTitle>Privacy</CardTitle>
            </div>
            <CardDescription>Control your privacy and data sharing preferences</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">Profile Visibility</p>
                  <p className="text-sm text-gray-500">Make your profile visible to service providers</p>
                </div>
                <Switch
                  checked={privacy.profileVisible}
                  onCheckedChange={(checked) => {
                    setPrivacy({ ...privacy, profileVisible: checked });
                    handlePrivacyUpdate();
                  }}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">Show Email</p>
                  <p className="text-sm text-gray-500">Display email on your public profile</p>
                </div>
                <Switch
                  checked={privacy.showEmail}
                  onCheckedChange={(checked) => {
                    setPrivacy({ ...privacy, showEmail: checked });
                    handlePrivacyUpdate();
                  }}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">Show Phone</p>
                  <p className="text-sm text-gray-500">Display phone number on your public profile</p>
                </div>
                <Switch
                  checked={privacy.showPhone}
                  onCheckedChange={(checked) => {
                    setPrivacy({ ...privacy, showPhone: checked });
                    handlePrivacyUpdate();
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-red-200">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-red-600" />
              <CardTitle className="text-red-600">Danger Zone</CardTitle>
            </div>
            <CardDescription>Irreversible actions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
                <div>
                  <p className="font-medium text-sm text-red-900">Delete Account</p>
                  <p className="text-sm text-red-600">Permanently delete your account and all data</p>
                </div>
                <Button variant="destructive" size="sm">
                  Delete Account
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
