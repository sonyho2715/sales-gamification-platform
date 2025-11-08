'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { LoadingSpinnerInline } from '@/components/ui/LoadingSpinner';
import apiClient from '@/lib/api/client';
import toast from 'react-hot-toast';
import YesterdaysStars from '@/components/morning-report/YesterdaysStars';
import PerformanceCharts from '@/components/morning-report/PerformanceCharts';
import { format } from 'date-fns';

export default function MorningReportPage() {
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(
    format(new Date(Date.now() - 86400000), 'yyyy-MM-dd') // Yesterday
  );
  const [activeTab, setActiveTab] = useState<'stars' | 'company' | 'stores' | 'individuals'>('stars');

  useEffect(() => {
    fetchReportData();
  }, [selectedDate]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/reports/morning-report?date=${selectedDate}`);
      setReportData(response.data.data);
    } catch (error) {
      console.error('Failed to fetch morning report:', error);
      toast.error('Failed to load morning report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout title="Morning Report">
      {/* Header with Date Selector */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-xl shadow-2xl p-8 mb-6 text-white">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-4xl font-extrabold mb-2">Morning Report</h2>
            <p className="text-indigo-100 text-lg">
              Daily performance overview and analytics
            </p>
          </div>
          <div className="flex items-center space-x-4 bg-white bg-opacity-20 rounded-lg p-4 backdrop-blur-sm">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-4 py-2 bg-white text-gray-900 border-0 rounded-lg focus:ring-2 focus:ring-white shadow-lg"
              />
            </div>
            <button
              onClick={fetchReportData}
              className="px-6 py-2 bg-white text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors shadow-lg font-semibold"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-white shadow rounded-lg mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('stars')}
              className={`${
                activeTab === 'stars'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
            >
              Yesterday's Stars
            </button>
            <button
              onClick={() => setActiveTab('company')}
              className={`${
                activeTab === 'company'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
            >
              Company Performance
            </button>
            <button
              onClick={() => setActiveTab('stores')}
              className={`${
                activeTab === 'stores'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
            >
              Store Breakdown
            </button>
            <button
              onClick={() => setActiveTab('individuals')}
              className={`${
                activeTab === 'individuals'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
            >
              Individual Performance
            </button>
          </nav>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <LoadingSpinnerInline size="lg" />
        </div>
      ) : (
        <div className="space-y-6">
          {activeTab === 'stars' && (
            <YesterdaysStars data={reportData?.yesterdaysStars} />
          )}
          {activeTab === 'company' && (
            <PerformanceCharts data={reportData?.companyPerformance} />
          )}
          {activeTab === 'stores' && (
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Store Performance Breakdown
              </h3>
              <p className="text-gray-500">Store breakdown charts coming soon...</p>
            </div>
          )}
          {activeTab === 'individuals' && (
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Individual Performance Tracking
              </h3>
              <p className="text-gray-500">Individual performance pages coming soon...</p>
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
}
