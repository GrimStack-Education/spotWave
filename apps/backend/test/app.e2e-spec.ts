import { ValidationPipe, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { prisma, UserRole } from '@spotwave/database';
import { AppModule } from './../src/app.module';

describe('Backend e2e', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
    await prisma.$disconnect();
  });

  it('supports auth, events, participants, tags, reports and health endpoints', async () => {
    const ts = Date.now();
    const hostEmail = `e2e-host-${ts}@test.local`;
    const guestEmail = `e2e-guest-${ts}@test.local`;
    const waitlistEmail = `e2e-wait-${ts}@test.local`;
    const password = 'password123';

    await prisma.report.deleteMany();
    await prisma.eventParticipant.deleteMany();
    await prisma.eventTag.deleteMany();
    await prisma.event.deleteMany();
    await prisma.profile.deleteMany();
    await prisma.user.deleteMany({
      where: {
        email: {
          contains: '@test.local',
        },
      },
    });

    const musicTag = await prisma.tag.create({
      data: {
        slug: `music-${ts}`,
        name: `Music ${ts}`,
      },
    });
    const coffeeTag = await prisma.tag.create({
      data: {
        slug: `coffee-${ts}`,
        name: `Coffee ${ts}`,
      },
    });

    await request(app.getHttpServer()).get('/health').expect(200);
    await request(app.getHttpServer()).get('/health/ready').expect(200);

    const registerHost = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: hostEmail, password, name: 'Host User' })
      .expect(201);
    const registerGuest = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: guestEmail, password, name: 'Guest User' })
      .expect(201);
    const registerWaitlist = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: waitlistEmail, password, name: 'Waitlist User' })
      .expect(201);

    const hostToken: string = registerHost.body.data.accessToken;
    const guestToken: string = registerGuest.body.data.accessToken;
    const waitlistToken: string = registerWaitlist.body.data.accessToken;

    await request(app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', `Bearer ${hostToken}`)
      .expect(200);

    const loginHost = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: hostEmail, password })
      .expect(201);
    expect(loginHost.body.data.accessToken).toBeDefined();

    await request(app.getHttpServer())
      .post('/events')
      .set('Authorization', `Bearer ${hostToken}`)
      .send({
        title: 'Broken event',
        startsAt: new Date(Date.now() + 3_600_000).toISOString(),
        endsAt: new Date(Date.now()).toISOString(),
        lat: 43.2389,
        lng: 76.8897,
      })
      .expect(400);

    const createEvent = await request(app.getHttpServer())
      .post('/events')
      .set('Authorization', `Bearer ${hostToken}`)
      .send({
        title: 'Courtyard meetup',
        description: 'Bring coffee and stories',
        startsAt: new Date(Date.now() + 3_600_000).toISOString(),
        endsAt: new Date(Date.now() + 7_200_000).toISOString(),
        lat: 43.2389,
        lng: 76.8897,
        capacity: 1,
        addressText: 'Central courtyard',
        tagIds: [musicTag.id, coffeeTag.id],
      })
      .expect(201);

    const eventId: string = createEvent.body.data.id;
    expect(createEvent.body.data.tags).toHaveLength(2);

    await request(app.getHttpServer())
      .get(`/events/${eventId}`)
      .expect(200);

    const listEvents = await request(app.getHttpServer())
      .get('/events')
      .query({
        lat: 43.2389,
        lng: 76.8897,
        radiusKm: 2,
        tag: musicTag.slug,
      })
      .expect(200);

    expect(listEvents.body.data.items).toHaveLength(1);
    expect(listEvents.body.data.items[0].id).toBe(eventId);
    expect(listEvents.body.data.items[0].distanceKm).not.toBeNull();

    await request(app.getHttpServer())
      .patch(`/events/${eventId}`)
      .set('Authorization', `Bearer ${guestToken}`)
      .send({ title: 'Not allowed' })
      .expect(403);

    await request(app.getHttpServer())
      .patch(`/events/${eventId}`)
      .set('Authorization', `Bearer ${hostToken}`)
      .send({ title: 'Courtyard meetup updated', tagIds: [coffeeTag.id] })
      .expect(200);

    const joinGuest = await request(app.getHttpServer())
      .post(`/events/${eventId}/join`)
      .set('Authorization', `Bearer ${guestToken}`)
      .expect(201);
    expect(joinGuest.body.data.status).toBe('JOINED');

    const joinWaitlist = await request(app.getHttpServer())
      .post(`/events/${eventId}/join`)
      .set('Authorization', `Bearer ${waitlistToken}`)
      .expect(201);
    expect(joinWaitlist.body.data.status).toBe('WAITLIST');

    await request(app.getHttpServer())
      .post(`/events/${eventId}/join`)
      .set('Authorization', `Bearer ${guestToken}`)
      .expect(409);

    await request(app.getHttpServer())
      .post(`/events/${eventId}/leave`)
      .set('Authorization', `Bearer ${hostToken}`)
      .expect(409);

    await request(app.getHttpServer())
      .post(`/events/${eventId}/leave`)
      .set('Authorization', `Bearer ${guestToken}`)
      .expect(201);

    const updatedEvent = await request(app.getHttpServer())
      .get(`/events/${eventId}`)
      .expect(200);
    expect(updatedEvent.body.data.participants.waitlistCount).toBe(0);
    expect(updatedEvent.body.data.participants.joinedCount).toBe(2);

    await request(app.getHttpServer())
      .post(`/events/${eventId}/leave`)
      .set('Authorization', `Bearer ${guestToken}`)
      .expect(409);

    const tagsResponse = await request(app.getHttpServer())
      .get('/tags')
      .expect(200);
    expect(tagsResponse.body.data.length).toBeGreaterThanOrEqual(2);

    const reportResponse = await request(app.getHttpServer())
      .post('/reports')
      .set('Authorization', `Bearer ${guestToken}`)
      .send({
        targetType: 'EVENT',
        targetId: eventId,
        reason: 'Need moderator review',
      })
      .expect(201);

    const reportId: string = reportResponse.body.data.id;

    await request(app.getHttpServer())
      .get('/reports')
      .set('Authorization', `Bearer ${guestToken}`)
      .expect(403);

    const hostUser = await prisma.user.findUniqueOrThrow({
      where: { email: hostEmail },
      select: { id: true },
    });
    await prisma.user.update({
      where: { id: hostUser.id },
      data: { role: UserRole.ADMIN },
    });

    const adminLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: hostEmail, password })
      .expect(201);
    const adminToken: string = adminLogin.body.data.accessToken;

    await request(app.getHttpServer())
      .get('/reports')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    await request(app.getHttpServer())
      .patch(`/reports/${reportId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'RESOLVED' })
      .expect(200);

    await request(app.getHttpServer())
      .delete(`/events/${eventId}`)
      .set('Authorization', `Bearer ${hostToken}`)
      .expect(200);

    const cancelledEvent = await request(app.getHttpServer())
      .get(`/events/${eventId}`)
      .expect(200);
    expect(cancelledEvent.body.data.status).toBe('CANCELLED');
  });
});
