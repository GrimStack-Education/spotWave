import { Prisma } from '@spotwave/database';
import { GeoPoint } from 'firebase-admin/firestore';
import {
  EventWithRelations,
  FirestoreMapper,
  UserWithProfileAndInterests,
} from './firestore.mapper';

describe('FirestoreMapper', () => {
  const mapper = new FirestoreMapper();

  it('maps user profile fields into Firebase document', () => {
    const user = {
      id: 'user-1',
      firebaseUid: 'firebase-1',
      email: 'mia@example.com',
      password: null,
      displayName: null,
      avatarUrl: null,
      bio: null,
      role: 'USER',
      organizationId: null,
      createdAt: new Date('2024-01-01T00:00:00Z'),
      updatedAt: new Date('2024-01-02T00:00:00Z'),
      profile: {
        userId: 'user-1',
        displayName: 'Mia',
        avatarUrl: 'https://example.com/avatar.png',
        bio: 'Hello',
        homeLat: null,
        homeLng: null,
        radiusKm: 5,
        createdAt: new Date('2024-01-01T00:00:00Z'),
        updatedAt: new Date('2024-01-02T00:00:00Z'),
      },
      interests: [
        {
          interest: {
            id: 'interest-1',
            name: 'Music',
            slug: 'music',
            icon: 'note',
          },
        },
        {
          interest: {
            id: 'interest-2',
            name: 'Coffee',
            slug: 'coffee',
            icon: 'cup',
          },
        },
      ],
    } satisfies UserWithProfileAndInterests;

    const result = mapper.mapUser(user);

    expect(result.displayName).toBe('Mia');
    expect(result.avatarUrl).toBe('https://example.com/avatar.png');
    expect(result.bio).toBe('Hello');
    expect(result.interests).toEqual(['music', 'coffee']);
    expect(result.status).toBe('offline');
  });

  it('maps event fields and counts joined participants', () => {
    const event = {
      id: 'event-1',
      creatorId: 'user-1',
      communityId: null,
      title: 'City Meetup',
      description: 'Meetup desc',
      startsAt: new Date('2024-05-01T10:00:00Z'),
      endsAt: new Date('2024-05-01T12:00:00Z'),
      status: 'ACTIVE',
      visibility: 'PUBLIC',
      capacity: 12,
      lat: new Prisma.Decimal('51.5'),
      lng: new Prisma.Decimal('0.12'),
      addressText: 'London',
      createdAt: new Date('2024-04-01T10:00:00Z'),
      updatedAt: new Date('2024-04-02T10:00:00Z'),
      creator: {
        id: 'user-1',
        firebaseUid: 'firebase-1',
        email: 'host@example.com',
        password: null,
        displayName: 'Host',
        avatarUrl: null,
        bio: null,
        role: 'USER',
        organizationId: null,
        createdAt: new Date('2024-01-01T00:00:00Z'),
        updatedAt: new Date('2024-01-02T00:00:00Z'),
      },
      participants: [
        {
          eventId: 'event-1',
          userId: 'user-2',
          role: 'MEMBER',
          status: 'JOINED',
          joinedAt: new Date('2024-04-15T12:00:00Z'),
          user: {
            id: 'user-2',
            firebaseUid: 'firebase-2',
            email: 'member@example.com',
            password: null,
            displayName: 'Member',
            avatarUrl: null,
            bio: null,
            role: 'USER',
            organizationId: null,
            createdAt: new Date('2024-01-01T00:00:00Z'),
            updatedAt: new Date('2024-01-02T00:00:00Z'),
          },
        },
        {
          eventId: 'event-1',
          userId: 'user-3',
          role: 'MEMBER',
          status: 'LEFT',
          joinedAt: new Date('2024-04-15T12:00:00Z'),
          user: {
            id: 'user-3',
            firebaseUid: 'firebase-3',
            email: 'left@example.com',
            password: null,
            displayName: 'Left',
            avatarUrl: null,
            bio: null,
            role: 'USER',
            organizationId: null,
            createdAt: new Date('2024-01-01T00:00:00Z'),
            updatedAt: new Date('2024-01-02T00:00:00Z'),
          },
        },
      ],
      chatMessages: [],
    } satisfies EventWithRelations;

    const result = mapper.mapEvent(event, 'firebase-1');

    expect(result.creatorId).toBe('firebase-1');
    expect(result.participantsCount).toBe(1);
    expect(result.location?.geo).toBeInstanceOf(GeoPoint);
    expect(result.location?.address).toBe('London');
  });

  it('builds chat metadata from latest message', () => {
    const messages = [
      {
        id: 'msg-1',
        eventId: 'event-1',
        userId: 'user-1',
        message: 'First',
        createdAt: new Date('2024-04-01T10:00:00Z'),
      },
      {
        id: 'msg-2',
        eventId: 'event-1',
        userId: 'user-1',
        message: 'Latest',
        createdAt: new Date('2024-04-01T12:00:00Z'),
      },
    ];

    const result = mapper.mapChatMetadata(messages);

    expect(result?.lastMessage).toBe('Latest');
  });
});
