import { UserCard } from '@/entities/User';
import { AuthByEmail } from '@/features/AuthByEmail';

export const Header = () => {
  return (
    <header className="flex justify-between p-4 border-b">
      <div className="font-bold">SpotWave</div>
      <div className="flex gap-4 items-center">
        <AuthByEmail />
        <UserCard user={{ name: 'Guest' }} />
      </div>
    </header>
  );
};
