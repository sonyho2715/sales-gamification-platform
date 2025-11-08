'use client';

import { useEffect, useState, useMemo } from 'react';
import { useAuthStore } from '@/lib/store/authStore';
import { performanceApi } from '@/lib/api/performance';
import { LeaderboardEntry } from '@/types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { LoadingSpinnerInline } from '@/components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

const COLORS = ['#4F46E5', '#7C3AED', '#EC4899', '#F59E0B', '#10B981', '#3B82F6', '#6366F1', '#8B5CF6'];

export default function LeaderboardPage() {
  const { user, isAuthenticated } = useAuthStore();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [scope, setScope] = useState<'organization' | 'location'>('organization');
  const [timeframe, setTimeframe] = useState<'today' | 'week' | 'month'>('today');

  useEffect(() => {
    if (isAuthenticated) {
      loadLeaderboard();
    }
  }, [isAuthenticated, scope, timeframe]);

  const loadLeaderboard = async () => {
    try {
      setLoading(true);
      const filters: any = { scope, limit: 20 };

      // Set date filters based on timeframe
      const today = new Date();
      if (timeframe === 'week') {
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        filters.startDate = weekAgo.toISOString().split('T')[0];
        filters.endDate = today.toISOString().split('T')[0];
      } else if (timeframe === 'month') {
        const monthAgo = new Date(today);
        monthAgo.setDate(monthAgo.getDate() - 30);
        filters.startDate = monthAgo.toISOString().split('T')[0];
        filters.endDate = today.toISOString().split('T')[0];
      }

      if (scope === 'location' && user?.locationId) {
        filters.locationId = user.locationId;
      }

      const data = await performanceApi.getLeaderboard(filters);
      setLeaderboard(data);
    } catch (error) {
      toast.error('Failed to load leaderboard');
      console.error('Failed to load leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  // Prepare chart data - memoized for performance
  const barChartData = useMemo(() =>
    leaderboard.slice(0, 10).map((entry) => ({
      name: `${entry.user.firstName} ${entry.user.lastName}`,
      sales: Number(entry.totalSales),
      fcp: Number(entry.fcpPercentage),
    })),
    [leaderboard]
  );

  const pieChartData = useMemo(() =>
    leaderboard.slice(0, 8).map((entry, index) => ({
      name: `${entry.user.firstName} ${entry.user.lastName}`,
      value: Number(entry.totalSales),
      fill: COLORS[index % COLORS.length],
    })),
    [leaderboard]
  );

  return (
    <DashboardLayout title="Leaderboard">
      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex gap-2">
          <Button
            onClick={() => setScope('organization')}
            variant={scope === 'organization' ? 'primary' : 'secondary'}
          >
            Organization
          </Button>
          <Button
            onClick={() => setScope('location')}
            variant={scope === 'location' ? 'primary' : 'secondary'}
          >
            My Location
          </Button>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={() => setTimeframe('today')}
            variant={timeframe === 'today' ? 'primary' : 'secondary'}
            size="sm"
          >
            Today
          </Button>
          <Button
            onClick={() => setTimeframe('week')}
            variant={timeframe === 'week' ? 'primary' : 'secondary'}
            size="sm"
          >
            This Week
          </Button>
          <Button
            onClick={() => setTimeframe('month')}
            variant={timeframe === 'month' ? 'primary' : 'secondary'}
            size="sm"
          >
            This Month
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <LoadingSpinnerInline size="lg" />
          <p className="mt-4 text-gray-600">Loading leaderboard...</p>
        </div>
        ) : leaderboard.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-500">No performance data available for this period.</p>
          </div>
        ) : (
          <>
            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Bar Chart */}
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Top 10 - Sales Performance
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={barChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="name"
                      angle={-45}
                      textAnchor="end"
                      height={100}
                      fontSize={12}
                    />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="sales" fill="#4F46E5" name="Total Sales ($)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Pie Chart */}
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Sales Distribution
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => `${entry.name.split(' ')[0]}: $${entry.value.toLocaleString()}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Leaderboard Table */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Rankings</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Rank
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Salesperson
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Location
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total Sales
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        FCP %
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Sales/Hour
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Star Day
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {leaderboard.map((entry, index) => {
                      const isCurrentUser = entry.user.id === user?.id;
                      return (
                        <tr
                          key={entry.user.id}
                          className={`${isCurrentUser ? 'bg-indigo-50' : 'hover:bg-gray-50'}`}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {entry.rank <= 3 ? (
                                <div
                                  className={`flex items-center justify-center h-8 w-8 rounded-full ${
                                    entry.rank === 1
                                      ? 'bg-yellow-400'
                                      : entry.rank === 2
                                      ? 'bg-gray-300'
                                      : 'bg-orange-400'
                                  }`}
                                >
                                  <span className="text-sm font-bold text-white">{entry.rank}</span>
                                </div>
                              ) : (
                                <span className="text-sm font-medium text-gray-900 ml-2">
                                  {entry.rank}
                                </span>
                              )}
                              {isCurrentUser && (
                                <span className="ml-2 text-xs font-medium text-indigo-600">(You)</span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-10 w-10 flex-shrink-0">
                                <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                                  <span className="text-indigo-600 font-semibold text-sm">
                                    {entry.user.firstName[0]}
                                    {entry.user.lastName[0]}
                                  </span>
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {entry.user.firstName} {entry.user.lastName}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {entry.transactionCount} transaction{entry.transactionCount !== 1 ? 's' : ''}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {entry.location.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-semibold">
                            ${entry.totalSales.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                            {entry.fcpPercentage.toFixed(1)}%
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                            ${entry.salesPerHour.toFixed(0)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            {entry.isStarDay ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                ⭐ Star
                              </span>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
    </DashboardLayout>
  );
}
