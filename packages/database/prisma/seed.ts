import { PrismaPg } from '@prisma/adapter-pg';
import {
  CommunityVisibility,
  EventCheckInMethod,
  EventStatus,
  EventVisibility,
  MemberRole,
  MemberStatus,
  NotificationType,
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

type SeededEventMap = Map<string, string>;

const seededEventKey = {
  rooftopSunsetTalk: 'event:rooftop-sunset-talk',
  morningRunCircle: 'event:morning-run-circle',
  indieBoardGamesNight: 'event:indie-board-games-night',
  coffeeSketchWalk: 'event:coffee-sketch-walk',
  foundersMicroDinner: 'event:founders-micro-dinner',
  sundayVinylBreakfast: 'event:sunday-vinyl-breakfast',
} as const;

function requireSeededEventId(seededEventIds: SeededEventMap, seedKey: string) {
  const eventId = seededEventIds.get(seedKey);
  if (!eventId) {
    throw new Error(`Missing seeded event ${seedKey}`);
  }
  return eventId;
}

async function assertEventUpdateCount(
  action: string,
  eventIds: string[],
  update: Promise<{ count: number }>,
) {
  const result = await update;
  if (result.count !== eventIds.length) {
    throw new Error(
      `${action} expected to update ${eventIds.length} seeded events, updated ${result.count}`,
    );
  }
}

const tagSeeds = [
  { slug: 'music', name: 'Music' },
  { slug: 'sports', name: 'Sports' },
  { slug: 'networking', name: 'Networking' },
  { slug: 'coffee', name: 'Coffee' },
  { slug: 'games', name: 'Games' },
  { slug: 'art', name: 'Art' },
  { slug: 'food', name: 'Food' },
  { slug: 'outdoors', name: 'Outdoors' },
];

const interestSeeds = [
  { slug: 'music', name: 'Музыка', icon: 'music' },
  { slug: 'sport', name: 'Спорт', icon: 'activity' },
  { slug: 'food', name: 'Еда', icon: 'utensils' },
  { slug: 'games', name: 'Игры', icon: 'dice' },
  { slug: 'talks', name: 'Разговоры', icon: 'messages' },
  { slug: 'art', name: 'Арт', icon: 'palette' },
  { slug: 'networking', name: 'Нетворкинг', icon: 'users' },
  { slug: 'outdoors', name: 'Прогулки', icon: 'map' },
];

const userSeeds = [
  {
    email: 'admin@spotwave.local',
    displayName: 'Platform Admin',
    role: UserRole.ADMIN,
    bio: 'Следит за безопасностью площадки и качеством локальных встреч.',
    avatarUrl: 'https://api.dicebear.com/9.x/initials/svg?seed=Platform%20Admin',
    homeLat: 43.238949,
    homeLng: 76.889709,
    radiusKm: 10,
    interests: ['networking', 'talks', 'art'],
  },
  {
    email: 'host@spotwave.local',
    displayName: 'Aruzhan Local Host',
    role: UserRole.USER,
    bio: 'Собираю камерные события в Алматы: музыка, прогулки, кофе и разговоры без лишнего шума.',
    avatarUrl: 'https://api.dicebear.com/9.x/initials/svg?seed=Aruzhan%20Local%20Host',
    homeLat: 43.2401,
    homeLng: 76.8862,
    radiusKm: 5,
    interests: ['music', 'food', 'talks', 'outdoors'],
  },
  {
    email: 'guest@spotwave.local',
    displayName: 'Nearby Guest',
    role: UserRole.USER,
    bio: 'Ищу небольшие встречи рядом после работы и отмечаюсь только там, куда реально прихожу.',
    avatarUrl: 'https://api.dicebear.com/9.x/initials/svg?seed=Nearby%20Guest',
    homeLat: 43.2455,
    homeLng: 76.9012,
    radiusKm: 5,
    interests: ['sport', 'coffee', 'games', 'talks'],
  },
  {
    email: 'runner@spotwave.local',
    displayName: 'Daniyar Runner',
    role: UserRole.USER,
    bio: 'Утренние пробежки, outdoor-встречи и быстрый кофе после финиша.',
    avatarUrl: 'https://api.dicebear.com/9.x/initials/svg?seed=Daniyar%20Runner',
    homeLat: 43.2502,
    homeLng: 76.9151,
    radiusKm: 7,
    interests: ['sport', 'outdoors', 'coffee'],
  },
  {
    email: 'designer@spotwave.local',
    displayName: 'Mira Sketch',
    role: UserRole.USER,
    bio: 'Хожу на sketch walks, арт-завтраки и встречи про городские проекты.',
    avatarUrl: 'https://api.dicebear.com/9.x/initials/svg?seed=Mira%20Sketch',
    homeLat: 43.2327,
    homeLng: 76.9564,
    radiusKm: 8,
    interests: ['art', 'coffee', 'networking'],
  },
];

async function seedTags() {
  for (const tag of tagSeeds) {
    await prisma.tag.upsert({
      where: { slug: tag.slug },
      update: { name: tag.name },
      create: tag,
    });
  }
}

async function seedInterests() {
  for (const interest of interestSeeds) {
    await prisma.interest.upsert({
      where: { slug: interest.slug },
      update: { name: interest.name, icon: interest.icon },
      create: interest,
    });
  }
}

async function seedUsers() {
  const password = await hash('password123', 10);

  for (const user of userSeeds) {
    const record = await prisma.user.upsert({
      where: { email: user.email },
      update: {
        password,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
        bio: user.bio,
        role: user.role,
        profile: {
          upsert: {
            update: {
              displayName: user.displayName,
              avatarUrl: user.avatarUrl,
              bio: user.bio,
              homeLat: user.homeLat,
              homeLng: user.homeLng,
              radiusKm: user.radiusKm,
            },
            create: {
              displayName: user.displayName,
              avatarUrl: user.avatarUrl,
              bio: user.bio,
              homeLat: user.homeLat,
              homeLng: user.homeLng,
              radiusKm: user.radiusKm,
            },
          },
        },
      },
      create: {
        email: user.email,
        password,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
        bio: user.bio,
        firebaseUid: `seed-${user.email}`,
        role: user.role,
        profile: {
          create: {
            displayName: user.displayName,
            avatarUrl: user.avatarUrl,
            bio: user.bio,
            homeLat: user.homeLat,
            homeLng: user.homeLng,
            radiusKm: user.radiusKm,
          },
        },
      },
      select: { id: true },
    });

    const interests = await prisma.interest.findMany({
      where: { slug: { in: user.interests } },
      select: { id: true },
    });

    await prisma.userInterest.deleteMany({ where: { userId: record.id } });
    if (interests.length) {
      await prisma.userInterest.createMany({
        data: interests.map((interest) => ({ userId: record.id, interestId: interest.id })),
        skipDuplicates: true,
      });
    }
  }
}

async function seedEvents(): Promise<SeededEventMap> {
  const users = await prisma.user.findMany({
    where: { email: { in: userSeeds.map((user) => user.email) } },
  });
  const userByEmail = new Map(users.map((user) => [user.email, user]));
  const tags = await prisma.tag.findMany();
  const tagBySlug = new Map(tags.map((tag) => [tag.slug, tag]));

  const eventData = [
    {
      seedKey: seededEventKey.rooftopSunsetTalk,
      title: 'Rooftop Sunset Talk',
      description:
        'Камерная встреча на крыше: музыка на фоне, знакомство по интересам и короткий круг introductions.',
      startsAt: new Date('2026-06-02T14:00:00.000Z'),
      endsAt: new Date('2026-06-02T16:00:00.000Z'),
      visibility: EventVisibility.PUBLIC,
      capacity: 12,
      lat: 43.2404,
      lng: 76.8895,
      addressText: 'The Nest Rooftop, Dostyk Plaza',
      creatorEmail: 'host@spotwave.local',
      tagSlugs: ['music', 'networking'],
      participantEmails: ['host@spotwave.local', 'guest@spotwave.local', 'designer@spotwave.local'],
    },
    {
      seedKey: seededEventKey.morningRunCircle,
      title: 'Morning Run Circle',
      description: 'Легкий темп 5 км вокруг парка, check-in на старте и кофе после финиша.',
      startsAt: new Date('2026-06-03T01:00:00.000Z'),
      endsAt: new Date('2026-06-03T02:15:00.000Z'),
      visibility: EventVisibility.NEIGHBORHOOD,
      capacity: 10,
      lat: 43.2521,
      lng: 76.9128,
      addressText: 'Central Park north gate',
      creatorEmail: 'runner@spotwave.local',
      tagSlugs: ['sports', 'outdoors', 'coffee'],
      participantEmails: ['runner@spotwave.local', 'guest@spotwave.local', 'host@spotwave.local'],
    },
    {
      seedKey: seededEventKey.indieBoardGamesNight,
      title: 'Indie Board Games Night',
      description:
        'Настолки на 6-8 человек: быстрые правила, спокойный темп, без турнирного давления.',
      startsAt: new Date('2026-06-04T13:30:00.000Z'),
      endsAt: new Date('2026-06-04T16:30:00.000Z'),
      visibility: EventVisibility.PRIVATE,
      capacity: 8,
      lat: 43.2382,
      lng: 76.9451,
      addressText: 'Dostyk Hub lounge',
      creatorEmail: 'guest@spotwave.local',
      tagSlugs: ['games', 'coffee'],
      participantEmails: ['guest@spotwave.local', 'host@spotwave.local', 'designer@spotwave.local'],
    },
    {
      seedKey: seededEventKey.coffeeSketchWalk,
      title: 'Coffee Sketch Walk',
      description:
        'Маршрут по трем кофейням, быстрые городские зарисовки и обмен материалами после прогулки.',
      startsAt: new Date('2026-06-05T08:00:00.000Z'),
      endsAt: new Date('2026-06-05T10:00:00.000Z'),
      visibility: EventVisibility.PUBLIC,
      capacity: 9,
      lat: 43.2354,
      lng: 76.9571,
      addressText: 'Abay Ave, first stop at Bowler Coffee',
      creatorEmail: 'designer@spotwave.local',
      tagSlugs: ['art', 'coffee', 'outdoors'],
      participantEmails: [
        'designer@spotwave.local',
        'host@spotwave.local',
        'runner@spotwave.local',
      ],
    },
    {
      seedKey: seededEventKey.foundersMicroDinner,
      title: 'Founders Micro-Dinner',
      description:
        'Небольшой ужин для founders и product people: запросы, интро и честный фидбек по идеям.',
      startsAt: new Date('2026-06-06T14:30:00.000Z'),
      endsAt: new Date('2026-06-06T17:00:00.000Z'),
      visibility: EventVisibility.NEIGHBORHOOD,
      capacity: 6,
      lat: 43.2217,
      lng: 76.8512,
      addressText: 'Qazaq Gourmet private table',
      creatorEmail: 'admin@spotwave.local',
      tagSlugs: ['networking', 'food'],
      participantEmails: ['admin@spotwave.local', 'host@spotwave.local', 'designer@spotwave.local'],
    },
    {
      seedKey: seededEventKey.sundayVinylBreakfast,
      title: 'Sunday Vinyl Breakfast',
      description: 'Завтрак, пластинки и обмен любимыми треками. Формат для спокойных знакомств.',
      startsAt: new Date('2026-06-07T05:00:00.000Z'),
      endsAt: new Date('2026-06-07T07:00:00.000Z'),
      visibility: EventVisibility.PUBLIC,
      capacity: 14,
      lat: 43.2469,
      lng: 76.9273,
      addressText: 'Mono Cafe, vinyl room',
      creatorEmail: 'host@spotwave.local',
      tagSlugs: ['music', 'food', 'coffee'],
      participantEmails: [
        'host@spotwave.local',
        'guest@spotwave.local',
        'runner@spotwave.local',
        'designer@spotwave.local',
      ],
    },
  ];

  const seededEventIds = new Map<string, string>();

  for (const item of eventData) {
    const creator = userByEmail.get(item.creatorEmail);
    if (!creator) throw new Error(`Missing seed user ${item.creatorEmail}`);

    const existing = await prisma.event.findUnique({
      where: { seedKey: item.seedKey },
      select: { id: true },
    });

    const baseEventData = {
      title: item.title,
      description: item.description,
      startsAt: item.startsAt,
      endsAt: item.endsAt,
      seedKey: item.seedKey,
      status: EventStatus.ACTIVE,
      visibility: item.visibility,
      capacity: item.capacity,
      lat: item.lat,
      lng: item.lng,
      addressText: item.addressText,
      creatorId: creator.id,
    };

    const event =
      existing
        ? await prisma.event.update({
            where: { id: existing.id },
            data: baseEventData,
            select: { id: true },
          })
        : await prisma.event.create({
            data: baseEventData,
            select: { id: true },
          });

    await prisma.eventTag.deleteMany({ where: { eventId: event.id } });
    await prisma.eventParticipant.deleteMany({ where: { eventId: event.id } });

    await prisma.eventTag.createMany({
      data: item.tagSlugs.map((slug) => {
        const tag = tagBySlug.get(slug);
        if (!tag) throw new Error(`Missing seed tag ${slug}`);
        return { eventId: event.id, tagId: tag.id };
      }),
    });

    await prisma.eventParticipant.createMany({
      data: item.participantEmails.map((email) => {
        const user = userByEmail.get(email);
        if (!user) throw new Error(`Missing participant ${email}`);
        return {
          eventId: event.id,
          userId: user.id,
          role: email === item.creatorEmail ? ParticipantRole.HOST : ParticipantRole.MEMBER,
          status: ParticipantStatus.JOINED,
        };
      }),
    });

    seededEventIds.set(item.seedKey, event.id);
  }

  return seededEventIds;
}

async function seedTrustActivity(seededEventIds: SeededEventMap) {
  const [host, guest, runner, designer] = await Promise.all([
    prisma.user.findUniqueOrThrow({ where: { email: 'host@spotwave.local' } }),
    prisma.user.findUniqueOrThrow({ where: { email: 'guest@spotwave.local' } }),
    prisma.user.findUniqueOrThrow({ where: { email: 'runner@spotwave.local' } }),
    prisma.user.findUniqueOrThrow({ where: { email: 'designer@spotwave.local' } }),
  ]);

  const trustEventIds = [
    requireSeededEventId(seededEventIds, seededEventKey.rooftopSunsetTalk),
    requireSeededEventId(seededEventIds, seededEventKey.morningRunCircle),
    requireSeededEventId(seededEventIds, seededEventKey.coffeeSketchWalk),
  ];

  const events = await prisma.event.findMany({
    where: { id: { in: trustEventIds } },
  });
  const eventBySeedKey = new Map(events.map((event) => [event.seedKey, event]));
  await prisma.eventChatMessage.deleteMany({
    where: { eventId: { in: events.map((event) => event.id) } },
  });

  const checkIns = [
    {
      eventSeedKey: seededEventKey.rooftopSunsetTalk,
      userId: host.id,
      method: EventCheckInMethod.QR,
      code: 'ROOF-HOST',
    },
    {
      eventSeedKey: seededEventKey.rooftopSunsetTalk,
      userId: guest.id,
      method: EventCheckInMethod.GEO,
      code: null,
    },
    {
      eventSeedKey: seededEventKey.rooftopSunsetTalk,
      userId: designer.id,
      method: EventCheckInMethod.QR,
      code: 'ROOF-MIRA',
    },
    {
      eventSeedKey: seededEventKey.morningRunCircle,
      userId: runner.id,
      method: EventCheckInMethod.GEO,
      code: null,
    },
    {
      eventSeedKey: seededEventKey.morningRunCircle,
      userId: guest.id,
      method: EventCheckInMethod.GEO,
      code: null,
    },
  ];

  for (const item of checkIns) {
    const event = eventBySeedKey.get(item.eventSeedKey);
    if (!event) throw new Error(`Missing trust activity event ${item.eventSeedKey}`);
    await prisma.eventCheckIn.upsert({
      where: { eventId_userId: { eventId: event.id, userId: item.userId } },
      update: { method: item.method, code: item.code },
      create: { eventId: event.id, userId: item.userId, method: item.method, code: item.code },
    });
  }

  const reviews = [
    {
      eventSeedKey: seededEventKey.rooftopSunsetTalk,
      authorUserId: guest.id,
      rating: 5,
      text: 'Очень спокойный формат, host держал тайминг и помог всем познакомиться.',
    },
    {
      eventSeedKey: seededEventKey.rooftopSunsetTalk,
      authorUserId: designer.id,
      rating: 5,
      text: 'Понравились небольшая группа и понятная коммуникация до встречи.',
    },
    {
      eventSeedKey: seededEventKey.morningRunCircle,
      authorUserId: guest.id,
      rating: 4,
      text: 'Маршрут был понятный, темп комфортный. Хороший check-in на старте.',
    },
    {
      eventSeedKey: seededEventKey.coffeeSketchWalk,
      authorUserId: host.id,
      rating: 5,
      text: 'Mira заранее описала маршрут, поэтому встреча ощущалась безопасно и собранно.',
    },
  ];

  for (const item of reviews) {
    const event = eventBySeedKey.get(item.eventSeedKey);
    if (!event) throw new Error(`Missing trust review event ${item.eventSeedKey}`);
    await prisma.eventReview.upsert({
      where: { eventId_authorUserId: { eventId: event.id, authorUserId: item.authorUserId } },
      update: { rating: item.rating, text: item.text },
      create: {
        eventId: event.id,
        authorUserId: item.authorUserId,
        rating: item.rating,
        text: item.text,
      },
    });
  }

  for (const event of events) {
    await prisma.eventChatMessage.createMany({
      data: [
        {
          eventId: event.id,
          userId: event.creatorId,
          message: 'Встречаемся у входа за 10 минут до старта.',
        },
        { eventId: event.id, userId: guest.id, message: 'Я на месте, check-in прошел.' },
      ],
    });
  }

  await prisma.notification.deleteMany({
    where: { userId: { in: [host.id, guest.id, runner.id, designer.id] } },
  });
  await prisma.notification.createMany({
    data: [
      {
        userId: host.id,
        type: NotificationType.EVENT_JOIN_APPROVED,
        title: 'Новый участник',
        body: 'Mira Sketch присоединилась к Rooftop Sunset Talk.',
        meta: { eventTitle: 'Rooftop Sunset Talk' },
      },
      {
        userId: host.id,
        type: NotificationType.EVENT_CHECKIN,
        title: 'Check-in подтвержден',
        body: 'Nearby Guest отметился на событии через геолокацию.',
        meta: { eventTitle: 'Rooftop Sunset Talk' },
      },
      {
        userId: guest.id,
        type: NotificationType.SYSTEM,
        title: 'Профиль выглядит надежнее',
        body: 'Добавлены интересы, радиус и первые отзывы по событиям.',
        meta: { section: 'trust' },
      },
      {
        userId: runner.id,
        type: NotificationType.EVENT_JOIN_APPROVED,
        title: 'Вы в списке',
        body: 'Ваше участие в Sunday Vinyl Breakfast подтверждено.',
        meta: { eventTitle: 'Sunday Vinyl Breakfast' },
      },
      {
        userId: designer.id,
        type: NotificationType.EVENT_CHECKIN,
        title: 'QR check-in готов',
        body: 'Для Coffee Sketch Walk можно использовать код на входе.',
        meta: { eventTitle: 'Coffee Sketch Walk' },
      },
    ],
  });
}

async function seedCommunities(seededEventIds: SeededEventMap) {
  const users = await prisma.user.findMany({
    where: { email: { in: userSeeds.map((user) => user.email) } },
  });
  const userByEmail = new Map(users.map((user) => [user.email, user]));

  const communityData = [
    {
      seedKey: 'community:almaty-rooftop-circle',
      name: 'Almaty Rooftop Circle',
      description:
        'Локальное сообщество для камерных rooftop-встреч, музыки на закате и спокойных знакомств без шумных толп.',
      city: 'Алматы',
      avatarUrl: 'https://api.dicebear.com/9.x/shapes/svg?seed=Almaty%20Rooftop%20Circle',
      ownerEmail: 'host@spotwave.local',
      memberEmails: ['host@spotwave.local', 'guest@spotwave.local', 'designer@spotwave.local'],
      eventSeedKeys: [seededEventKey.rooftopSunsetTalk, seededEventKey.sundayVinylBreakfast],
      messages: [
        {
          email: 'host@spotwave.local',
          message: 'На этой неделе держим формат до 12 человек и встречаемся ближе к закату.',
        },
        {
          email: 'designer@spotwave.local',
          message: 'Могу принести мини-подборку мест с хорошим видом для следующей встречи.',
        },
      ],
    },
    {
      seedKey: 'community:morning-run-crew',
      name: 'Morning Run Crew',
      description:
        'Утренние пробежки, outdoor-маршруты и кофе после финиша для тех, кто хочет держать темп рядом с домом.',
      city: 'Алматы',
      avatarUrl: 'https://api.dicebear.com/9.x/shapes/svg?seed=Morning%20Run%20Crew',
      ownerEmail: 'runner@spotwave.local',
      memberEmails: ['runner@spotwave.local', 'guest@spotwave.local', 'host@spotwave.local'],
      eventSeedKeys: [seededEventKey.morningRunCircle],
      messages: [
        {
          email: 'runner@spotwave.local',
          message: 'Завтра стартуем у северных ворот, легкий темп 5 км.',
        },
        { email: 'guest@spotwave.local', message: 'Я присоединюсь, хочу проверить новый маршрут.' },
      ],
    },
    {
      seedKey: 'community:sketch-walks-kz',
      name: 'Sketch Walks KZ',
      description:
        'Городские sketch walks, арт-завтраки и маршруты по кофейням для тех, кто любит наблюдать город руками.',
      city: 'Алматы',
      avatarUrl: 'https://api.dicebear.com/9.x/shapes/svg?seed=Sketch%20Walks%20KZ',
      ownerEmail: 'designer@spotwave.local',
      memberEmails: ['designer@spotwave.local', 'host@spotwave.local', 'runner@spotwave.local'],
      eventSeedKeys: [seededEventKey.coffeeSketchWalk],
      messages: [
        {
          email: 'designer@spotwave.local',
          message: 'Следующий walk хочу сделать по тихим дворикам вокруг Абая.',
        },
        {
          email: 'host@spotwave.local',
          message: 'Могу помочь с финальной точкой и небольшим интро-кругом.',
        },
      ],
    },
    {
      seedKey: 'community:founders-micro-dinners',
      name: 'Founders Micro-Dinners',
      description:
        'Небольшие ужины для founders и product people: честный фидбек, интро по запросу и разговоры без сцены.',
      city: 'Алматы',
      avatarUrl: 'https://api.dicebear.com/9.x/shapes/svg?seed=Founders%20Micro%20Dinners',
      ownerEmail: 'admin@spotwave.local',
      memberEmails: ['admin@spotwave.local', 'host@spotwave.local', 'designer@spotwave.local'],
      eventSeedKeys: [seededEventKey.foundersMicroDinner],
      messages: [
        {
          email: 'admin@spotwave.local',
          message: 'Держим ужины маленькими: максимум 6-8 человек и конкретные запросы заранее.',
        },
        {
          email: 'host@spotwave.local',
          message: 'Поддерживаю, так интро остаются полезными и без лишнего шума.',
        },
      ],
    },
  ];

  const eventIdsToReset = [...new Set([...seededEventIds.values()])];
  if (eventIdsToReset.length) {
    await assertEventUpdateCount(
      'Reset seeded event community links',
      eventIdsToReset,
      prisma.event.updateMany({
        where: { id: { in: eventIdsToReset } },
        data: { communityId: null },
      }),
    );
  }

  for (const item of communityData) {
    const owner = userByEmail.get(item.ownerEmail);
    if (!owner) throw new Error(`Missing community owner ${item.ownerEmail}`);

    const existing = await prisma.community.findUnique({
      where: { seedKey: item.seedKey },
      select: { id: true },
    });

    const baseCommunityData = {
      name: item.name,
      description: item.description,
      avatarUrl: item.avatarUrl,
      city: item.city,
      seedKey: item.seedKey,
      visibility: CommunityVisibility.PUBLIC,
      ownerId: owner.id,
    };

    const community =
      existing
        ? await prisma.community.update({
            where: { id: existing.id },
            data: baseCommunityData,
            select: { id: true },
          })
        : await prisma.community.create({
            data: baseCommunityData,
            select: { id: true },
          });

    await prisma.communityMember.deleteMany({ where: { communityId: community.id } });
    await prisma.communityChatMessage.deleteMany({ where: { communityId: community.id } });

    await prisma.communityMember.createMany({
      data: item.memberEmails.map((email) => {
        const user = userByEmail.get(email);
        if (!user) throw new Error(`Missing community member ${email}`);
        return {
          communityId: community.id,
          userId: user.id,
          role: email === item.ownerEmail ? MemberRole.OWNER : MemberRole.MEMBER,
          status: MemberStatus.ACTIVE,
        };
      }),
    });

    await prisma.communityChatMessage.createMany({
      data: item.messages.map((message) => {
        const user = userByEmail.get(message.email);
        if (!user) throw new Error(`Missing community message author ${message.email}`);
        return {
          communityId: community.id,
          userId: user.id,
          message: message.message,
        };
      }),
    });

    const communityEventIds = item.eventSeedKeys.map((seedKey) =>
      requireSeededEventId(seededEventIds, seedKey),
    );

    await assertEventUpdateCount(
      `Assign seeded events to community ${item.seedKey}`,
      communityEventIds,
      prisma.event.updateMany({
        where: { id: { in: communityEventIds } },
        data: { communityId: community.id },
      }),
    );
  }
}

async function seedReports(seededEventIds: SeededEventMap) {
  const targetEventId = requireSeededEventId(seededEventIds, seededEventKey.rooftopSunsetTalk);

  const [reporter, targetEvent] = await Promise.all([
    prisma.user.findUniqueOrThrow({ where: { email: 'guest@spotwave.local' } }),
    prisma.event.findUniqueOrThrow({ where: { id: targetEventId }, select: { id: true } }),
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
        reason: 'Test moderation signal for seeded trust dashboard.',
        status: ReportStatus.RESOLVED,
      },
    });
    return;
  }

  await prisma.report.create({
    data: {
      reporterUserId: reporter.id,
      targetType: ReportTargetType.EVENT,
      targetEventId: targetEvent.id,
      reason: 'Test moderation signal for seeded trust dashboard.',
      status: ReportStatus.RESOLVED,
    },
  });
}

async function main() {
  await seedTags();
  await seedInterests();
  await seedUsers();
  const seededEventIds = await seedEvents();
  await seedTrustActivity(seededEventIds);
  await seedCommunities(seededEventIds);
  await seedReports(seededEventIds);
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
