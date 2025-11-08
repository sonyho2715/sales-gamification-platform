'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import apiClient from '@/lib/api/client';
import { LoadingSpinnerInline } from '@/components/ui/LoadingSpinner';
import toast from 'react-hot-toast';
import StatsCard from '@/components/morning-report/StatsCard';

export default function AdminDashboard() {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [dailySummary, goals, users] = await Promise.all([
        apiClient.get('/sales/daily-summary'),
        apiClient.get('/goals'),
        apiClient.get('/users'),
      ]);

      setDashboardData({
        summary: dailySummary.data.data,
        goals: goals.data.data || [],
        users: users.data.data || [],
      });
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinnerInline size="lg" />;
  }

  const { summary, goals, users } = dashboardData || {};
  const activeUsers = users?.filter((u: any) => u.active)?.length || 0;
  const totalGoals = goals?.length || 0;

  return (
    <>
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 rounded-xl shadow-2xl p-8 mb-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-4xl font-extrabold mb-2">Admin Dashboard</h2>
            <p className="text-purple-100 text-lg">System overview and management tools</p>
          </div>
          <div className="bg-white bg-opacity-20 rounded-full p-4 backdrop-blur-sm">
            <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* System Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Total Sales Today"
          value={`$${summary?.summary?.totalSales?.toLocaleString() || '0'}`}
          subtitle="Across all locations"
          gradient="from-blue-500 to-cyan-600"
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatsCard
          title="Active Team Members"
          value={activeUsers}
          subtitle={`${users?.length || 0} total users`}
          gradient="from-green-500 to-emerald-600"
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          }
        />
        <StatsCard
          title="Transactions Today"
          value={summary?.summary?.transactionCount || 0}
          subtitle="Total sales count"
          gradient="from-purple-500 to-pink-600"
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          }
        />
        <StatsCard
          title="Active Goals"
          value={totalGoals}
          subtitle="Performance targets"
          gradient="from-orange-500 to-red-600"
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
      </div>

      {/* Admin Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white shadow-xl rounded-xl p-6 border border-gray-100">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <svg className="w-6 h-6 mr-2 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <Link
              href="/admin"
              className="group p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg hover:from-indigo-100 hover:to-purple-100 transition-all transform hover:scale-105 border border-indigo-100"
            >
              <div className="flex flex-col items-center text-center">
                <div className="bg-indigo-600 text-white rounded-full p-3 mb-3 group-hover:bg-indigo-700 transition-colors">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <h4 className="font-semibold text-gray-900 mb-1">Add Sale</h4>
                <p className="text-xs text-gray-600">Record new transaction</p>
              </div>
            </Link>
            <Link
              href="/admin"
              className="group p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg hover:from-green-100 hover:to-emerald-100 transition-all transform hover:scale-105 border border-green-100"
            >
              <div className="flex flex-col items-center text-center">
                <div className="bg-green-600 text-white rounded-full p-3 mb-3 group-hover:bg-green-700 transition-colors">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h4 className="font-semibold text-gray-900 mb-1">Set Goals</h4>
                <p className="text-xs text-gray-600">Manage targets</p>
              </div>
            </Link>
            <Link
              href="/morning-report"
              className="group p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg hover:from-blue-100 hover:to-cyan-100 transition-all transform hover:scale-105 border border-blue-100"
            >
              <div className="flex flex-col items-center text-center">
                <div className="bg-blue-600 text-white rounded-full p-3 mb-3 group-hover:bg-blue-700 transition-colors">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h4 className="font-semibold text-gray-900 mb-1">View Reports</h4>
                <p className="text-xs text-gray-600">Morning analytics</p>
              </div>
            </Link>
            <Link
              href="/admin"
              className="group p-4 bg-gradient-to-br from-orange-50 to-red-50 rounded-lg hover:from-orange-100 hover:to-red-100 transition-all transform hover:scale-105 border border-orange-100"
            >
              <div className="flex flex-col items-center text-center">
                <div className="bg-orange-600 text-white rounded-full p-3 mb-3 group-hover:bg-orange-700 transition-colors">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <h4 className="font-semibold text-gray-900 mb-1">Bulk Import</h4>
                <p className="text-xs text-gray-600">Upload CSV data</p>
              </div>
            </Link>
          </div>
        </div>

        {/* System Health */}
        <div className="bg-white shadow-xl rounded-xl p-6 border border-gray-100">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <svg className="w-6 h-6 mr-2 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            System Status
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-3 animate-pulse"></div>
                <span className="text-sm font-medium text-gray-900">Database</span>
              </div>
              <span className="text-xs text-green-600 font-semibold">Online</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-3 animate-pulse"></div>
                <span className="text-sm font-medium text-gray-900">API Services</span>
              </div>
              <span className="text-xs text-green-600 font-semibold">Healthy</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                <span className="text-sm font-medium text-gray-900">Active Sessions</span>
              </div>
              <span className="text-xs text-blue-600 font-semibold">{activeUsers}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-purple-500 rounded-full mr-3"></div>
                <span className="text-sm font-medium text-gray-900">Today's Performance</span>
              </div>
              <span className="text-xs text-purple-600 font-semibold">
                {summary?.summary?.fcpPercentage?.toFixed(1) || '0'}% FCP
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Top Performers */}
      {summary?.byUser && summary.byUser.length > 0 && (
        <div className="bg-white shadow-xl rounded-xl p-6 border border-gray-100">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <svg className="w-6 h-6 mr-2 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
            Top Performers Today
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {summary.byUser
              .sort((a: any, b: any) => b.totalSales - a.totalSales)
              .slice(0, 6)
              .map((performer: any, index: number) => (
                <div
                  key={index}
                  className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div
                      className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center font-bold ${
                        index === 0
                          ? 'bg-yellow-500 text-yellow-900'
                          : index === 1
                          ? 'bg-gray-400 text-gray-900'
                          : index === 2
                          ? 'bg-orange-500 text-orange-900'
                          : 'bg-indigo-100 text-indigo-600'
                      }`}
                    >
                      {index + 1}
                    </div>
                    <span className="text-2xl font-bold text-gray-900">
                      ${(performer.totalSales / 1000).toFixed(1)}k
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-gray-900 mb-1">
                    {performer.user.firstName} {performer.user.lastName}
                  </p>
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>{performer.transactionCount} sales</span>
                    <span>{((performer.totalFcp / performer.totalSales) * 100).toFixed(1)}% FCP</span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </>
  );
}
