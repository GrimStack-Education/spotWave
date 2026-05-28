import { chromium } from 'playwright';

const BASE_API = 'http://localhost:3333';
const BASE_WEB = 'http://localhost:3000';
const outFile = '/Users/mak/WorkSpace/spotWave/artifacts/screenshots/02-onboarding-actual.png';

const email = `onb.${Date.now()}@spotwave.local`;
const pass = 'Secret123';

const regRes = await fetch(`${BASE_API}/auth/register`, {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ email, password: pass, name: 'Onboard QA' }),
});
const reg = await regRes.json();
const token = reg?.data?.accessToken;
if (!token) throw new Error('No token');

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext();
await ctx.addInitScript((value) => {
  window.localStorage.setItem('spotwave_access_token', value);
}, token);
const page = await ctx.newPage();
await page.goto(`${BASE_WEB}/onboarding`, { waitUntil: 'networkidle' });
await page.screenshot({ path: outFile, fullPage: true });
await browser.close();
console.log(JSON.stringify({ email, outFile }));
