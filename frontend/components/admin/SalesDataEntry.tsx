'use client';

import { useState, useEffect } from 'react';
import apiClient from '@/lib/api/client';
import toast from 'react-hot-toast';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { format } from 'date-fns';

interface Location {
  id: string;
  name: string;
  code: string;
}

interface User {
  id: string;
  firstName: string;
  lastName: string;
}

export default function SalesDataEntry() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    locationId: '',
    userId: '',
    transactionNumber: '',
    saleDate: format(new Date(), 'yyyy-MM-dd'),
    saleTime: format(new Date(), 'HH:mm'),
    totalAmount: '',
    fcpAmount: '',
    hoursWorked: '',
    customerName: '',
    notes: '',
  });

  useEffect(() => {
    fetchLocationsAndUsers();
  }, []);

  const fetchLocationsAndUsers = async () => {
    try {
      // Note: You'll need to add these endpoints to your backend
      const [locationsRes, usersRes] = await Promise.all([
        apiClient.get('/locations'),
        apiClient.get('/users'),
      ]);

      setLocations(locationsRes.data.data || []);
      setUsers(usersRes.data.data || []);
    } catch (error) {
      console.error('Failed to fetch locations/users:', error);
      // For now, use mock data if endpoints don't exist
      setLocations([
        { id: '1', name: 'Albany', code: 'ALB' },
        { id: '2', name: 'Coos Bay', code: 'CB' },
        { id: '3', name: 'Gateway', code: 'GTW' },
        { id: '4', name: 'Oakway', code: 'OAK' },
        { id: '5', name: 'I5', code: 'I5' },
        { id: '6', name: 'Roseburg', code: 'ROS' },
        { id: '7', name: 'Lebanon', code: 'LEB' },
        { id: '8', name: 'Bend', code: 'BND' },
      ]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.locationId || !formData.userId || !formData.transactionNumber || !formData.totalAmount) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const saleData = {
        locationId: formData.locationId,
        userId: formData.userId,
        transactionNumber: formData.transactionNumber,
        saleDate: formData.saleDate,
        saleTime: formData.saleTime,
        totalAmount: parseFloat(formData.totalAmount),
        fcpAmount: formData.fcpAmount ? parseFloat(formData.fcpAmount) : 0,
        hoursWorked: formData.hoursWorked ? parseFloat(formData.hoursWorked) : 0,
        customerName: formData.customerName || null,
        notes: formData.notes || null,
        items: [], // Can be extended for line items
      };

      await apiClient.post('/sales', saleData);

      toast.success('Sale recorded successfully!');

      // Reset form but keep location and user
      setFormData({
        ...formData,
        transactionNumber: '',
        totalAmount: '',
        fcpAmount: '',
        hoursWorked: '',
        customerName: '',
        notes: '',
        saleDate: format(new Date(), 'yyyy-MM-dd'),
        saleTime: format(new Date(), 'HH:mm'),
      });
    } catch (error: any) {
      console.error('Failed to create sale:', error);
      toast.error(error.response?.data?.message || 'Failed to record sale');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Record New Sale</h3>
        <p className="text-gray-600">Enter sales transaction details for accurate tracking</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location <span className="text-red-500">*</span>
            </label>
            <select
              name="locationId"
              value={formData.locationId}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              required
            >
              <option value="">Select a location...</option>
              {locations.map((location) => (
                <option key={location.id} value={location.id}>
                  {location.name} ({location.code})
                </option>
              ))}
            </select>
          </div>

          {/* Salesperson */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Salesperson <span className="text-red-500">*</span>
            </label>
            <select
              name="userId"
              value={formData.userId}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              required
            >
              <option value="">Select a salesperson...</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.firstName} {user.lastName}
                </option>
              ))}
            </select>
          </div>

          {/* Transaction Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Transaction # <span className="text-red-500">*</span>
            </label>
            <Input
              type="text"
              name="transactionNumber"
              value={formData.transactionNumber}
              onChange={handleChange}
              placeholder="e.g., TXN-001"
              required
            />
          </div>

          {/* Customer Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Customer Name
            </label>
            <Input
              type="text"
              name="customerName"
              value={formData.customerName}
              onChange={handleChange}
              placeholder="John Doe"
            />
          </div>

          {/* Sale Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sale Date <span className="text-red-500">*</span>
            </label>
            <Input
              type="date"
              name="saleDate"
              value={formData.saleDate}
              onChange={handleChange}
              required
            />
          </div>

          {/* Sale Time */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sale Time
            </label>
            <Input
              type="time"
              name="saleTime"
              value={formData.saleTime}
              onChange={handleChange}
            />
          </div>

          {/* Total Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Total Sale Amount ($) <span className="text-red-500">*</span>
            </label>
            <Input
              type="number"
              step="0.01"
              name="totalAmount"
              value={formData.totalAmount}
              onChange={handleChange}
              placeholder="0.00"
              required
            />
          </div>

          {/* FCP Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              FCP Amount ($)
            </label>
            <Input
              type="number"
              step="0.01"
              name="fcpAmount"
              value={formData.fcpAmount}
              onChange={handleChange}
              placeholder="0.00"
            />
            {formData.totalAmount && formData.fcpAmount && (
              <p className="mt-1 text-sm text-gray-500">
                FCP Percentage: {((parseFloat(formData.fcpAmount) / parseFloat(formData.totalAmount)) * 100).toFixed(1)}%
              </p>
            )}
          </div>

          {/* Hours Worked */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hours Worked
            </label>
            <Input
              type="number"
              step="0.25"
              name="hoursWorked"
              value={formData.hoursWorked}
              onChange={handleChange}
              placeholder="8.0"
            />
            {formData.totalAmount && formData.hoursWorked && (
              <p className="mt-1 text-sm text-gray-500">
                Sales/Hour: ${(parseFloat(formData.totalAmount) / parseFloat(formData.hoursWorked)).toFixed(2)}
              </p>
            )}
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notes
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Additional notes about this sale..."
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              setFormData({
                locationId: '',
                userId: '',
                transactionNumber: '',
                saleDate: format(new Date(), 'yyyy-MM-dd'),
                saleTime: format(new Date(), 'HH:mm'),
                totalAmount: '',
                fcpAmount: '',
                hoursWorked: '',
                customerName: '',
                notes: '',
              });
            }}
          >
            Clear Form
          </Button>
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? 'Recording...' : 'Record Sale'}
          </Button>
        </div>
      </form>
    </div>
  );
}
