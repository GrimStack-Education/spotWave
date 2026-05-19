import { Button } from '@/shared/ui/Button';

export const UserManagement = () => {
  return (
    <div className="flex gap-2">
      <Button>Add User</Button>
      <Button>Delete All</Button>
    </div>
  );
};
