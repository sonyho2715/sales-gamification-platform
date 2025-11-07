'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/authStore';
import apiClient from '@/lib/api/client';

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, fetchUser, logout } = useAuthStore();
  const [dailySummary, setDailySummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      router.push('/login');
    } else if (isAuthenticated && !user) {
      fetchUser();
    }
  }, [isAuthenticated, isLoading, user, router, fetchUser]);

  useEffect(() => {
    const fetchDailySummary = async () => {
      try {
        const response = await apiClient.get('/sales/daily-summary');
        setDailySummary(response.data.data);
      } catch (error) {
        console.error('Failed to fetch daily summary:', error);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchDailySummary();
    }
  }, [isAuthenticated]);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  if (isLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Sales Dashboard</h1>
              <p className="text-sm text-gray-600 mt-1">
                Welcome back, {user.firstName} {user.lastName}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">{user.role}</span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <a
              href="/dashboard"
              className="border-b-2 border-indigo-500 py-4 px-1 text-sm font-medium text-indigo-600"
            >
              Dashboard
            </a>
            <a
              href="/sales"
              className="border-b-2 border-transparent py-4 px-1 text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
            >
              Sales
            </a>
            <a
              href="/leaderboard"
              className="border-b-2 border-transparent py-4 px-1 text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
            >
              Leaderboard
            </a>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-1">
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Sales</dt>
                  <dd className="mt-1 text-3xl font-semibold text-gray-900">
                    ${dailySummary?.summary?.totalSales?.toLocaleString() || '0'}
                  </dd>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-1">
                  <dt className="text-sm font-medium text-gray-500 truncate">FCP Percentage</dt>
                  <dd className="mt-1 text-3xl font-semibold text-gray-900">
                    {dailySummary?.summary?.fcpPercentage?.toFixed(1) || '0'}%
                  </dd>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-1">
                  <dt className="text-sm font-medium text-gray-500 truncate">Transactions</dt>
                  <dd className="mt-1 text-3xl font-semibold text-gray-900">
                    {dailySummary?.summary?.transactionCount || 0}
                  </dd>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-1">
                  <dt className="text-sm font-medium text-gray-500 truncate">Total FCP</dt>
                  <dd className="mt-1 text-3xl font-semibold text-gray-900">
                    ${dailySummary?.summary?.totalFcp?.toLocaleString() || '0'}
                  </dd>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Top Performers */}
        {dailySummary?.byUser && dailySummary.byUser.length > 0 && (
          <div className="bg-white shadow rounded-lg p-6 mb-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Top Performers Today</h3>
            <div className="space-y-4">
              {dailySummary.byUser
                .sort((a: any, b: any) => b.totalSales - a.totalSales)
                .slice(0, 5)
                .map((performer: any, index: number) => (
                  <div key={index} className="flex items-center justify-between border-b pb-3">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center">
                        <span className="text-indigo-600 font-semibold">{index + 1}</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {performer.user.firstName} {performer.user.lastName}
                        </p>
                        <p className="text-sm text-gray-500">
                          {performer.transactionCount} transaction{performer.transactionCount !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">
                        ${performer.totalSales.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500">
                        {((performer.totalFcp / performer.totalSales) * 100).toFixed(1)}% FCP
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <a
              href="/sales"
              className="block p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-colors"
            >
              <h4 className="text-sm font-medium text-gray-900">View Sales</h4>
              <p className="mt-1 text-xs text-gray-500">See all sales transactions</p>
            </a>
            <a
              href="/leaderboard"
              className="block p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-colors"
            >
              <h4 className="text-sm font-medium text-gray-900">Leaderboard</h4>
              <p className="mt-1 text-xs text-gray-500">View team rankings</p>
            </a>
            <a
              href="#"
              className="block p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-colors opacity-50 cursor-not-allowed"
            >
              <h4 className="text-sm font-medium text-gray-900">Add Sale (Coming Soon)</h4>
              <p className="mt-1 text-xs text-gray-500">Create a new sale</p>
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
