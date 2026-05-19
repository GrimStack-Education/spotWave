type UserCardProps = {
  user: {
    name?: string;
  };
};

export const UserCard = ({ user }: UserCardProps) => {
  return <div className="p-4 border rounded">User: {user.name}</div>;
};
