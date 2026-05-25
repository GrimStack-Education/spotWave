'use client';

import { apiRequest } from '@/shared/api/client';
import { Button } from '@/shared/ui/Button';
import { clearAccessToken, setAccessToken } from '@/shared/auth/store';
import { FormEvent, useState } from 'react';

type AuthMode = 'login' | 'register';

type AuthByEmailProps = {
  onAuthenticated: () => Promise<void>;
};

export const AuthByEmail = ({ onAuthenticated }: AuthByEmailProps) => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const path = mode === 'login' ? '/auth/login' : '/auth/register';
      const data = await apiRequest<{ accessToken: string }>(path, {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      setAccessToken(data.accessToken);
      await onAuthenticated();
    } catch (e) {
      clearAccessToken();
      setError(e instanceof Error ? e.message : 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className="flex flex-col gap-2 max-w-[280px]" onSubmit={submit}>
      <div className="flex gap-2">
        <button
          type="button"
          className={`px-2 py-1 border ${mode === 'login' ? 'bg-black text-white' : ''}`}
          onClick={() => setMode('login')}
        >
          Login
        </button>
        <button
          type="button"
          className={`px-2 py-1 border ${mode === 'register' ? 'bg-black text-white' : ''}`}
          onClick={() => setMode('register')}
        >
          Register
        </button>
      </div>
      <input
        type="email"
        placeholder="Email"
        className="border p-2"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        className="border p-2"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <Button type="submit" isDisabled={isLoading}>
        {isLoading ? 'Please wait...' : mode === 'login' ? 'Login' : 'Register'}
      </Button>
      {error ? <p className="text-red-600 text-sm">{error}</p> : null}
    </form>
  );
};
