import type { Chat, CheckIn, Event, RSVP, Trust } from '@/shared/types/domain';

export const events: Event[] = [
  { id: 'e1', title: 'Board Games Night', category: 'Games', datetime: 'Today 19:30', location: 'Almaty, Dostyk Hub', radius: 2, privacy: 'public', capacity: 8, rsvpCount: 6, waitlistCount: 0, seatsLeft: 2, quorumStatus: 'quorum_reached', organizerId: 'u1' },
  { id: 'e2', title: 'Morning Run Circle', category: 'Sport', datetime: 'Tomorrow 07:00', location: 'Almaty, Central Park', radius: 5, privacy: 'closed', capacity: 10, rsvpCount: 4, waitlistCount: 0, seatsLeft: 6, quorumStatus: 'forming', organizerId: 'u2' },
  { id: 'e3', title: 'English Speaking Club', category: 'Language', datetime: 'Fri 18:00', location: 'Almaty, Abay 10', radius: 10, privacy: 'hidden', capacity: 12, rsvpCount: 12, waitlistCount: 2, seatsLeft: 0, quorumStatus: 'full', organizerId: 'u3' },
];

export const rsvps: RSVP[] = [{ userId: 'me', eventId: 'e1', status: 'going', timestamp: new Date().toISOString() }];
export const chats: Chat[] = [{ eventId: 'e1', messages: ['Meet near main entrance at 19:20', 'Table booked for 8'], isArchived: false }];
export const checkins: CheckIn[] = [{ eventId: 'e1', userId: 'me', status: 'verified', method: 'geo' }];
export const trust: Trust = { verificationLevel: '18+', rating: 4.8, reviewsCount: 23, complaintsCount: 0 };
