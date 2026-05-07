import puppeteer from 'puppeteer';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dir = path.join(__dirname, 'temporary screenshots');

const browser = await puppeteer.launch({
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
});

const page = await browser.newPage();
const isMobile = process.argv[2] === 'mobile';
const viewport = isMobile
  ? { width: 390, height: 844, deviceScaleFactor: 1 }
  : { width: 1440, height: 900, deviceScaleFactor: 1 };
const tag = isMobile ? 'mobile' : 'desktop';
await page.setViewport(viewport);
await page.goto('http://localhost:3001', { waitUntil: 'load', timeout: 30000 });
await new Promise(r => setTimeout(r, 800));

await page.evaluate(() => {
  const banner = document.querySelector('.cookie-banner');
  if (banner) banner.style.display = 'none';
  document.querySelectorAll('.sticky-cta-bar').forEach(el => (el.style.display = 'none'));
});

// Walk page so layout settles & images load
await page.evaluate(async () => {
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const max = document.documentElement.scrollHeight;
  for (let y = 0; y < max; y += 600) { window.scrollTo(0, y); await sleep(40); }
  window.scrollTo(0, 0);
  await sleep(400);
});

const points = [
  { p: 0.00, label: 'p00' },
  { p: 0.10, label: 'p10' },
  { p: 0.25, label: 'p25' },
  { p: 0.45, label: 'p45' },
  { p: 0.65, label: 'p65' },
  { p: 0.85, label: 'p85' },
  { p: 1.00, label: 'p100' },
];

for (const { p, label } of points) {
  await page.evaluate((p) => {
    const sec = document.getElementById('produkt');
    sec.dataset.scrubLock = '0';
    const offsetTopWithin = (el) => {
      let y = 0, n = el;
      while (n) { y += n.offsetTop; n = n.offsetParent; }
      return y;
    };
    const track = sec.querySelector('.pr-track');
    const pin = sec.querySelector('.pr-pin');
    if (!track || !pin) return;
    // Reset scroll first to measure pin's natural offset (offsetTop is unreliable on sticky)
    window.scrollTo(0, 0);
    const trackY = offsetTopWithin(track);
    const pinTop = pin.getBoundingClientRect().top + window.scrollY;
    const pinNaturalY = pinTop - trackY;
    const total = track.offsetHeight - pin.offsetHeight - pinNaturalY;
    window.scrollTo(0, Math.max(0, trackY + pinNaturalY + total * p));
  }, p);
  // Wait for lerp to settle (lerp takes ~1s to traverse full sweep)
  await new Promise(r => setTimeout(r, 1400));
  const out = path.join(dir, `produkt-${tag}-${label}.png`);
  await page.screenshot({ path: out });
  console.log('Saved:', out);
}

await browser.close();
