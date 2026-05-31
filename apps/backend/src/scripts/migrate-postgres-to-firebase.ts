import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import type { DocumentData, Firestore } from 'firebase-admin/firestore';
import { createFirestoreFromEnv } from '../core/firebase/firebase-admin.service';
import {
  EventWithRelations,
  FirestoreMapper,
  NotificationWithUser,
  UserWithProfileAndInterests,
} from '../core/firebase/firestore.mapper';

type FirestoreWrite = {
  path: string;
  data: DocumentData;
};

const prisma = new PrismaClient();

type MigrationStats = {
  users: number;
  events: number;
  participants: number;
  chats: number;
  messages: number;
  notifications: number;
  skippedUsers: number;
  skippedEvents: number;
  skippedParticipants: number;
  skippedMessages: number;
  skippedNotifications: number;
};

const DEFAULT_BATCH_SIZE = 400;

function parseBatchSize(value: string | undefined): number {
  const parsed = Number(value ?? DEFAULT_BATCH_SIZE);

  if (!Number.isInteger(parsed) || parsed <= 0 || parsed > 450) {
    return DEFAULT_BATCH_SIZE;
  }

  return parsed;
}

function createEmptyStats(): MigrationStats {
  return {
    users: 0,
    events: 0,
    participants: 0,
    chats: 0,
    messages: 0,
    notifications: 0,
    skippedUsers: 0,
    skippedEvents: 0,
    skippedParticipants: 0,
    skippedMessages: 0,
    skippedNotifications: 0,
  };
}

async function loadUsers(): Promise<UserWithProfileAndInterests[]> {
  return prisma.user.findMany({
    include: {
      profile: true,
      interests: {
        include: {
          interest: true,
        },
      },
    },
  });
}

async function loadEvents(): Promise<EventWithRelations[]> {
  return prisma.event.findMany({
    include: {
      creator: true,
      participants: {
        include: {
          user: true,
        },
      },
      chatMessages: {
        include: {
          user: true,
        },
        orderBy: {
          createdAt: 'asc',
        },
      },
    },
  });
}

async function loadNotifications(): Promise<NotificationWithUser[]> {
  return prisma.notification.findMany({
    include: {
      user: true,
    },
  });
}

function buildWrites(
  mapper: FirestoreMapper,
  users: UserWithProfileAndInterests[],
  events: EventWithRelations[],
  notifications: NotificationWithUser[],
): { writes: FirestoreWrite[]; stats: MigrationStats } {
  const stats = createEmptyStats();
  const writes: FirestoreWrite[] = [];
  const userIdToFirebaseUid = new Map<string, string>();

  for (const user of users) {
    if (!user.firebaseUid) {
      stats.skippedUsers += 1;
      continue;
    }

    userIdToFirebaseUid.set(user.id, user.firebaseUid);

    writes.push({
      path: `user/${user.firebaseUid}`,
      data: mapper.mapUser(user),
    });
    stats.users += 1;
  }

  for (const event of events) {
    const creatorFirebaseUid =
      userIdToFirebaseUid.get(event.creatorId) ?? event.creator.firebaseUid;

    if (!creatorFirebaseUid) {
      stats.skippedEvents += 1;
      continue;
    }

    writes.push({
      path: `event/${event.id}`,
      data: mapper.mapEvent(event, creatorFirebaseUid),
    });
    stats.events += 1;

    const chatMetadata = mapper.mapChatMetadata(event.chatMessages);
    if (chatMetadata) {
      writes.push({
        path: `chat/${event.id}`,
        data: chatMetadata,
      });
      stats.chats += 1;
    }

    for (const participant of event.participants) {
      const participantFirebaseUid =
        userIdToFirebaseUid.get(participant.userId) ??
        participant.user.firebaseUid;

      if (!participantFirebaseUid) {
        stats.skippedParticipants += 1;
        continue;
      }

      writes.push({
        path: `event/${event.id}/participant/${participantFirebaseUid}`,
        data: mapper.mapEventParticipant(participant),
      });
      stats.participants += 1;
    }

    for (const message of event.chatMessages) {
      const senderFirebaseUid =
        userIdToFirebaseUid.get(message.userId) ?? message.user.firebaseUid;

      if (!senderFirebaseUid) {
        stats.skippedMessages += 1;
        continue;
      }

      writes.push({
        path: `chat/${event.id}/message/${message.id}`,
        data: mapper.mapChatMessage(message, senderFirebaseUid),
      });
      stats.messages += 1;
    }
  }

  for (const notification of notifications) {
    const firebaseUid =
      userIdToFirebaseUid.get(notification.userId) ??
      notification.user.firebaseUid;

    if (!firebaseUid) {
      stats.skippedNotifications += 1;
      continue;
    }

    writes.push({
      path: `user/${firebaseUid}/notification/${notification.id}`,
      data: mapper.mapNotification(notification),
    });
    stats.notifications += 1;
  }

  return { writes, stats };
}

async function commitWrites(
  firestore: Firestore,
  writes: FirestoreWrite[],
  batchSize: number,
  dryRun: boolean,
): Promise<void> {
  let batch = firestore.batch();
  let operationCount = 0;

  for (const write of writes) {
    batch.set(firestore.doc(write.path), write.data, { merge: true });
    operationCount += 1;

    if (operationCount >= batchSize) {
      if (!dryRun) {
        await batch.commit();
      }
      batch = firestore.batch();
      operationCount = 0;
    }
  }

  if (operationCount > 0 && !dryRun) {
    await batch.commit();
  }
}

async function main(): Promise<void> {
  const dryRun = process.env.MIGRATION_DRY_RUN === 'true';
  const batchSize = parseBatchSize(process.env.MIGRATION_BATCH_SIZE);
  const firestore = createFirestoreFromEnv(process.env);
  const mapper = new FirestoreMapper();

  const [users, events, notifications] = await Promise.all([
    loadUsers(),
    loadEvents(),
    loadNotifications(),
  ]);

  const { writes, stats } = buildWrites(mapper, users, events, notifications);

  await commitWrites(firestore, writes, batchSize, dryRun);

  // eslint-disable-next-line no-console
  console.log('Migration complete', {
    dryRun,
    batchSize,
    writes: writes.length,
    stats,
  });
}

main()
  .catch((error) => {
    // eslint-disable-next-line no-console
    console.error('Migration failed', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
