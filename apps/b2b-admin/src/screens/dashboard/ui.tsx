import { AdminSidebar } from '@/widgets/AdminSidebar';
import { UserRow } from '@/entities/User';

export const DashboardPage = () => {
  return (
    <div className="flex h-screen">
      <AdminSidebar />
      <main className="flex-1 p-8">
        <h1 className="text-3xl font-bold mb-6">B2B Dashboard</h1>
        <div className="border rounded p-4">
          <h2 className="font-semibold mb-4">Recent Users</h2>
          <UserRow user={{ name: 'Admin User' }} />
        </div>
      </main>
    </div>
  );
};
