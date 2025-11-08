'use client';

import { useState, useEffect } from 'react';
import apiClient from '@/lib/api/client';
import toast from 'react-hot-toast';
import { LoadingSpinnerInline } from '@/components/ui/LoadingSpinner';

interface DashboardData {
  summary: {
    totalPlaybooks: number;
    byStatus: {
      RECOMMENDED: number;
      ASSIGNED: number;
      IN_PROGRESS: number;
      COMPLETED: number;
      DISMISSED: number;
    };
    byTrigger: {
      PERFORMANCE_DROP: number;
      BELOW_GOAL: number;
      LOW_FCP_RATE: number;
      LOW_CONVERSION: number;
      MANUAL: number;
    };
    highPriority: any[];
    overduePlaybooks: any[];
  };
  recentPlaybooks: any[];
}

interface Props {
  refreshKey: number;
}

export default function CoachingDashboardSummary({ refreshKey }: Props) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, [refreshKey]);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/coaching/dashboard');
      setData(response.data.data);
    } catch (error) {
      console.error('Failed to fetch coaching dashboard:', error);
      toast.error('Failed to load coaching dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinnerInline size="lg" />;
  }

  if (!data) {
    return (
      <div className="bg-white rounded-xl shadow-xl p-6 border border-gray-100">
        <p className="text-gray-600">No coaching data available</p>
      </div>
    );
  }

  const { summary } = data;

  return (
    <div className="space-y-6">
      {/* Alert for High Priority & Overdue */}
      {(summary.highPriority.length > 0 || summary.overduePlaybooks.length > 0) && (
        <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-6">
          <div className="flex items-start">
            <svg
              className="w-6 h-6 text-red-500 mr-3 flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <div>
              <h3 className="text-lg font-semibold text-red-900 mb-2">Action Required</h3>
              {summary.highPriority.length > 0 && (
                <p className="text-red-800 mb-1">
                  <strong>{summary.highPriority.length}</strong> high-priority playbook
                  {summary.highPriority.length !== 1 ? 's' : ''} need{summary.highPriority.length === 1 ? 's' : ''}{' '}
                  attention
                </p>
              )}
              {summary.overduePlaybooks.length > 0 && (
                <p className="text-red-800">
                  <strong>{summary.overduePlaybooks.length}</strong> playbook
                  {summary.overduePlaybooks.length !== 1 ? 's are' : ' is'} overdue
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <svg className="w-8 h-8 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          </div>
          <div className="text-4xl font-bold mb-2">{summary.totalPlaybooks}</div>
          <div className="text-indigo-100">Total Playbooks</div>
        </div>

        <div className="bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <svg className="w-8 h-8 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <div className="text-4xl font-bold mb-2">{summary.highPriority.length}</div>
          <div className="text-yellow-100">High Priority</div>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <svg className="w-8 h-8 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>
          <div className="text-4xl font-bold mb-2">{summary.byStatus.IN_PROGRESS}</div>
          <div className="text-blue-100">In Progress</div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <svg className="w-8 h-8 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div className="text-4xl font-bold mb-2">{summary.byStatus.COMPLETED}</div>
          <div className="text-green-100">Completed</div>
        </div>
      </div>

      {/* Status Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-xl p-6 border border-gray-100">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
            <svg className="w-6 h-6 mr-2 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
            Playbooks by Status
          </h3>
          <div className="space-y-4">
            {Object.entries(summary.byStatus).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      status === 'RECOMMENDED'
                        ? 'bg-yellow-500'
                        : status === 'ASSIGNED'
                        ? 'bg-blue-500'
                        : status === 'IN_PROGRESS'
                        ? 'bg-indigo-500'
                        : status === 'COMPLETED'
                        ? 'bg-green-500'
                        : 'bg-gray-400'
                    }`}
                  ></div>
                  <span className="text-gray-700 font-medium">{status.replace('_', ' ')}</span>
                </div>
                <span className="text-2xl font-bold text-gray-900">{count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-xl p-6 border border-gray-100">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
            <svg className="w-6 h-6 mr-2 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
              />
            </svg>
            Coaching Triggers
          </h3>
          <div className="space-y-4">
            {Object.entries(summary.byTrigger).map(([trigger, count]) => (
              <div key={trigger} className="flex items-center justify-between">
                <span className="text-gray-700 font-medium">{trigger.replace(/_/g, ' ')}</span>
                <span className="text-2xl font-bold text-gray-900">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
