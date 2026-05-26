'use client';

import { apiRequest } from '@/shared/api/client';
import { getAccessToken } from '@/shared/auth/store';
import { Header } from '@/widgets/Header';
import { useEffect, useState } from 'react';

type MeResponse = {
  id: string;
  email: string;
  role: string;
  profile?: {
    displayName?: string | null;
    avatarUrl?: string | null;
    bio?: string | null;
    homeLat?: number | null;
    homeLng?: number | null;
    radiusKm?: number | null;
  } | null;
};

type Tag = {
  id: string;
  slug: string;
  name: string;
};

type EventListResponse = {
  items: EventItem[];
  total: number;
  limit: number;
  offset: number;
};

type EventItem = {
  id: string;
  title: string;
  description: string | null;
  startsAt: string;
  endsAt: string | null;
  status: 'DRAFT' | 'ACTIVE' | 'CANCELLED' | 'FINISHED';
  visibility: 'PUBLIC' | 'NEIGHBORHOOD' | 'PRIVATE';
  capacity: number | null;
  lat: number;
  lng: number;
  addressText: string | null;
  distanceKm: number | null;
  creator: {
    id: string;
    email: string;
    role: string;
    displayName: string | null;
    avatarUrl: string | null;
  };
  tags: Tag[];
  participants: {
    joinedCount: number;
    waitlistCount: number;
    items: Array<{
      userId: string;
      role: 'HOST' | 'MEMBER';
      status: 'JOINED' | 'WAITLIST' | 'LEFT';
      joinedAt: string;
    }>;
  };
};

type CreateEventPayload = {
  title: string;
  description?: string;
  startsAt: string;
  endsAt?: string;
  visibility?: 'PUBLIC' | 'NEIGHBORHOOD' | 'PRIVATE';
  capacity?: number;
  lat: number;
  lng: number;
  addressText?: string;
  tagIds?: string[];
};

const DEFAULT_EVENT_FORM = {
  title: '',
  description: '',
  startsAt: '',
  endsAt: '',
  visibility: 'NEIGHBORHOOD' as const,
  capacity: '5',
  lat: '43.2389',
  lng: '76.8897',
  addressText: '',
};

function formatDate(value: string | null) {
  if (!value) return 'Not specified';
  return new Date(value).toLocaleString();
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

export const HomePage = () => {
  const [user, setUser] = useState<MeResponse | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [pageError, setPageError] = useState<string | null>(null);
  const [tags, setTags] = useState<Tag[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);
  const [selectedTagId, setSelectedTagId] = useState('');
  const [selectedEventId, setSelectedEventId] = useState('');
  const [eventMessage, setEventMessage] = useState<string | null>(null);
  const [eventError, setEventError] = useState<string | null>(null);
  const [reportError, setReportError] = useState<string | null>(null);
  const [reportMessage, setReportMessage] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState('');
  const [createError, setCreateError] = useState<string | null>(null);
  const [createMessage, setCreateMessage] = useState<string | null>(null);
  const [isSubmittingCreate, setIsSubmittingCreate] = useState(false);
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const [eventForm, setEventForm] = useState(DEFAULT_EVENT_FORM);

  const trimmedReason = reportReason.trim();
  const token = getAccessToken();
  const selectedEvent =
    events.find((event) => event.id === selectedEventId) ?? null;

  const loadMe = async () => {
    const accessToken = getAccessToken();
    if (!accessToken) {
      setUser(null);
      setAuthError(null);
      return;
    }

    try {
      const me = await apiRequest<MeResponse>('/auth/me', {
        headers: { authorization: `Bearer ${accessToken}` },
      });
      setUser(me);
      setAuthError(null);
    } catch (error) {
      setUser(null);
      setAuthError(
        error instanceof Error ? error.message : 'Failed to fetch profile',
      );
    }
  };

  const loadTags = async () => {
    const data = await apiRequest<Tag[]>('/tags');
    setTags(data);
  };

  const loadEvents = async () => {
    setIsLoadingEvents(true);
    setPageError(null);

    try {
      const data = await apiRequest<EventListResponse>('/events');
      setEvents(data.items);
      setSelectedEventId((currentValue) => {
        if (currentValue && data.items.some((item) => item.id === currentValue)) {
          return currentValue;
        }

        return data.items[0]?.id ?? '';
      });
    } catch (error) {
      setPageError(
        error instanceof Error ? error.message : 'Failed to load events',
      );
    } finally {
      setIsLoadingEvents(false);
    }
  };

  useEffect(() => {
    void loadMe();
    void loadTags();
    void loadEvents();
  }, []);

  const refreshAll = async () => {
    await Promise.all([loadMe(), loadTags(), loadEvents()]);
  };

  const updateEventForm = (
    field: keyof typeof DEFAULT_EVENT_FORM,
    value: string,
  ) => {
    setEventForm((currentState) => ({
      ...currentState,
      [field]: value,
    }));
  };

  const submitCreateEvent = async () => {
    if (!token) {
      setCreateError('Login is required to create an event');
      return;
    }

    setCreateError(null);
    setCreateMessage(null);
    setIsSubmittingCreate(true);

    try {
      const payload: CreateEventPayload = {
        title: eventForm.title.trim(),
        description: eventForm.description.trim() || undefined,
        startsAt: new Date(eventForm.startsAt).toISOString(),
        endsAt: eventForm.endsAt
          ? new Date(eventForm.endsAt).toISOString()
          : undefined,
        visibility: eventForm.visibility,
        capacity: eventForm.capacity ? Number(eventForm.capacity) : undefined,
        lat: Number(eventForm.lat),
        lng: Number(eventForm.lng),
        addressText: eventForm.addressText.trim() || undefined,
        tagIds: selectedTagId ? [selectedTagId] : undefined,
      };

      const createdEvent = await apiRequest<EventItem>('/events', {
        method: 'POST',
        headers: { authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });

      setCreateMessage(`Event "${createdEvent.title}" created`);
      setEventForm(DEFAULT_EVENT_FORM);
      setSelectedEventId(createdEvent.id);
      await loadEvents();
    } catch (error) {
      setCreateError(
        error instanceof Error ? error.message : 'Failed to create event',
      );
    } finally {
      setIsSubmittingCreate(false);
    }
  };

  const joinEvent = async (eventId: string) => {
    if (!token) {
      setEventError('Login is required to join an event');
      return;
    }

    setEventError(null);
    setEventMessage(null);

    try {
      const response = await apiRequest<{
        status: 'JOINED' | 'WAITLIST' | 'LEFT';
      }>(`/events/${eventId}/join`, {
        method: 'POST',
        headers: { authorization: `Bearer ${token}` },
      });

      setEventMessage(`Join request completed with status: ${response.status}`);
      await loadEvents();
    } catch (error) {
      setEventError(error instanceof Error ? error.message : 'Failed to join event');
    }
  };

  const leaveEvent = async (eventId: string) => {
    if (!token) {
      setEventError('Login is required to leave an event');
      return;
    }

    setEventError(null);
    setEventMessage(null);

    try {
      await apiRequest(`/events/${eventId}/leave`, {
        method: 'POST',
        headers: { authorization: `Bearer ${token}` },
      });
      setEventMessage('You left the event');
      await loadEvents();
    } catch (error) {
      setEventError(
        error instanceof Error ? error.message : 'Failed to leave event',
      );
    }
  };

  const cancelEvent = async (eventId: string) => {
    if (!token) {
      setEventError('Login is required to cancel an event');
      return;
    }

    setEventError(null);
    setEventMessage(null);

    try {
      await apiRequest(`/events/${eventId}`, {
        method: 'DELETE',
        headers: { authorization: `Bearer ${token}` },
      });
      setEventMessage('Event cancelled');
      await loadEvents();
    } catch (error) {
      setEventError(
        error instanceof Error ? error.message : 'Failed to cancel event',
      );
    }
  };

  const submitReport = async () => {
    if (!token) {
      setReportError('Login is required');
      return;
    }

    if (!selectedEventId || !isUuid(selectedEventId)) {
      setReportError('Select a valid event to report');
      return;
    }

    if (trimmedReason.length < 5) {
      setReportError('Reason must be at least 5 characters long');
      return;
    }

    setReportError(null);
    setReportMessage(null);
    setIsSubmittingReport(true);

    try {
      await apiRequest('/reports', {
        method: 'POST',
        headers: { authorization: `Bearer ${token}` },
        body: JSON.stringify({
          targetType: 'EVENT',
          targetId: selectedEventId,
          reason: trimmedReason,
        }),
      });
      setReportMessage('Report submitted');
      setReportReason('');
    } catch (error) {
      setReportError(
        error instanceof Error ? error.message : 'Failed to submit report',
      );
    } finally {
      setIsSubmittingReport(false);
    }
  };

  const isCurrentUserCreator =
    user && selectedEvent ? selectedEvent.creator.id === user.id : false;

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-50">
      <Header
        isAuthenticated={Boolean(user)}
        userName={user?.email ?? 'Guest'}
        onAuthenticated={async () => {
          await loadMe();
          await loadEvents();
        }}
        onLogout={() => {
          setUser(null);
          setAuthError(null);
          setEventError(null);
          setEventMessage(null);
          setReportError(null);
          setReportMessage(null);
        }}
      />

      <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6">
        <section className="grid gap-4 rounded-2xl border border-neutral-800 bg-neutral-900/70 p-5 lg:grid-cols-[1.6fr_1fr]">
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.2em] text-cyan-400">
              Backend smoke UI
            </p>
            <h1 className="text-3xl font-semibold">Manual verification workspace</h1>
            <p className="max-w-2xl text-sm text-neutral-300">
              This page is intentionally minimal. It exists so you can log in,
              create events, join or leave them, and submit a report without
              manually crafting requests.
            </p>
          </div>

          <div className="grid gap-3 rounded-xl border border-neutral-800 bg-black/30 p-4 text-sm">
            <div>
              <p className="text-neutral-400">Backend</p>
              <p className="font-mono text-cyan-300">http://localhost:3333</p>
            </div>
            <div>
              <p className="text-neutral-400">Signed in as</p>
              <p>{user?.email ?? 'Guest'}</p>
            </div>
            {user ? (
              <div>
                <p className="text-neutral-400">User ID</p>
                <p className="break-all font-mono text-xs">{user.id}</p>
              </div>
            ) : null}
            <button
              type="button"
              className="rounded-lg border border-neutral-700 px-3 py-2 text-left hover:bg-neutral-800"
              onClick={() => {
                void refreshAll();
              }}
            >
              Refresh events, tags and profile
            </button>
          </div>
        </section>

        {authError ? (
          <p className="rounded-xl border border-red-700 bg-red-950/40 px-4 py-3 text-sm text-red-300">
            {authError}
          </p>
        ) : null}

        {pageError ? (
          <p className="rounded-xl border border-red-700 bg-red-950/40 px-4 py-3 text-sm text-red-300">
            {pageError}
          </p>
        ) : null}

        <section className="grid gap-6 lg:grid-cols-[1.35fr_0.95fr]">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Events</h2>
                <p className="text-sm text-neutral-400">
                  Public backend listing for nearby and active events.
                </p>
              </div>
              <span className="rounded-full border border-neutral-700 px-3 py-1 text-xs text-neutral-300">
                {isLoadingEvents ? 'Loading...' : `${events.length} loaded`}
              </span>
            </div>

            <div className="grid gap-4">
              {events.map((event) => {
                const isSelected = event.id === selectedEventId;
                const currentParticipation = user
                  ? event.participants.items.find(
                      (participant) => participant.userId === user.id,
                    )
                  : null;

                return (
                  <article
                    key={event.id}
                    className={`rounded-2xl border p-4 transition ${
                      isSelected
                        ? 'border-cyan-500 bg-cyan-950/20'
                        : 'border-neutral-800 bg-neutral-900/80'
                    }`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-lg font-semibold">{event.title}</h3>
                          <span className="rounded-full border border-neutral-700 px-2 py-0.5 text-xs text-neutral-300">
                            {event.status}
                          </span>
                          <span className="rounded-full border border-neutral-700 px-2 py-0.5 text-xs text-neutral-300">
                            {event.visibility}
                          </span>
                        </div>
                        <p className="text-sm text-neutral-400">
                          {event.description || 'No description'}
                        </p>
                        <p className="break-all font-mono text-xs text-neutral-500">
                          {event.id}
                        </p>
                      </div>

                      <button
                        type="button"
                        className="rounded-lg border border-neutral-700 px-3 py-2 text-sm hover:bg-neutral-800"
                        onClick={() => setSelectedEventId(event.id)}
                      >
                        {isSelected ? 'Selected' : 'Select'}
                      </button>
                    </div>

                    <div className="mt-4 grid gap-2 text-sm text-neutral-300 md:grid-cols-2">
                      <p>Starts: {formatDate(event.startsAt)}</p>
                      <p>Ends: {formatDate(event.endsAt)}</p>
                      <p>
                        Host:{' '}
                        {event.creator.displayName || event.creator.email}
                      </p>
                      <p>
                        Capacity: {event.capacity ?? 'Unlimited'} | Joined:{' '}
                        {event.participants.joinedCount} | Waitlist:{' '}
                        {event.participants.waitlistCount}
                      </p>
                      <p>Address: {event.addressText || 'Not specified'}</p>
                      <p>
                        Distance:{' '}
                        {event.distanceKm !== null
                          ? `${event.distanceKm} km`
                          : 'Not requested'}
                      </p>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {event.tags.map((tag) => (
                        <span
                          key={tag.id}
                          className="rounded-full bg-neutral-800 px-2 py-1 text-xs text-cyan-200"
                        >
                          {tag.name}
                        </span>
                      ))}
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        type="button"
                        className="rounded-lg border border-cyan-700 px-3 py-2 text-sm text-cyan-200 hover:bg-cyan-950/40"
                        onClick={() => {
                          setSelectedEventId(event.id);
                          setReportMessage(null);
                          setReportError(null);
                        }}
                      >
                        Report this event
                      </button>
                      <button
                        type="button"
                        className="rounded-lg border border-neutral-700 px-3 py-2 text-sm hover:bg-neutral-800"
                        onClick={() => {
                          void joinEvent(event.id);
                        }}
                      >
                        Join
                      </button>
                      <button
                        type="button"
                        className="rounded-lg border border-neutral-700 px-3 py-2 text-sm hover:bg-neutral-800"
                        onClick={() => {
                          void leaveEvent(event.id);
                        }}
                      >
                        Leave
                      </button>
                      {isCurrentUserCreator && isSelected ? (
                        <button
                          type="button"
                          className="rounded-lg border border-red-700 px-3 py-2 text-sm text-red-200 hover:bg-red-950/40"
                          onClick={() => {
                            void cancelEvent(event.id);
                          }}
                        >
                          Cancel event
                        </button>
                      ) : null}
                    </div>

                    {currentParticipation ? (
                      <p className="mt-3 text-xs text-neutral-400">
                        Your status: {currentParticipation.status}
                      </p>
                    ) : null}
                  </article>
                );
              })}

              {!isLoadingEvents && events.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-neutral-700 px-4 py-8 text-center text-neutral-400">
                  No events found. Log in and create the first one.
                </div>
              ) : null}
            </div>
          </div>

          <div className="space-y-4">
            <section className="rounded-2xl border border-neutral-800 bg-neutral-900/80 p-4">
              <h2 className="text-lg font-semibold">Create event</h2>
              <p className="mt-1 text-sm text-neutral-400">
                Minimal event form for testing `POST /events`.
              </p>
              <div className="mt-4 grid gap-3">
                <input
                  className="rounded-lg border border-neutral-700 bg-black/20 p-2"
                  placeholder="Title"
                  value={eventForm.title}
                  onChange={(event) =>
                    updateEventForm('title', event.target.value)
                  }
                />
                <textarea
                  className="rounded-lg border border-neutral-700 bg-black/20 p-2"
                  placeholder="Description"
                  value={eventForm.description}
                  onChange={(event) =>
                    updateEventForm('description', event.target.value)
                  }
                />
                <div className="grid gap-3 md:grid-cols-2">
                  <input
                    type="datetime-local"
                    className="rounded-lg border border-neutral-700 bg-black/20 p-2"
                    value={eventForm.startsAt}
                    onChange={(event) =>
                      updateEventForm('startsAt', event.target.value)
                    }
                  />
                  <input
                    type="datetime-local"
                    className="rounded-lg border border-neutral-700 bg-black/20 p-2"
                    value={eventForm.endsAt}
                    onChange={(event) =>
                      updateEventForm('endsAt', event.target.value)
                    }
                  />
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <input
                    className="rounded-lg border border-neutral-700 bg-black/20 p-2"
                    placeholder="Latitude"
                    value={eventForm.lat}
                    onChange={(event) => updateEventForm('lat', event.target.value)}
                  />
                  <input
                    className="rounded-lg border border-neutral-700 bg-black/20 p-2"
                    placeholder="Longitude"
                    value={eventForm.lng}
                    onChange={(event) => updateEventForm('lng', event.target.value)}
                  />
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <input
                    className="rounded-lg border border-neutral-700 bg-black/20 p-2"
                    placeholder="Capacity"
                    value={eventForm.capacity}
                    onChange={(event) =>
                      updateEventForm('capacity', event.target.value)
                    }
                  />
                  <select
                    className="rounded-lg border border-neutral-700 bg-black/20 p-2"
                    value={eventForm.visibility}
                    onChange={(event) =>
                      updateEventForm(
                        'visibility',
                        event.target.value as typeof eventForm.visibility,
                      )
                    }
                  >
                    <option value="PUBLIC">PUBLIC</option>
                    <option value="NEIGHBORHOOD">NEIGHBORHOOD</option>
                    <option value="PRIVATE">PRIVATE</option>
                  </select>
                </div>
                <input
                  className="rounded-lg border border-neutral-700 bg-black/20 p-2"
                  placeholder="Address"
                  value={eventForm.addressText}
                  onChange={(event) =>
                    updateEventForm('addressText', event.target.value)
                  }
                />
                <select
                  className="rounded-lg border border-neutral-700 bg-black/20 p-2"
                  value={selectedTagId}
                  onChange={(event) => setSelectedTagId(event.target.value)}
                >
                  <option value="">No tag</option>
                  {tags.map((tag) => (
                    <option key={tag.id} value={tag.id}>
                      {tag.name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className="rounded-lg border border-neutral-700 px-3 py-2 text-left hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={isSubmittingCreate || !eventForm.title.trim()}
                  onClick={() => {
                    void submitCreateEvent();
                  }}
                >
                  {isSubmittingCreate ? 'Creating event...' : 'Create event'}
                </button>
              </div>
              {createError ? (
                <p className="mt-3 text-sm text-red-400">{createError}</p>
              ) : null}
              {createMessage ? (
                <p className="mt-3 text-sm text-green-400">{createMessage}</p>
              ) : null}
            </section>

            <section className="rounded-2xl border border-neutral-800 bg-neutral-900/80 p-4">
              <h2 className="text-lg font-semibold">Report selected event</h2>
              <p className="mt-1 text-sm text-neutral-400">
                Uses the selected event card, so you do not need to paste UUIDs
                manually.
              </p>

              <div className="mt-4 rounded-xl border border-neutral-800 bg-black/20 p-3 text-sm">
                <p className="text-neutral-400">Selected event</p>
                <p className="mt-1 font-medium">
                  {selectedEvent?.title ?? 'No event selected'}
                </p>
                <p className="mt-1 break-all font-mono text-xs text-neutral-500">
                  {selectedEvent?.id ?? '—'}
                </p>
              </div>

              <textarea
                className="mt-4 min-h-28 w-full rounded-lg border border-neutral-700 bg-black/20 p-2"
                placeholder="Reason (min 5 chars)"
                value={reportReason}
                onChange={(event) => setReportReason(event.target.value)}
              />

              <button
                type="button"
                className="mt-3 rounded-lg border border-neutral-700 px-3 py-2 hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={isSubmittingReport || !selectedEventId}
                onClick={() => {
                  void submitReport();
                }}
              >
                {isSubmittingReport ? 'Sending report...' : 'Send report'}
              </button>

              {reportError ? (
                <p className="mt-3 text-sm text-red-400">{reportError}</p>
              ) : null}
              {reportMessage ? (
                <p className="mt-3 text-sm text-green-400">{reportMessage}</p>
              ) : null}
            </section>

            <section className="rounded-2xl border border-neutral-800 bg-neutral-900/80 p-4">
              <h2 className="text-lg font-semibold">Quick hints</h2>
              <ul className="mt-3 space-y-2 text-sm text-neutral-300">
                <li>Log in with `guest@spotwave.local` / `password123`.</li>
                <li>Create a new event, then use Join or Leave on any card.</li>
                <li>Select an event card first, then send a report.</li>
                <li>
                  The selected event ID is shown automatically, so you no longer
                  need to paste UUIDs by hand.
                </li>
              </ul>
            </section>

            {eventError ? (
              <p className="rounded-xl border border-red-700 bg-red-950/40 px-4 py-3 text-sm text-red-300">
                {eventError}
              </p>
            ) : null}
            {eventMessage ? (
              <p className="rounded-xl border border-emerald-700 bg-emerald-950/40 px-4 py-3 text-sm text-emerald-300">
                {eventMessage}
              </p>
            ) : null}
          </div>
        </section>
      </main>
    </div>
  );
};
