export type Privacy = 'public' | 'closed' | 'hidden';
export type QuorumStatus = 'forming' | 'quorum_reached' | 'full';

export type Event = {
  id: string;
  title: string;
  category: string;
  datetime: string;
  location: string;
  radius: number;
  privacy: Privacy;
  capacity: number;
  rsvpCount: number;
  waitlistCount: number;
  seatsLeft: number | null;
  quorumStatus: QuorumStatus;
  organizerId: string;
  lat: number;
  lng: number;
  distanceKm: number | null;
};

export type RSVP = {
  userId: string;
  eventId: string;
  status: 'going' | 'cancelled' | 'waitlist';
  timestamp: string;
};

export type Chat = { eventId: string; messages: string[]; isArchived: boolean };
export type CheckIn = { eventId: string; userId: string; status: 'verified' | 'pending' | 'rejected'; method: 'geo' | 'qr' | 'code' };
export type Trust = { verificationLevel: '12+' | '18+' | '25+'; rating: number; reviewsCount: number; complaintsCount: number };
