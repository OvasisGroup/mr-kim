'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { Sidebar } from './sidebar';
import { DashboardNavbar } from './navbar';
import { DashboardFooter } from './footer';
import { cn } from '@/lib/utils';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Auto-collapse on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsCollapsed(false);
        setIsMobileOpen(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar
        role={user.role}
        isCollapsed={isCollapsed}
        isMobileOpen={isMobileOpen}
        onToggle={() => setIsCollapsed(!isCollapsed)}
        onMobileClose={() => setIsMobileOpen(false)}
      />

      {/* Main Content Area */}
      <div
        className={cn(
          'transition-all duration-300',
          isCollapsed ? 'lg:ml-20' : 'lg:ml-64'
        )}
      >
        {/* Navbar */}
        <DashboardNavbar
          onMenuClick={() => setIsMobileOpen(!isMobileOpen)}
          isCollapsed={isCollapsed}
        />

        {/* Page Content */}
        <main className="pt-20 min-h-[calc(100vh-80px)]">
          <div className="p-6">
            {children}
          </div>
          
          {/* Footer */}
          <DashboardFooter />
        </main>
      </div>
    </div>
  );
}
