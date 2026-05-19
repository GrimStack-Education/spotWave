import { UserManagement } from '@/features/UserManagement';

export const AdminSidebar = () => {
  return (
    <aside className="w-64 h-full border-r p-4 flex flex-col gap-4">
      <div className="font-bold text-xl">Admin Panel</div>
      <nav className="flex flex-col gap-2">
        <a href="#" className="p-2 hover:bg-gray-100 rounded">
          Dashboard
        </a>
        <a href="#" className="p-2 hover:bg-gray-100 rounded">
          Users
        </a>
      </nav>
      <div className="mt-auto border-t pt-4">
        <UserManagement />
      </div>
    </aside>
  );
};
