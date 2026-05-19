export const UserRow = ({ user }: { user: any }) => {
  return <div className="p-2 border-b flex justify-between"><span>{user.name}</span><span>Admin</span></div>;
};
