import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const url = process.argv[2] || 'http://localhost:3000';
const label = process.argv[3] || '';

const dir = path.join(__dirname, 'temporary screenshots');
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

// Auto-increment screenshot number
const existing = fs.readdirSync(dir).filter(f => f.endsWith('.png'));
const numbers = existing.map(f => parseInt(f.match(/^screenshot-(\d+)/)?.[1] || 0)).filter(Boolean);
const next = numbers.length > 0 ? Math.max(...numbers) + 1 : 1;

const filename = label
  ? `screenshot-${next}-${label}.png`
  : `screenshot-${next}.png`;

const outPath = path.join(dir, filename);

const browser = await puppeteer.launch({
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
});

const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });
await page.goto(url, { waitUntil: 'load', timeout: 30000 });
await new Promise(r => setTimeout(r, 800));

// Walk the page top→bottom→top so scroll-triggered reveals (IntersectionObserver,
// lazy images, etc.) fire before we capture the full page. Without this, anything
// below the initial 900px viewport is still in its hidden pre-reveal state.
await page.evaluate(async () => {
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const max = document.documentElement.scrollHeight;
  const step = 600;
  for (let y = 0; y < max; y += step) {
    window.scrollTo(0, y);
    await sleep(50);
  }
  window.scrollTo(0, 0);
  await sleep(300);
});
await new Promise(r => setTimeout(r, 600));

await page.screenshot({ path: outPath, fullPage: true });
await browser.close();

console.log(`Screenshot saved: temporary screenshots/${filename}`);
