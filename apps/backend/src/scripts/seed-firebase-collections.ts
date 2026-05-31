import 'dotenv/config';
import { Timestamp } from 'firebase-admin/firestore';
import { createFirestoreFromEnv } from '../core/firebase/firebase-admin.service';

const DEFAULT_USER_ID = 'seed-user-1';
const DEFAULT_EVENT_ID = 'seed-event-1';
const DEFAULT_CHAT_ID = 'seed-event-1';
const DEFAULT_MESSAGE_ID = 'seed-message-1';
const DEFAULT_NOTIFICATION_ID = 'seed-notification-1';
const DEFAULT_COMMUNITY_ID = 'seed-community-1';

async function seed(): Promise<void> {
  const firestore = createFirestoreFromEnv(process.env);
  const now = Timestamp.now();

  const userRef = firestore.doc(`user/${DEFAULT_USER_ID}`);
  const eventRef = firestore.doc(`event/${DEFAULT_EVENT_ID}`);
  const chatRef = firestore.doc(`chat/${DEFAULT_CHAT_ID}`);
  const messageRef = firestore.doc(
    `chat/${DEFAULT_CHAT_ID}/message/${DEFAULT_MESSAGE_ID}`,
  );
  const readRef = firestore.doc(`chat/${DEFAULT_CHAT_ID}/read/${DEFAULT_USER_ID}`);
  const participantRef = firestore.doc(
    `event/${DEFAULT_EVENT_ID}/participant/${DEFAULT_USER_ID}`,
  );
  const notificationRef = firestore.doc(
    `user/${DEFAULT_USER_ID}/notification/${DEFAULT_NOTIFICATION_ID}`,
  );
  const presenceRef = firestore.doc(`presence/${DEFAULT_USER_ID}`);
  const communityLiveRef = firestore.doc(`communityLive/${DEFAULT_COMMUNITY_ID}`);

  const batch = firestore.batch();

  batch.set(
    userRef,
    {
      displayName: 'Seed User',
      avatarUrl: null,
      bio: 'Seed profile for Firestore collections.',
      interests: ['seed'],
      status: 'offline',
      settings: {},
    },
    { merge: true },
  );

  batch.set(
    eventRef,
    {
      title: 'Seed Event',
      description: 'Seed event for Firestore collections.',
      creatorId: DEFAULT_USER_ID,
      categoryId: null,
      venueId: null,
      location: null,
      startTime: now,
      endTime: now,
      status: 'draft',
      participantsCount: 1,
    },
    { merge: true },
  );

  batch.set(
    chatRef,
    {
      lastMessage: 'Seed message',
      lastTimestamp: now,
    },
    { merge: true },
  );

  batch.set(
    messageRef,
    {
      text: 'Seed message',
      senderId: DEFAULT_USER_ID,
      createdAt: now,
    },
    { merge: true },
  );

  batch.set(
    readRef,
    {
      lastReadAt: now,
      messageId: DEFAULT_MESSAGE_ID,
    },
    { merge: true },
  );

  batch.set(
    participantRef,
    {
      role: 'HOST',
      status: 'JOINED',
      joinedAt: now,
    },
    { merge: true },
  );

  batch.set(
    notificationRef,
    {
      type: 'SYSTEM',
      title: 'Seed notification',
      body: 'Seed notification body',
      readAt: null,
      meta: { seeded: true },
      createdAt: now,
    },
    { merge: true },
  );

  batch.set(
    presenceRef,
    {
      status: 'offline',
      updatedAt: now,
    },
    { merge: true },
  );

  batch.set(
    communityLiveRef,
    {
      activeMemberIds: [DEFAULT_USER_ID],
      pinnedIds: [DEFAULT_EVENT_ID],
      updatedAt: now,
    },
    { merge: true },
  );

  await batch.commit();

  // eslint-disable-next-line no-console
  console.log('Firestore seed complete', {
    userId: DEFAULT_USER_ID,
    eventId: DEFAULT_EVENT_ID,
    chatId: DEFAULT_CHAT_ID,
    communityId: DEFAULT_COMMUNITY_ID,
  });
}

seed().catch((error) => {
  // eslint-disable-next-line no-console
  console.error('Firestore seed failed', error);
  process.exitCode = 1;
});
