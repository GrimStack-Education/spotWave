import { chromium } from 'playwright';

const BASE_API = 'http://localhost:3333';
const BASE_WEB = 'http://localhost:3000';
const outDir = '/Users/mak/WorkSpace/spotWave/artifacts/screenshots';

async function main() {
  const email = `ui.${Date.now()}@spotwave.local`;
  const pass = 'Secret123';

  const regRes = await fetch(`${BASE_API}/auth/register`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email, password: pass, name: 'UI QA' }),
  });
  const reg = await regRes.json();
  const token = reg?.data?.accessToken;
  if (!token) throw new Error('no token');

  const interestsRes = await fetch(`${BASE_API}/onboarding/interests`, {
    headers: { authorization: `Bearer ${token}` },
  });
  const interests = await interestsRes.json();
  const interestId = interests?.data?.items?.[0]?.id;
  if (interestId) {
    await fetch(`${BASE_API}/onboarding/me`, {
      method: 'PUT',
      headers: {
        authorization: `Bearer ${token}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({ radiusKm: 5, interestIds: [interestId] }),
    });
  }

  const eventRes = await fetch(`${BASE_API}/events`, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${token}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      title: 'UI QA Event',
      startsAt: '2026-06-01T12:00:00.000Z',
      capacity: 3,
      lat: 43.238949,
      lng: 76.889709,
      addressText: 'Almaty',
    }),
  });
  const event = await eventRes.json();
  const eventId = event?.data?.id;

  const browser = await chromium.launch({ headless: true });

  const anon = await browser.newContext();
  const anonPage = await anon.newPage();
  await anonPage.goto(`${BASE_WEB}/sign-in`, { waitUntil: 'networkidle' });
  await anonPage.screenshot({ path: `${outDir}/01-sign-in.png`, fullPage: true });
  await anon.close();

  const ctx = await browser.newContext();
  await ctx.addInitScript((value) => {
    window.localStorage.setItem('spotwave_access_token', value);
  }, token);

  const pages = [
    ['/onboarding', '02-onboarding.png'],
    ['/home', '03-home.png'],
    ['/map', '04-map.png'],
    ['/create-event', '05-create-event.png'],
    [`/events/${eventId}`, '06-event-detail.png'],
    ['/notifications', '07-notifications.png'],
    ['/reviews', '08-reviews.png'],
    ['/settings', '09-settings.png'],
    ['/profile', '10-profile.png'],
    [`/events/${eventId}/chat`, '11-event-chat.png'],
    [`/events/${eventId}/check-in`, '12-event-checkin.png'],
    [`/events/${eventId}/requests`, '13-event-requests.png'],
  ];

  const page = await ctx.newPage();
  for (const [path, file] of pages) {
    await page.goto(`${BASE_WEB}${path}`, { waitUntil: 'networkidle' });
    await page.screenshot({ path: `${outDir}/${file}`, fullPage: true });
  }

  await ctx.close();
  await browser.close();

  console.log(JSON.stringify({ email, eventId, count: pages.length + 1 }, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
