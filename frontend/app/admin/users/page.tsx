'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import UserManagementTable from '@/components/admin/UserManagementTable';
import CreateUserModal from '@/components/admin/CreateUserModal';
import EditUserModal from '@/components/admin/EditUserModal';
import { useAuthStore } from '@/lib/store/authStore';
import Button from '@/components/ui/Button';
import { useRouter } from 'next/navigation';

export default function UsersManagementPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (user && user.role !== 'ADMIN') {
      router.push('/dashboard');
    }
  }, [user, router]);

  if (!user || user.role !== 'ADMIN') {
    return null;
  }

  const handleUserCreated = () => {
    setShowCreateModal(false);
    setRefreshKey((prev) => prev + 1); // Trigger refresh
  };

  const handleUserUpdated = () => {
    setEditingUser(null);
    setRefreshKey((prev) => prev + 1); // Trigger refresh
  };

  const handleEditUser = (user: any) => {
    setEditingUser(user);
  };

  return (
    <DashboardLayout title="User Management">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 rounded-xl shadow-2xl p-8 mb-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-4xl font-extrabold mb-2">User Management</h2>
            <p className="text-purple-100 text-lg">Manage team members, roles, and permissions</p>
          </div>
          <div className="bg-white bg-opacity-20 rounded-full p-4 backdrop-blur-sm">
            <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">Team Members</h3>
          <p className="text-gray-600 mt-1">Add, edit, or remove users from your organization</p>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:shadow-xl hover:scale-105 transition-all flex items-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Add New User</span>
        </Button>
      </div>

      {/* User Table */}
      <UserManagementTable refreshKey={refreshKey} onEditUser={handleEditUser} />

      {/* Modals */}
      {showCreateModal && (
        <CreateUserModal onClose={() => setShowCreateModal(false)} onUserCreated={handleUserCreated} />
      )}

      {editingUser && (
        <EditUserModal user={editingUser} onClose={() => setEditingUser(null)} onUserUpdated={handleUserUpdated} />
      )}
    </DashboardLayout>
  );
}
