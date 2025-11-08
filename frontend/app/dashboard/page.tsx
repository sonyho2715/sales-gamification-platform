'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuthStore } from '@/lib/store/authStore';
import AdminDashboard from '@/components/dashboard/AdminDashboard';
import ManagerDashboard from '@/components/dashboard/ManagerDashboard';
import SalespersonDashboard from '@/components/dashboard/SalespersonDashboard';

export default function DashboardPage() {
  const { user } = useAuthStore();

  const getDashboardTitle = () => {
    switch (user?.role) {
      case 'ADMIN':
        return 'Admin Dashboard';
      case 'MANAGER':
        return 'Manager Dashboard';
      default:
        return 'My Dashboard';
    }
  };

  const renderDashboard = () => {
    switch (user?.role) {
      case 'ADMIN':
        return <AdminDashboard />;
      case 'MANAGER':
        return <ManagerDashboard />;
      default:
        return <SalespersonDashboard />;
    }
  };

  return (
    <DashboardLayout title={getDashboardTitle()}>
      {renderDashboard()}
    </DashboardLayout>
  );
}
