import { Injectable } from '@nestjs/common';
import {
  Event,
  EventChatMessage,
  EventParticipant,
  Interest,
  Notification,
  Profile,
  Prisma,
  User,
} from '@spotwave/database';
import { GeoPoint, Timestamp } from 'firebase-admin/firestore';
import {
  FirebaseChatDocument,
  FirebaseChatMessageDocument,
  FirebaseEventDocument,
  FirebaseEventParticipantDocument,
  FirebaseNotificationDocument,
  FirebaseUserDocument,
} from './firebase.types';

export type UserWithProfileAndInterests = User & {
  profile: Profile | null;
  interests: Array<{ interest: Interest }>;
};

export type EventParticipantWithUser = EventParticipant & {
  user: User;
};

export type EventChatMessageWithUser = EventChatMessage & {
  user: User;
};

export type EventWithRelations = Event & {
  creator: User;
  participants: EventParticipantWithUser[];
  chatMessages: EventChatMessageWithUser[];
};

export type NotificationWithUser = Notification & {
  user: User;
};

@Injectable()
export class FirestoreMapper {
  mapUser(user: UserWithProfileAndInterests): FirebaseUserDocument {
    const displayName =
      user.displayName ??
      user.profile?.displayName ??
      user.email.split('@')[0] ??
      'SpotWave User';

    return {
      displayName,
      avatarUrl: user.avatarUrl ?? user.profile?.avatarUrl ?? undefined,
      bio: user.bio ?? user.profile?.bio ?? undefined,
      interests: user.interests.length
        ? user.interests.map((item) => item.interest.slug)
        : undefined,
      status: 'offline',
      settings: {},
    };
  }

  mapEvent(
    event: EventWithRelations,
    creatorFirebaseUid: string,
  ): FirebaseEventDocument {
    return {
      title: event.title,
      description: event.description,
      creatorId: creatorFirebaseUid,
      categoryId: null,
      venueId: null,
      location: this.mapLocation(event),
      startTime: Timestamp.fromDate(event.startsAt),
      endTime: event.endsAt ? Timestamp.fromDate(event.endsAt) : null,
      status: this.mapEventStatus(event.status),
      participantsCount: this.countJoinedParticipants(event.participants),
    };
  }

  mapEventParticipant(
    participant: EventParticipant,
  ): FirebaseEventParticipantDocument {
    return {
      role: participant.role,
      status: participant.status,
      joinedAt: Timestamp.fromDate(participant.joinedAt),
    };
  }

  mapChatMetadata(messages: EventChatMessage[]): FirebaseChatDocument | null {
    if (!messages.length) {
      return null;
    }

    const latest = messages.reduce((current, item) =>
      item.createdAt > current.createdAt ? item : current,
    );

    return {
      lastMessage: latest.message,
      lastTimestamp: Timestamp.fromDate(latest.createdAt),
    };
  }

  mapChatMessage(
    message: EventChatMessage,
    senderFirebaseUid: string,
  ): FirebaseChatMessageDocument {
    return {
      text: message.message,
      senderId: senderFirebaseUid,
      createdAt: Timestamp.fromDate(message.createdAt),
    };
  }

  mapNotification(notification: Notification): FirebaseNotificationDocument {
    return {
      type: notification.type,
      title: notification.title,
      body: notification.body,
      readAt: notification.readAt
        ? Timestamp.fromDate(notification.readAt)
        : null,
      meta: this.normalizeMeta(notification.meta),
      createdAt: Timestamp.fromDate(notification.createdAt),
    };
  }

  private mapEventStatus(
    status: Event['status'],
  ): FirebaseEventDocument['status'] {
    switch (status) {
      case 'DRAFT':
        return 'draft';
      case 'CANCELLED':
        return 'cancelled';
      case 'FINISHED':
        return 'finished';
      case 'ACTIVE':
      default:
        return 'active';
    }
  }

  private countJoinedParticipants(participants: EventParticipant[]): number {
    return participants.filter((participant) => participant.status === 'JOINED')
      .length;
  }

  private mapLocation(
    event: Event,
  ): FirebaseEventDocument['location'] | undefined {
    const lat = this.toNumber(event.lat);
    const lng = this.toNumber(event.lng);

    if (lat === null || lng === null) {
      return undefined;
    }

    return {
      geo: new GeoPoint(lat, lng),
      address: event.addressText ?? null,
    };
  }

  private toNumber(value: Prisma.Decimal | null): number | null {
    if (value === null) {
      return null;
    }

    const numeric = Number(value);

    return Number.isFinite(numeric) ? numeric : null;
  }

  private normalizeMeta(
    value: Notification['meta'],
  ): Record<string, unknown> | null {
    if (!value) {
      return null;
    }

    if (typeof value === 'object' && !Array.isArray(value)) {
      return value as Record<string, unknown>;
    }

    return { value };
  }
}
