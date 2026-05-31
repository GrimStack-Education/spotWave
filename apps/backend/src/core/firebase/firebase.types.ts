import { GeoPoint, Timestamp } from 'firebase-admin/firestore';

export type FirebaseAdminConfig = {
  projectId?: string;
  clientEmail?: string;
  privateKey?: string;
  credentialsPath?: string;
};

export type FirebaseUserStatus = 'online' | 'offline' | 'busy' | 'away';
export type FirebaseEventStatus =
  | 'draft'
  | 'active'
  | 'full'
  | 'cancelled'
  | 'finished';

export interface FirebaseUserDocument {
  displayName: string;
  avatarUrl?: string;
  bio?: string;
  interests?: string[];
  status: FirebaseUserStatus;
  settings?: Record<string, unknown>;
}

export interface FirebaseEventDocument {
  title: string;
  description?: string | null;
  creatorId: string;
  categoryId?: string | null;
  venueId?: string | null;
  location?: {
    geo?: GeoPoint;
    address?: string | null;
  };
  startTime: Timestamp;
  endTime?: Timestamp | null;
  status: FirebaseEventStatus;
  participantsCount: number;
}

export interface FirebaseChatDocument {
  lastMessage?: string;
  lastTimestamp?: Timestamp;
}

export interface FirebaseChatMessageDocument {
  text: string;
  senderId: string;
  createdAt: Timestamp;
}

export interface FirebaseEventParticipantDocument {
  role: 'HOST' | 'MEMBER';
  status: 'JOINED' | 'WAITLIST' | 'LEFT';
  joinedAt: Timestamp;
}

export interface FirebaseNotificationDocument {
  type: string;
  title: string;
  body: string;
  readAt?: Timestamp | null;
  meta?: Record<string, unknown> | null;
  createdAt: Timestamp;
}

export interface FirebasePresenceDocument {
  status: FirebaseUserStatus;
  updatedAt: Timestamp;
}

export interface FirebaseCommunityLiveDocument {
  activeMemberIds?: string[];
  pinnedIds?: string[];
  updatedAt?: Timestamp;
}

export interface FirebaseReadReceiptDocument {
  lastReadAt?: Timestamp;
  messageId?: string;
}
