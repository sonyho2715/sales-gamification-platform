'use client';

import { useState, useEffect } from 'react';
import apiClient from '@/lib/api/client';
import toast from 'react-hot-toast';
import { LoadingSpinnerInline } from '@/components/ui/LoadingSpinner';
import { SkeletonPlaybookCard } from '@/components/ui/Skeleton';
import { EmptyCoachingPlaybooksState } from '@/components/ui/EmptyState';
import { format } from 'date-fns';

interface Playbook {
  id: string;
  userId: string;
  trigger: string;
  status: string;
  priority: number;
  title: string;
  description: string;
  diagnosisData: any;
  recommendedActions: any[];
  dueDate?: string;
  createdAt: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
    location?: {
      name: string;
      code: string;
    };
  };
}

interface Props {
  refreshKey: number;
  onRefresh: () => void;
}

export default function CoachingPlaybookList({ refreshKey, onRefresh }: Props) {
  const [playbooks, setPlaybooks] = useState<Playbook[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetchPlaybooks();
  }, [refreshKey, statusFilter]);

  const fetchPlaybooks = async () => {
    try {
      setLoading(true);
      const params = statusFilter ? `?status=${statusFilter}` : '';
      const response = await apiClient.get(`/coaching/playbooks${params}`);
      setPlaybooks(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch playbooks:', error);
      toast.error('Failed to load playbooks');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (playbookId: string, newStatus: string) => {
    try {
      await apiClient.patch(`/coaching/playbooks/${playbookId}/status`, {
        status: newStatus,
      });
      toast.success('Playbook status updated');
      onRefresh();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update status');
    }
  };

  const getPriorityColor = (priority: number) => {
    if (priority >= 8) return 'text-red-600 bg-red-100 border-red-200';
    if (priority >= 6) return 'text-orange-600 bg-orange-100 border-orange-200';
    return 'text-yellow-600 bg-yellow-100 border-yellow-200';
  };

  const getPriorityLabel = (priority: number) => {
    if (priority >= 8) return 'High Priority';
    if (priority >= 6) return 'Medium Priority';
    return 'Low Priority';
  };

  const getTriggerIcon = (trigger: string) => {
    switch (trigger) {
      case 'PERFORMANCE_DROP':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
          </svg>
        );
      case 'BELOW_GOAL':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
          </svg>
        );
      case 'LOW_FCP_RATE':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        );
      case 'LOW_CONVERSION':
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <SkeletonPlaybookCard key={i} />
        ))}
      </div>
    );
  }

  if (playbooks.length === 0 && !statusFilter) {
    return <EmptyCoachingPlaybooksState />;
  }

  return (
    <div className="space-y-6">
      {/* Filter */}
      <div className="bg-white rounded-xl shadow-xl p-6 border border-gray-100">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Filter Playbooks</h3>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">All Status</option>
            <option value="RECOMMENDED">Recommended</option>
            <option value="ASSIGNED">Assigned</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
            <option value="DISMISSED">Dismissed</option>
          </select>
        </div>
      </div>

      {/* Playbooks List */}
      {playbooks.length === 0 ? (
        <div className="bg-white rounded-xl shadow-xl p-12 border border-gray-100 text-center">
          <svg
            className="w-16 h-16 text-gray-400 mx-auto mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No playbooks found</h3>
          <p className="text-gray-600">There are no coaching playbooks matching your filter criteria.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {playbooks.map((playbook) => (
            <div
              key={playbook.id}
              className={`bg-white rounded-xl shadow-xl border-2 transition-all ${
                expandedId === playbook.id ? 'border-indigo-300' : 'border-gray-100'
              }`}
            >
              {/* Playbook Header */}
              <div
                className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => setExpandedId(expandedId === playbook.id ? null : playbook.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${getPriorityColor(
                          playbook.priority
                        )}`}
                      >
                        {getPriorityLabel(playbook.priority)}
                      </span>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
                        {getTriggerIcon(playbook.trigger)}
                        <span className="ml-2">{playbook.trigger.replace(/_/g, ' ')}</span>
                      </span>
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${
                          playbook.status === 'COMPLETED'
                            ? 'bg-green-100 text-green-800 border-green-200'
                            : playbook.status === 'IN_PROGRESS'
                            ? 'bg-blue-100 text-blue-800 border-blue-200'
                            : 'bg-yellow-100 text-yellow-800 border-yellow-200'
                        }`}
                      >
                        {playbook.status.replace('_', ' ')}
                      </span>
                    </div>
                    <h4 className="text-xl font-bold text-gray-900 mb-2">{playbook.title}</h4>
                    <p className="text-gray-600 mb-3">{playbook.description}</p>
                    <div className="flex items-center space-x-6 text-sm text-gray-500">
                      <div className="flex items-center space-x-2">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                        <span>
                          {playbook.user.firstName} {playbook.user.lastName}
                        </span>
                      </div>
                      {playbook.user.location && (
                        <div className="flex items-center space-x-2">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          </svg>
                          <span>{playbook.user.location.name}</span>
                        </div>
                      )}
                      {playbook.dueDate && (
                        <div className="flex items-center space-x-2">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          <span>Due: {format(new Date(playbook.dueDate), 'MMM d, yyyy')}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="ml-4">
                    <svg
                      className={`w-6 h-6 text-gray-400 transition-transform ${
                        expandedId === playbook.id ? 'transform rotate-180' : ''
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Expanded Content */}
              {expandedId === playbook.id && (
                <div className="border-t border-gray-200 p-6 bg-gray-50">
                  {/* Diagnosis Data */}
                  <div className="mb-6">
                    <h5 className="text-sm font-semibold text-gray-900 mb-3">Performance Diagnosis</h5>
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                        {JSON.stringify(playbook.diagnosisData, null, 2)}
                      </pre>
                    </div>
                  </div>

                  {/* Recommended Actions */}
                  <div className="mb-6">
                    <h5 className="text-sm font-semibold text-gray-900 mb-3">Recommended Actions</h5>
                    <div className="space-y-2">
                      {playbook.recommendedActions.map((action: any, index: number) => (
                        <div key={index} className="bg-white rounded-lg p-4 border border-gray-200">
                          <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0 w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-sm font-bold">
                              {action.priority || index + 1}
                            </div>
                            <div>
                              <h6 className="font-semibold text-gray-900">{action.action}</h6>
                              <p className="text-sm text-gray-600 mt-1">{action.description}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Status Actions */}
                  <div className="flex items-center justify-end space-x-3">
                    {playbook.status === 'RECOMMENDED' && (
                      <>
                        <button
                          onClick={() => handleStatusChange(playbook.id, 'ASSIGNED')}
                          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                        >
                          Assign to Me
                        </button>
                        <button
                          onClick={() => handleStatusChange(playbook.id, 'DISMISSED')}
                          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                        >
                          Dismiss
                        </button>
                      </>
                    )}
                    {playbook.status === 'ASSIGNED' && (
                      <button
                        onClick={() => handleStatusChange(playbook.id, 'IN_PROGRESS')}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                      >
                        Start Coaching
                      </button>
                    )}
                    {playbook.status === 'IN_PROGRESS' && (
                      <button
                        onClick={() => handleStatusChange(playbook.id, 'COMPLETED')}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                      >
                        Mark Complete
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
