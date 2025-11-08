'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/store/authStore';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Button from '@/components/ui/Button';
import { useEffect } from 'react';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
}

export default function DashboardLayout({ children, title }: DashboardLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, isLoading, logout, fetchUser } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      router.push('/login');
    } else if (isAuthenticated && !user) {
      fetchUser();
    }
  }, [isAuthenticated, isLoading, user, router, fetchUser]);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  if (isLoading || !user) {
    return <LoadingSpinner />;
  }

  const navItems = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/sales', label: 'Sales' },
    { href: '/leaderboard', label: 'Leaderboard' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
              <p className="text-sm text-gray-600 mt-1">
                Welcome back, {user.firstName} {user.lastName}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600 px-3 py-1 bg-gray-100 rounded-full">
                {user.role}
              </span>
              <Button onClick={handleLogout} variant="primary" size="sm">
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className={`
                  border-b-2 py-4 px-1 text-sm font-medium transition-colors
                  ${
                    pathname === item.href
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</main>
    </div>
  );
}
