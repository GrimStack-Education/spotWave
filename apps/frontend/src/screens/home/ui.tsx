'use client';

import { apiRequest } from '@/shared/api/client';
import { getAccessToken } from '@/shared/auth/store';
import { Header } from '@/widgets/Header';
import { useEffect, useState } from 'react';

type MeResponse = {
  id: string;
  email: string;
  role: string;
};

export const HomePage = () => {
  const [user, setUser] = useState<MeResponse | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [reportError, setReportError] = useState<string | null>(null);
  const [reportTargetId, setReportTargetId] = useState('');
  const [reportReason, setReportReason] = useState('');
  const [reportMessage, setReportMessage] = useState<string | null>(null);

  const loadMe = async () => {
    const token = getAccessToken();
    if (!token) {
      setUser(null);
      setAuthError(null);
      return;
    }

    try {
      const me = await apiRequest<MeResponse>('/auth/me', {
        headers: { authorization: `Bearer ${token}` },
      });
      setUser(me);
      setAuthError(null);
    } catch (e) {
      setUser(null);
      setAuthError(e instanceof Error ? e.message : 'Failed to fetch profile');
    }
  };

  useEffect(() => {
    void loadMe();
  }, []);

  const submitReport = async () => {
    const token = getAccessToken();
    if (!token) {
      setReportError('Login is required');
      return;
    }

    setReportError(null);
    setReportMessage(null);

    try {
      await apiRequest('/reports', {
        method: 'POST',
        headers: { authorization: `Bearer ${token}` },
        body: JSON.stringify({
          targetType: 'EVENT',
          targetEventId: reportTargetId,
          reason: reportReason,
        }),
      });
      setReportMessage('Report submitted');
      setReportReason('');
      setReportTargetId('');
    } catch (e) {
      setReportError(e instanceof Error ? e.message : 'Failed to submit report');
    }
  };

  return (
    <div>
      <Header
        isAuthenticated={Boolean(user)}
        userName={user?.email ?? 'Guest'}
        onAuthenticated={loadMe}
        onLogout={() => {
          setUser(null);
          setAuthError(null);
        }}
      />
      <main className="p-8">
        <h1>Welcome to SpotWave</h1>
        {authError ? <p className="text-red-600 mt-2">{authError}</p> : null}

        {user ? (
          <section className="mt-6 p-4 border rounded max-w-xl">
            <h2 className="font-semibold mb-3">Create Report (Protected)</h2>
            <div className="flex flex-col gap-2">
              <input
                className="border p-2"
                placeholder="Target event id (UUID)"
                value={reportTargetId}
                onChange={(e) => setReportTargetId(e.target.value)}
              />
              <textarea
                className="border p-2"
                placeholder="Reason"
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
              />
              <button
                type="button"
                className="px-3 py-2 border rounded max-w-[140px]"
                onClick={submitReport}
              >
                Send report
              </button>
            </div>
            {reportError ? <p className="text-red-600 mt-2">{reportError}</p> : null}
            {reportMessage ? (
              <p className="text-green-700 mt-2">{reportMessage}</p>
            ) : null}
          </section>
        ) : (
          <p className="mt-6 text-sm text-gray-600">
            Login or register to access protected actions.
          </p>
        )}
      </main>
    </div>
  );
};
