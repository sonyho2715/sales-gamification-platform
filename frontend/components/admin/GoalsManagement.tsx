'use client';

import { useState, useEffect } from 'react';
import apiClient from '@/lib/api/client';
import toast from 'react-hot-toast';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { format, startOfMonth, endOfMonth } from 'date-fns';

interface Goal {
  id: string;
  goalType: string;
  targetValue: number;
  periodStart: string;
  periodEnd: string;
  user?: {
    firstName: string;
    lastName: string;
  };
  location?: {
    name: string;
  };
}

const GOAL_TYPES = [
  { value: 'MONTHLY_SALES', label: 'Monthly Sales' },
  { value: 'DAILY_SALES', label: 'Daily Sales' },
  { value: 'FCP_PERCENTAGE', label: 'FCP Percentage' },
  { value: 'SALES_PER_HOUR', label: 'Sales Per Hour' },
  { value: 'STAR_DAYS', label: 'Star Days' },
];

export default function GoalsManagement() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const currentDate = new Date();
  const [formData, setFormData] = useState({
    goalType: 'MONTHLY_SALES',
    targetValue: '',
    periodStart: format(startOfMonth(currentDate), 'yyyy-MM-dd'),
    periodEnd: format(endOfMonth(currentDate), 'yyyy-MM-dd'),
    userId: '',
    locationId: '',
  });

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      const response = await apiClient.get('/goals');
      setGoals(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch goals:', error);
      toast.error('Failed to load goals');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.targetValue) {
      toast.error('Please enter a target value');
      return;
    }

    setLoading(true);
    try {
      const goalData = {
        goalType: formData.goalType,
        targetValue: parseFloat(formData.targetValue),
        periodStart: formData.periodStart,
        periodEnd: formData.periodEnd,
        userId: formData.userId || null,
        locationId: formData.locationId || null,
      };

      await apiClient.post('/goals', goalData);

      toast.success('Goal created successfully!');
      setShowForm(false);
      fetchGoals();

      // Reset form
      setFormData({
        goalType: 'MONTHLY_SALES',
        targetValue: '',
        periodStart: format(startOfMonth(currentDate), 'yyyy-MM-dd'),
        periodEnd: format(endOfMonth(currentDate), 'yyyy-MM-dd'),
        userId: '',
        locationId: '',
      });
    } catch (error: any) {
      console.error('Failed to create goal:', error);
      toast.error(error.response?.data?.message || 'Failed to create goal');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (goalId: string) => {
    if (!confirm('Are you sure you want to delete this goal?')) {
      return;
    }

    try {
      await apiClient.delete(`/goals/${goalId}`);
      toast.success('Goal deleted successfully!');
      fetchGoals();
    } catch (error) {
      console.error('Failed to delete goal:', error);
      toast.error('Failed to delete goal');
    }
  };

  const getGoalTypeLabel = (type: string) => {
    return GOAL_TYPES.find((t) => t.value === type)?.label || type;
  };

  const formatGoalValue = (type: string, value: number) => {
    if (type === 'FCP_PERCENTAGE') {
      return `${value}%`;
    } else if (type === 'STAR_DAYS') {
      return value.toString();
    } else {
      return `$${value.toLocaleString()}`;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Add Button */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Goals Management</h3>
            <p className="text-gray-600">Set and track performance goals for your team</p>
          </div>
          <Button
            variant="primary"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? 'Cancel' : '+ New Goal'}
          </Button>
        </div>

        {/* Create Goal Form */}
        {showForm && (
          <form onSubmit={handleSubmit} className="border-t pt-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Goal Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Goal Type <span className="text-red-500">*</span>
                </label>
                <select
                  name="goalType"
                  value={formData.goalType}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                >
                  {GOAL_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Target Value */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Value <span className="text-red-500">*</span>
                </label>
                <Input
                  type="number"
                  step="0.01"
                  name="targetValue"
                  value={formData.targetValue}
                  onChange={handleChange}
                  placeholder="Enter target value"
                  required
                />
              </div>

              {/* Period Start */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Period Start <span className="text-red-500">*</span>
                </label>
                <Input
                  type="date"
                  name="periodStart"
                  value={formData.periodStart}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Period End */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Period End <span className="text-red-500">*</span>
                </label>
                <Input
                  type="date"
                  name="periodEnd"
                  value={formData.periodEnd}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-2">
                <strong>Note:</strong> Leave user and location empty to set a company-wide goal.
              </p>
            </div>

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={loading}>
                {loading ? 'Creating...' : 'Create Goal'}
              </Button>
            </div>
          </form>
        )}
      </div>

      {/* Goals List */}
      <div className="bg-white shadow rounded-lg p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Active Goals</h4>

        {goals.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p>No goals set yet. Create your first goal to get started!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {goals.map((goal) => (
              <div
                key={goal.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h5 className="font-semibold text-gray-900 mb-1">
                      {getGoalTypeLabel(goal.goalType)}
                    </h5>
                    <p className="text-2xl font-bold text-indigo-600">
                      {formatGoalValue(goal.goalType, goal.targetValue)}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(goal.id)}
                    className="text-red-600 hover:text-red-800 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>

                <div className="text-sm text-gray-600 space-y-1">
                  <p>
                    <span className="font-medium">Period:</span>{' '}
                    {format(new Date(goal.periodStart), 'MMM d')} - {format(new Date(goal.periodEnd), 'MMM d, yyyy')}
                  </p>
                  {goal.user && (
                    <p>
                      <span className="font-medium">User:</span> {goal.user.firstName} {goal.user.lastName}
                    </p>
                  )}
                  {goal.location && (
                    <p>
                      <span className="font-medium">Location:</span> {goal.location.name}
                    </p>
                  )}
                  {!goal.user && !goal.location && (
                    <p className="text-indigo-600 font-medium">Company-wide Goal</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
