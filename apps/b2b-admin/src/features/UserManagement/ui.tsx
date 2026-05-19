import { Button } from '@/shared/ui/Button';

export const UserManagement = () => {
  return (
    <div className="flex gap-2">
      <Button color="secondary">Add User</Button>
      <Button color="danger">Delete All</Button>
    </div>
  );
};
