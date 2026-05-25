import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { prisma } from '@spotwave/database';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
    await prisma.$disconnect();
  });

  it('GET / works', async () => {
    const res = await request(app.getHttpServer())
      .get('/')
      .expect(200);

    expect(res.body.status).toBe('success');
    expect(res.body.data).toBe('Hello World!');
  });

  it('auth + refresh + reports access control flow', async () => {
    const ts = Date.now();
    const u1 = `e2e-u1-${ts}@test.local`;
    const u2 = `e2e-u2-${ts}@test.local`;
    const password = 'password123';

    const register1 = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: u1, password })
      .expect(201);
    const register2 = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: u2, password })
      .expect(201);

    const t1: string = register1.body.data.accessToken;
    const t2: string = register2.body.data.accessToken;

    await request(app.getHttpServer()).get('/auth/me').expect(401);

    await request(app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', `Bearer ${t1}`)
      .expect(200);

    const refresh = await request(app.getHttpServer())
      .post('/auth/refresh')
      .set('Authorization', `Bearer ${t1}`)
      .expect(201);
    expect(refresh.body.data.accessToken).toBeDefined();

    const createEvent = await request(app.getHttpServer())
      .post('/events')
      .set('Authorization', `Bearer ${t1}`)
      .send({
        title: 'E2E Event',
        startsAt: new Date().toISOString(),
        lat: 43.2389,
        lng: 76.8897,
      })
      .expect(201);

    const eventId: string = createEvent.body.data.id;

    await request(app.getHttpServer())
      .patch(`/events/${eventId}`)
      .set('Authorization', `Bearer ${t2}`)
      .send({ title: 'Nope' })
      .expect(403);

    const report = await request(app.getHttpServer())
      .post('/reports')
      .set('Authorization', `Bearer ${t2}`)
      .send({
        targetType: 'EVENT',
        targetEventId: eventId,
        reason: 'Spam event',
      })
      .expect(201);

    const reportId: string = report.body.data.id;

    await request(app.getHttpServer())
      .get('/reports')
      .set('Authorization', `Bearer ${t2}`)
      .expect(403);

    const user1 = await prisma.user.findUnique({
      where: { email: u1 },
      select: { id: true },
    });
    expect(user1?.id).toBeDefined();

    await prisma.user.update({
      where: { id: user1!.id },
      data: { role: 'ADMIN' },
    });

    const adminLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: u1, password })
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
  });
});
