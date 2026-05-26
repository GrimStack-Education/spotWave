import { PrismaPg } from '@prisma/adapter-pg';
import {
  EventStatus,
  EventVisibility,
  ParticipantRole,
  ParticipantStatus,
  PrismaClient,
  ReportStatus,
  ReportTargetType,
  UserRole,
} from '@prisma/client';
import { hash } from 'bcryptjs';

const defaultDatabaseUrl = 'postgresql://spotwave:changeme@localhost:5432/spotwave';
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL ?? defaultDatabaseUrl,
});
const prisma = new PrismaClient({ adapter });

async function seedTags() {
  const tags = [
    { slug: 'music', name: 'Music' },
    { slug: 'sports', name: 'Sports' },
    { slug: 'networking', name: 'Networking' },
    { slug: 'coffee', name: 'Coffee' },
  ];

  for (const tag of tags) {
    await prisma.tag.upsert({
      where: { slug: tag.slug },
      update: { name: tag.name },
      create: tag,
    });
  }
}

async function seedUsers() {
  const password = await hash('password123', 10);
  const users = [
    {
      email: 'admin@spotwave.local',
      displayName: 'Platform Admin',
      role: UserRole.ADMIN,
      homeLat: 43.238949,
      homeLng: 76.889709,
    },
    {
      email: 'host@spotwave.local',
      displayName: 'Neighborhood Host',
      role: UserRole.USER,
      homeLat: 43.2401,
      homeLng: 76.8862,
    },
    {
      email: 'guest@spotwave.local',
      displayName: 'Nearby Guest',
      role: UserRole.USER,
      homeLat: 43.2455,
      homeLng: 76.9012,
    },
  ];

  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {
        password,
        displayName: user.displayName,
        role: user.role,
        profile: {
          upsert: {
            update: {
              displayName: user.displayName,
              homeLat: user.homeLat,
              homeLng: user.homeLng,
            },
            create: {
              displayName: user.displayName,
              homeLat: user.homeLat,
              homeLng: user.homeLng,
            },
          },
        },
      },
      create: {
        email: user.email,
        password,
        displayName: user.displayName,
        firebaseUid: `seed-${user.email}`,
        role: user.role,
        profile: {
          create: {
            displayName: user.displayName,
            homeLat: user.homeLat,
            homeLng: user.homeLng,
          },
        },
      },
    });
  }
}

async function seedEvents() {
  const [host, guest, musicTag, coffeeTag] = await Promise.all([
    prisma.user.findUniqueOrThrow({ where: { email: 'host@spotwave.local' } }),
    prisma.user.findUniqueOrThrow({ where: { email: 'guest@spotwave.local' } }),
    prisma.tag.findUniqueOrThrow({ where: { slug: 'music' } }),
    prisma.tag.findUniqueOrThrow({ where: { slug: 'coffee' } }),
  ]);

  const eventData = [
    {
      title: 'Courtyard Acoustic Jam',
      description: 'Bring a guitar or just listen with neighbors.',
      startsAt: new Date('2026-05-28T18:00:00.000Z'),
      endsAt: new Date('2026-05-28T20:00:00.000Z'),
      status: EventStatus.ACTIVE,
      visibility: EventVisibility.NEIGHBORHOOD,
      capacity: 8,
      lat: 43.2393,
      lng: 76.8889,
      addressText: 'Atlas Courtyard',
      creatorId: host.id,
      tagIds: [musicTag.id],
      participants: [
        {
          userId: host.id,
          role: ParticipantRole.HOST,
          status: ParticipantStatus.JOINED,
        },
        {
          userId: guest.id,
          role: ParticipantRole.MEMBER,
          status: ParticipantStatus.JOINED,
        },
      ],
    },
    {
      title: 'Morning Coffee Walk',
      description: 'Short walk around the block and coffee after.',
      startsAt: new Date('2026-05-29T05:30:00.000Z'),
      endsAt: new Date('2026-05-29T06:30:00.000Z'),
      status: EventStatus.ACTIVE,
      visibility: EventVisibility.PUBLIC,
      capacity: 5,
      lat: 43.2414,
      lng: 76.8912,
      addressText: 'Oak Street Corner',
      creatorId: host.id,
      tagIds: [coffeeTag.id],
      participants: [
        {
          userId: host.id,
          role: ParticipantRole.HOST,
          status: ParticipantStatus.JOINED,
        },
      ],
    },
  ];

  for (const item of eventData) {
    const existing = await prisma.event.findFirst({
      where: {
        creatorId: item.creatorId,
        title: item.title,
      },
      select: { id: true },
    });

    if (existing) {
      await prisma.eventParticipant.deleteMany({ where: { eventId: existing.id } });
      await prisma.eventTag.deleteMany({ where: { eventId: existing.id } });
      await prisma.event.delete({ where: { id: existing.id } });
    }

    await prisma.event.create({
      data: {
        title: item.title,
        description: item.description,
        startsAt: item.startsAt,
        endsAt: item.endsAt,
        status: item.status,
        visibility: item.visibility,
        capacity: item.capacity,
        lat: item.lat,
        lng: item.lng,
        addressText: item.addressText,
        creatorId: item.creatorId,
        eventTags: {
          create: item.tagIds.map((tagId) => ({ tagId })),
        },
        participants: {
          create: item.participants,
        },
      },
    });
  }
}

async function seedReports() {
  const [reporter, targetEvent] = await Promise.all([
    prisma.user.findUniqueOrThrow({ where: { email: 'guest@spotwave.local' } }),
    prisma.event.findFirstOrThrow({
      where: { title: 'Courtyard Acoustic Jam' },
      select: { id: true },
    }),
  ]);

  const existing = await prisma.report.findFirst({
    where: {
      reporterUserId: reporter.id,
      targetEventId: targetEvent.id,
      targetType: ReportTargetType.EVENT,
    },
    select: { id: true },
  });

  if (existing) {
    await prisma.report.update({
      where: { id: existing.id },
      data: {
        reason: 'Volume is too high after quiet hours.',
        status: ReportStatus.OPEN,
      },
    });
    return;
  }

  await prisma.report.create({
    data: {
      reporterUserId: reporter.id,
      targetType: ReportTargetType.EVENT,
      targetEventId: targetEvent.id,
      reason: 'Volume is too high after quiet hours.',
      status: ReportStatus.OPEN,
    },
  });
}

async function main() {
  await seedTags();
  await seedUsers();
  await seedEvents();
  await seedReports();
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
