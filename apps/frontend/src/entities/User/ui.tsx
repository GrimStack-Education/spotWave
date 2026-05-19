import { User } from '@/shared/types'; // Assuming types exist

export const UserCard = ({ user }: { user: any }) => {
  return <div className="p-4 border rounded">User: {user.name}</div>;
};
