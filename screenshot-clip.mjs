import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const url = process.argv[2] || 'http://localhost:3001';
const selector = process.argv[3];
const label = process.argv[4] || 'clip';

const dir = path.join(__dirname, 'temporary screenshots');
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

const existing = fs.readdirSync(dir).filter(f => f.endsWith('.png'));
const numbers = existing.map(f => parseInt(f.match(/^screenshot-(\d+)/)?.[1] || 0)).filter(Boolean);
const next = numbers.length > 0 ? Math.max(...numbers) + 1 : 1;
const outPath = path.join(dir, `screenshot-${next}-${label}.png`);

const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });
await page.goto(url, { waitUntil: 'load' });
await new Promise(r => setTimeout(r, 800));

if (selector) {
  const el = await page.$(selector);
  if (!el) { console.error('not found:', selector); process.exit(1); }
  await el.screenshot({ path: outPath });
} else {
  await page.screenshot({ path: outPath });
}
await browser.close();
console.log(`Screenshot saved: temporary screenshots/screenshot-${next}-${label}.png`);
