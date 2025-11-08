'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import apiClient from '@/lib/api/client';
import { LoadingSpinnerInline } from '@/components/ui/LoadingSpinner';
import toast from 'react-hot-toast';
import StatsCard from '@/components/morning-report/StatsCard';
import { useAuthStore } from '@/lib/store/authStore';

export default function SalespersonDashboard() {
  const { user } = useAuthStore();
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [performance, leaderboard] = await Promise.all([
        apiClient.get('/performance/user'),
        apiClient.get('/performance/leaderboard'),
      ]);

      setDashboardData({
        performance: performance.data.data,
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
    return <LoadingSpinnerInline size="lg" />;
  }

  const { performance, leaderboard } = dashboardData || {};
  const myRank = leaderboard.findIndex((p: any) => p.userId === user?.id) + 1;
  const todayPerf = performance?.today || {};

  return (
    <>
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 rounded-xl shadow-2xl p-8 mb-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-4xl font-extrabold mb-2">Welcome Back, {user?.firstName}!</h2>
            <p className="text-emerald-100 text-lg">Let's make today a winning day</p>
          </div>
          <div className="bg-white bg-opacity-20 rounded-full p-4 backdrop-blur-sm">
            <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Personal Performance Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="My Sales Today"
          value={`$${todayPerf.totalSales?.toLocaleString() || '0'}`}
          subtitle="Keep it up!"
          gradient="from-green-500 to-emerald-600"
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatsCard
          title="My FCP Rate"
          value={`${todayPerf.fcpPercentage?.toFixed(1) || '0'}%`}
          subtitle="Furniture protection"
          gradient="from-blue-500 to-cyan-600"
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          }
        />
        <StatsCard
          title="My Transactions"
          value={todayPerf.transactionCount || 0}
          subtitle="Deals closed"
          gradient="from-purple-500 to-pink-600"
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          }
        />
        <StatsCard
          title="My Ranking"
          value={myRank > 0 ? `#${myRank}` : 'N/A'}
          subtitle="Out of team"
          gradient="from-orange-500 to-red-600"
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
          }
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Quick Actions */}
        <div className="lg:col-span-2 bg-white shadow-xl rounded-xl p-6 border border-gray-100">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <svg className="w-6 h-6 mr-2 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <Link
              href="/sales"
              className="group p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl hover:from-green-100 hover:to-emerald-100 transition-all transform hover:scale-105 border border-green-100"
            >
              <div className="flex flex-col items-center text-center">
                <div className="bg-green-600 text-white rounded-full p-4 mb-4 group-hover:bg-green-700 transition-colors">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h4 className="font-bold text-gray-900 mb-1 text-lg">My Sales</h4>
                <p className="text-sm text-gray-600">View all transactions</p>
              </div>
            </Link>
            <Link
              href="/leaderboard"
              className="group p-6 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl hover:from-yellow-100 hover:to-orange-100 transition-all transform hover:scale-105 border border-yellow-100"
            >
              <div className="flex flex-col items-center text-center">
                <div className="bg-yellow-600 text-white rounded-full p-4 mb-4 group-hover:bg-yellow-700 transition-colors">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                </div>
                <h4 className="font-bold text-gray-900 mb-1 text-lg">Leaderboard</h4>
                <p className="text-sm text-gray-600">See rankings</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Today's Highlights */}
        <div className="bg-white shadow-xl rounded-xl p-6 border border-gray-100">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <svg className="w-6 h-6 mr-2 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            My Stats
          </h3>
          <div className="space-y-3">
            <div className="p-3 bg-green-50 rounded-lg">
              <p className="text-xs text-gray-600 mb-1">Total Sales</p>
              <p className="text-2xl font-bold text-green-600">
                ${todayPerf.totalSales?.toLocaleString() || '0'}
              </p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-xs text-gray-600 mb-1">FCP Amount</p>
              <p className="text-2xl font-bold text-blue-600">
                ${todayPerf.totalFcp?.toLocaleString() || '0'}
              </p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <p className="text-xs text-gray-600 mb-1">Avg Sale</p>
              <p className="text-2xl font-bold text-purple-600">
                ${todayPerf.transactionCount ? (todayPerf.totalSales / todayPerf.transactionCount).toFixed(0) : '0'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Leaderboard Preview */}
      {leaderboard && leaderboard.length > 0 && (
        <div className="bg-white shadow-xl rounded-xl p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-900 flex items-center">
              <svg className="w-6 h-6 mr-2 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
              Today's Leaderboard
            </h3>
            <Link
              href="/leaderboard"
              className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
            >
              View All →
            </Link>
          </div>
          <div className="space-y-2">
            {leaderboard.slice(0, 5).map((performer: any, index: number) => {
              const isMe = performer.userId === user?.id;
              return (
                <div
                  key={index}
                  className={`flex items-center justify-between p-4 rounded-lg border transition-all ${
                    isMe
                      ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-300 shadow-md'
                      : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div
                      className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center font-bold ${
                        index === 0
                          ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-yellow-900'
                          : index === 1
                          ? 'bg-gradient-to-br from-gray-300 to-gray-500 text-gray-900'
                          : index === 2
                          ? 'bg-gradient-to-br from-orange-400 to-orange-600 text-orange-900'
                          : isMe
                          ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white'
                          : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      {index + 1}
                    </div>
                    <div>
                      <p className={`font-semibold ${isMe ? 'text-green-900' : 'text-gray-900'}`}>
                        {performer.user?.firstName} {performer.user?.lastName}
                        {isMe && <span className="ml-2 text-xs bg-green-600 text-white px-2 py-1 rounded-full">You</span>}
                      </p>
                      <p className="text-xs text-gray-600">
                        {performer.transactionCount} transaction{performer.transactionCount !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-bold ${isMe ? 'text-green-900' : 'text-gray-900'}`}>
                      ${performer.totalSales?.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-600">
                      {performer.fcpPercentage?.toFixed(1)}% FCP
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}
