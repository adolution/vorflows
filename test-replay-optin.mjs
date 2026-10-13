// Prüft /live-workshop als Replay-Anmeldung: Hero, Popup, Formular (API gemockt). Server :3001 nötig.
import puppeteer from 'puppeteer';

const out = 'temporary screenshots';
const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
const shots = [];

for (const [name, vp] of [['desktop', { width: 1440, height: 900 }], ['mobile', { width: 375, height: 760, isMobile: true, hasTouch: true, deviceScaleFactor: 2 }]]) {
  const page = await browser.newPage();
  await page.setViewport(vp);
  await page.evaluateOnNewDocument(() => { localStorage.setItem('vf_lw_cookie', '1'); localStorage.setItem('vf_consent', 'denied'); });
  await page.setRequestInterception(true);
  let posted = null;
  page.on('request', (r) => {
    const u = r.url();
    if (u.includes('/api/replay-optin')) { posted = r.postData(); return r.respond({ status: 200, contentType: 'application/json', body: '{"ok":true}' }); }
    if (/clarity\.ms|facebook|\/api\/capi/.test(u)) return r.respond({ status: 204, body: '' });
    r.continue();
  });
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('http://localhost:3001/live-workshop.html', { waitUntil: 'networkidle0' });
  await new Promise((r) => setTimeout(r, 900));
  await page.screenshot({ path: `${out}/replay-optin-${name}-hero.png` });
  await page.click('.lw-hero [data-webinar-cta]');
  await new Promise((r) => setTimeout(r, 600));
  await page.screenshot({ path: `${out}/replay-optin-${name}-modal.png` });
  await page.$eval('#optinBtn', (b) => b.click());
  const err = await page.$eval('#optinErr', (e) => !e.hidden && e.textContent);
  await page.type('input[name=vorname]', 'Test');
  await page.type('input[name=email]', 'test@example.com');
  await page.$eval('#optinBtn', (b) => b.click());
  await new Promise((r) => setTimeout(r, 600));
  await page.screenshot({ path: `${out}/replay-optin-${name}-done.png` });
  const done = await page.$eval('.lwq-step[data-step="done"]', (e) => !e.hidden);
  shots.push({ name, emptyError: err, posted, done, errors });
  await page.close();
}
console.log(JSON.stringify(shots, null, 1));
await browser.close();
