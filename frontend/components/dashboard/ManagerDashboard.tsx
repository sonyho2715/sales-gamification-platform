'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import apiClient from '@/lib/api/client';
import { LoadingSpinnerInline } from '@/components/ui/LoadingSpinner';
import { SkeletonDashboard } from '@/components/ui/Skeleton';
import toast from 'react-hot-toast';
import StatsCard from '@/components/morning-report/StatsCard';
import PerformanceBarChart from '@/components/charts/PerformanceBarChart';

export default function ManagerDashboard() {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [dailySummary, leaderboard] = await Promise.all([
        apiClient.get('/sales/daily-summary'),
        apiClient.get('/performance/leaderboard'),
      ]);

      setDashboardData({
        summary: dailySummary.data.data,
        leaderboard: leaderboard.data.data || [],
      });
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <SkeletonDashboard />;
  }

  const { summary } = dashboardData || {};

  return (
    <>
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-xl shadow-2xl p-8 mb-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-4xl font-extrabold mb-2">Manager Dashboard</h2>
            <p className="text-blue-100 text-lg">Team performance and coaching insights</p>
          </div>
          <div className="bg-white bg-opacity-20 rounded-full p-4 backdrop-blur-sm">
            <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Team Performance Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Team Sales Today"
          value={`$${summary?.summary?.totalSales?.toLocaleString() || '0'}`}
          subtitle="All team members"
          gradient="from-green-500 to-teal-600"
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatsCard
          title="Team FCP Rate"
          value={`${summary?.summary?.fcpPercentage?.toFixed(1) || '0'}%`}
          subtitle="Furniture care protection"
          gradient="from-purple-500 to-pink-600"
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          }
        />
        <StatsCard
          title="Transactions"
          value={summary?.summary?.transactionCount || 0}
          subtitle="Today's deals"
          gradient="from-blue-500 to-cyan-600"
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          }
        />
        <StatsCard
          title="Avg Sale Size"
          value={`$${summary?.summary?.transactionCount ? (summary.summary.totalSales / summary.summary.transactionCount).toFixed(0) : '0'}`}
          subtitle="Per transaction"
          gradient="from-orange-500 to-red-600"
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          }
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Manager Quick Actions */}
        <div className="bg-white shadow-xl rounded-xl p-6 border border-gray-100">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Manager Tools
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <Link
              href="/admin"
              className="group p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg hover:from-blue-100 hover:to-indigo-100 transition-all transform hover:scale-105 border border-blue-100"
            >
              <div className="flex flex-col items-center text-center">
                <div className="bg-blue-600 text-white rounded-full p-3 mb-3 group-hover:bg-blue-700 transition-colors">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h4 className="font-semibold text-gray-900 mb-1">Set Goals</h4>
                <p className="text-xs text-gray-600">Team targets</p>
              </div>
            </Link>
            <Link
              href="/morning-report"
              className="group p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg hover:from-purple-100 hover:to-pink-100 transition-all transform hover:scale-105 border border-purple-100"
            >
              <div className="flex flex-col items-center text-center">
                <div className="bg-purple-600 text-white rounded-full p-3 mb-3 group-hover:bg-purple-700 transition-colors">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h4 className="font-semibold text-gray-900 mb-1">Reports</h4>
                <p className="text-xs text-gray-600">Analytics</p>
              </div>
            </Link>
            <Link
              href="/leaderboard"
              className="group p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg hover:from-green-100 hover:to-emerald-100 transition-all transform hover:scale-105 border border-green-100"
            >
              <div className="flex flex-col items-center text-center">
                <div className="bg-green-600 text-white rounded-full p-3 mb-3 group-hover:bg-green-700 transition-colors">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                </div>
                <h4 className="font-semibold text-gray-900 mb-1">Leaderboard</h4>
                <p className="text-xs text-gray-600">Rankings</p>
              </div>
            </Link>
            <Link
              href="/admin"
              className="group p-4 bg-gradient-to-br from-orange-50 to-red-50 rounded-lg hover:from-orange-100 hover:to-red-100 transition-all transform hover:scale-105 border border-orange-100"
            >
              <div className="flex flex-col items-center text-center">
                <div className="bg-orange-600 text-white rounded-full p-3 mb-3 group-hover:bg-orange-700 transition-colors">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <h4 className="font-semibold text-gray-900 mb-1">Add Sale</h4>
                <p className="text-xs text-gray-600">New entry</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Team Activity */}
        <div className="bg-white shadow-xl rounded-xl p-6 border border-gray-100">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <svg className="w-6 h-6 mr-2 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Today's Activity
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <span className="text-sm font-medium text-gray-900">Active Sellers</span>
              <span className="text-lg font-bold text-blue-600">
                {summary?.byUser?.length || 0}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <span className="text-sm font-medium text-gray-900">Total Revenue</span>
              <span className="text-lg font-bold text-green-600">
                ${summary?.summary?.totalSales?.toLocaleString() || '0'}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
              <span className="text-sm font-medium text-gray-900">FCP Revenue</span>
              <span className="text-lg font-bold text-purple-600">
                ${summary?.summary?.totalFcp?.toLocaleString() || '0'}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
              <span className="text-sm font-medium text-gray-900">Team FCP %</span>
              <span className="text-lg font-bold text-orange-600">
                {summary?.summary?.fcpPercentage?.toFixed(1) || '0'}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      {summary?.byUser && summary.byUser.length > 0 && (
        <div className="mb-8">
          <PerformanceBarChart
            title="Team Performance Today"
            data={summary.byUser
              .sort((a: any, b: any) => b.totalSales - a.totalSales)
              .map((p: any) => ({
                name: `${p.user.firstName} ${p.user.lastName.charAt(0)}.`,
                sales: Number(p.totalSales),
              }))}
          />
        </div>
      )}

      {/* Top Performers */}
      {summary?.byUser && summary.byUser.length > 0 && (
        <div className="bg-white shadow-xl rounded-xl p-6 border border-gray-100">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <svg className="w-6 h-6 mr-2 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
            Your Team's Top Performers
          </h3>
          <div className="space-y-3">
            {summary.byUser
              .sort((a: any, b: any) => b.totalSales - a.totalSales)
              .map((performer: any, index: number) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white rounded-lg border border-gray-200 hover:shadow-md transition-all"
                >
                  <div className="flex items-center space-x-4">
                    <div
                      className={`flex-shrink-0 h-12 w-12 rounded-full flex items-center justify-center font-bold text-lg ${
                        index === 0
                          ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-yellow-900'
                          : index === 1
                          ? 'bg-gradient-to-br from-gray-300 to-gray-500 text-gray-900'
                          : index === 2
                          ? 'bg-gradient-to-br from-orange-400 to-orange-600 text-orange-900'
                          : 'bg-gradient-to-br from-indigo-100 to-indigo-200 text-indigo-700'
                      }`}
                    >
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        {performer.user.firstName} {performer.user.lastName}
                      </p>
                      <p className="text-sm text-gray-500">
                        {performer.transactionCount} transaction{performer.transactionCount !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-gray-900">
                      ${performer.totalSales.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-600">
                      {((performer.totalFcp / performer.totalSales) * 100).toFixed(1)}% FCP
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </>
  );
}
