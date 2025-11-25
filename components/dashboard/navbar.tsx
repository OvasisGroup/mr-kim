'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Bell, Search, Menu, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/auth-context';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

interface DashboardNavbarProps {
  onMenuClick: () => void;
  isCollapsed: boolean;
}

export function DashboardNavbar({ onMenuClick, isCollapsed }: DashboardNavbarProps) {
  const { user, logout } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnreadCount = async () => {
    try {
      const response = await fetch('/api/messages/unread');
      if (response.ok) {
        const data = await response.json();
        setUnreadCount(data.unreadCount);
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  useEffect(() => {
    if (user) {
      // Use setTimeout to avoid synchronous setState in effect
      const timer = setTimeout(() => {
        void fetchUnreadCount();
      }, 0);
      // Poll for new messages every 30 seconds
      const interval = setInterval(() => {
        void fetchUnreadCount();
      }, 30000);
      return () => {
        clearTimeout(timer);
        clearInterval(interval);
      };
    }
  }, [user]);

  const getInitials = () => {
    if (user?.username) {
      return user.username.substring(0, 2).toUpperCase();
    }
    if (user?.email) {
      return user.email.substring(0, 2).toUpperCase();
    }
    if (user?.phone) {
      return user.phone.substring(0, 2);
    }
    return 'U';
  };

  const getRolePath = () => {
    const roleMap = {
      CUSTOMER: 'customer',
      VENDOR: 'vendor',
      SERVICE_PROVIDER: 'service-provider',
      ADMIN: 'admin',
    };
    return roleMap[user?.role as keyof typeof roleMap] || 'customer';
  };

  return (
    <header
      className={cn(
        'fixed top-0 right-0 z-30 h-20 bg-white border-b border-gray-200 transition-all duration-300',
        isCollapsed ? 'left-0 lg:left-20' : 'left-0 lg:left-64'
      )}
    >
      <div className="flex items-center justify-between h-full px-6">
        {/* Left Section - Search */}
        <div className="flex items-center gap-4 flex-1 max-w-xl">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={onMenuClick}
          >
            <Menu className="w-5 h-5" />
          </Button>
          
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="search"
              placeholder="Search..."
              className="pl-10 w-full"
            />
          </div>
        </div>

        {/* Right Section - Notifications and Profile */}
        <div className="flex items-center gap-4">
          {/* Messages */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="relative"
            asChild
          >
            <Link href={`/dashboard/${getRolePath()}/messages`}>
              <MessageSquare className="w-5 h-5" />
              {unreadCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
                </Badge>
              )}
            </Link>
          </Button>

          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </Button>

          {/* User Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-3 px-3">
                <Avatar className="w-8 h-8">
                  {user?.avatarUrl && <AvatarImage src={user.avatarUrl} alt="Avatar" />}
                  <AvatarFallback className="bg-green-700 text-white text-xs">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-gray-900">
                    {user?.username || user?.email || user?.phone}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">
                    {user?.role.toLowerCase().replace('_', ' ')}
                  </p>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/${getRolePath()}/profile`}>Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/${getRolePath()}/settings`}>Settings</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/support">Support</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="text-red-600">
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
