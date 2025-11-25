'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  ShoppingBag, 
  Settings, 
  FileText,
  Calendar,
  MessageSquare,
  CreditCard,
  Package,
  UserCircle,
  ChevronLeft,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface SidebarProps {
  role: string;
  isCollapsed: boolean;
  isMobileOpen: boolean;
  onToggle: () => void;
  onMobileClose: () => void;
}

export function Sidebar({ role, isCollapsed, isMobileOpen, onToggle, onMobileClose }: SidebarProps) {
  const pathname = usePathname();

  const menuItems = {
    CUSTOMER: [
      { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard/customer' },
      { icon: ShoppingBag, label: 'Browse Services', href: '/dashboard/customer/services' },
      { icon: Calendar, label: 'My Bookings', href: '/dashboard/customer/bookings' },
      { icon: MessageSquare, label: 'Messages', href: '/dashboard/customer/messages' },
      { icon: CreditCard, label: 'Payment History', href: '/dashboard/customer/payments' },
      { icon: UserCircle, label: 'My Profile', href: '/dashboard/customer/profile' },
      { icon: Settings, label: 'Settings', href: '/dashboard/customer/settings' },
    ],
    VENDOR: [
      { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard/vendor' },
      { icon: Package, label: 'My Products', href: '/dashboard/vendor/products' },
      { icon: ShoppingBag, label: 'Orders', href: '/dashboard/vendor/orders' },
      { icon: Users, label: 'Customers', href: '/dashboard/vendor/customers' },
      { icon: MessageSquare, label: 'Messages', href: '/dashboard/vendor/messages' },
      { icon: FileText, label: 'Reports', href: '/dashboard/vendor/reports' },
      { icon: UserCircle, label: 'My Profile', href: '/dashboard/vendor/profile' },
      { icon: Settings, label: 'Settings', href: '/dashboard/vendor/settings' },
    ],
    SERVICE_PROVIDER: [
      { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard/service-provider' },
      { icon: Calendar, label: 'My Services', href: '/dashboard/service-provider/services' },
      { icon: ShoppingBag, label: 'Bookings', href: '/dashboard/service-provider/bookings' },
      { icon: Users, label: 'Clients', href: '/dashboard/service-provider/clients' },
      { icon: MessageSquare, label: 'Messages', href: '/dashboard/service-provider/messages' },
      { icon: CreditCard, label: 'Earnings', href: '/dashboard/service-provider/earnings' },
      { icon: UserCircle, label: 'My Profile', href: '/dashboard/service-provider/profile' },
      { icon: Settings, label: 'Settings', href: '/dashboard/service-provider/settings' },
    ],
    ADMIN: [
      { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard/admin' },
      { icon: Users, label: 'Users', href: '/dashboard/admin/users' },
      { icon: ShoppingBag, label: 'Orders', href: '/dashboard/admin/orders' },
      { icon: Package, label: 'Products', href: '/dashboard/admin/products' },
      { icon: FileText, label: 'Reports', href: '/dashboard/admin/reports' },
      { icon: MessageSquare, label: 'Messages', href: '/dashboard/admin/messages' },
      { icon: Settings, label: 'Settings', href: '/dashboard/admin/settings' },
    ],
  };

  const items = menuItems[role as keyof typeof menuItems] || menuItems.CUSTOMER;

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onMobileClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-50 h-screen bg-white border-r border-gray-200 transition-all duration-300',
          isCollapsed ? 'w-20' : 'w-64',
          // Mobile: slide in/out from left
          'lg:translate-x-0',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Logo Header */}
        <div className="flex items-center justify-between h-20 border-b border-gray-200 px-4">
          <Link href="/dashboard" className={cn('flex items-center', isCollapsed && 'mx-auto')}>
            {isCollapsed ? (
              <Image
                src="/images/mrkim-logo-three.png"
                alt="Mr. Kim Logo"
                width={50}
                height={50}
                priority
                className="w-auto h-auto transition-all duration-300"
                style={{ 
                  width: '50px', 
                  height: '50px' 
                }}
              />
            ) : (
              <Image
                src="/images/mrkim-logo.svg"
                alt="Mr. Kim Logo"
                width={169}
                height={169}
                priority
                className="w-auto h-auto transition-all duration-300"
                style={{ 
                  width: '130px', 
                  height: '130px' 
                }}
              />
            )}
          </Link>
          
          {/* Mobile Close Button */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={onMobileClose}
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Desktop Toggle Button */}
        <div className="hidden lg:block absolute -right-3 top-24 z-10">
          <Button
            variant="outline"
            size="icon"
            className="h-6 w-6 rounded-full bg-white border-2 border-gray-200 shadow-sm hover:bg-gray-50"
            onClick={onToggle}
          >
            <ChevronLeft
              className={cn(
                'h-4 w-4 transition-transform duration-300',
                isCollapsed && 'rotate-180'
              )}
            />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-6 px-3">
          <ul className="space-y-2">
            {items.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => {
                      // Close mobile menu on navigation
                      if (isMobileOpen) {
                        onMobileClose();
                      }
                    }}
                    className={cn(
                      'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-green-50 text-green-700'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-green-700',
                      isCollapsed && 'justify-center px-2'
                    )}
                    title={isCollapsed ? item.label : undefined}
                  >
                    <Icon className="w-5 h-5 shrink-0" />
                    {!isCollapsed && <span>{item.label}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>
    </>
  );
}
