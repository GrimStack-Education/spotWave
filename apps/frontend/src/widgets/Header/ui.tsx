'use client';

import { UserCard } from '@/entities/User';
import { AuthByEmail } from '@/features/AuthByEmail';
import { clearAccessToken } from '@/shared/auth/store';

type HeaderProps = {
  isAuthenticated: boolean;
  userName: string;
  onAuthenticated: () => Promise<void>;
  onLogout: () => void;
};

export const Header = ({
  isAuthenticated,
  userName,
  onAuthenticated,
  onLogout,
}: HeaderProps) => {
  const logout = () => {
    clearAccessToken();
    onLogout();
  };

  return (
    <header className="flex justify-between p-4 border-b">
      <div className="font-bold">SpotWave</div>
      <div className="flex gap-4 items-center">
        {!isAuthenticated ? (
          <AuthByEmail onAuthenticated={onAuthenticated} />
        ) : (
          <button
            type="button"
            className="px-3 py-2 border rounded"
            onClick={logout}
          >
            Logout
          </button>
        )}
        <UserCard user={{ name: userName }} />
      </div>
    </header>
  );
};
