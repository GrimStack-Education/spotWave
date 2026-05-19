type UserRowProps = {
  user: {
    name?: string;
  };
};

export const UserRow = ({ user }: UserRowProps) => {
  return (
    <div className="flex justify-between border-b p-2">
      <span>{user.name}</span>
      <span>Admin</span>
    </div>
  );
};
