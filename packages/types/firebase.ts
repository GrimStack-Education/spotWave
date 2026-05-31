export type FirestoreTimestamp = string;

export type FirebaseUserStatus = 'online' | 'offline' | 'busy' | 'away';
export type FirebaseEventStatus = 'draft' | 'active' | 'full' | 'cancelled' | 'finished';

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
    geo?: {
      lat: number;
      lng: number;
    };
    address?: string | null;
  };
  startTime: FirestoreTimestamp;
  endTime?: FirestoreTimestamp | null;
  status: FirebaseEventStatus;
  participantsCount: number;
}

export interface FirebaseChatDocument {
  lastMessage?: string;
  lastTimestamp?: FirestoreTimestamp;
}

export interface FirebaseChatMessageDocument {
  text: string;
  senderId: string;
  createdAt: FirestoreTimestamp;
}

export interface FirebaseEventParticipantDocument {
  role: 'HOST' | 'MEMBER';
  status: 'JOINED' | 'WAITLIST' | 'LEFT';
  joinedAt: FirestoreTimestamp;
}

export interface FirebaseNotificationDocument {
  type: string;
  title: string;
  body: string;
  readAt?: FirestoreTimestamp | null;
  meta?: Record<string, unknown> | null;
  createdAt: FirestoreTimestamp;
}

export interface FirebasePresenceDocument {
  status: FirebaseUserStatus;
  updatedAt: FirestoreTimestamp;
}

export interface FirebaseCommunityLiveDocument {
  activeMemberIds?: string[];
  pinnedIds?: string[];
  updatedAt?: FirestoreTimestamp;
}

export interface FirebaseReadReceiptDocument {
  lastReadAt?: FirestoreTimestamp;
  messageId?: string;
}
