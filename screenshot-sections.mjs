import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const url = process.argv[2] || 'http://localhost:3001';
const dir = path.join(__dirname, 'temporary screenshots');
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

const existing = fs.readdirSync(dir).filter((f) => f.endsWith('.png'));
const numbers = existing.map((f) => parseInt(f.match(/^screenshot-(\d+)/)?.[1] || 0)).filter(Boolean);
let next = numbers.length > 0 ? Math.max(...numbers) + 1 : 1;

const browser = await puppeteer.launch({
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
});

const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });
await page.goto(url, { waitUntil: 'load', timeout: 30000 });
await new Promise((r) => setTimeout(r, 1200));

// Get total page height
const pageHeight = await page.evaluate(() => document.body.scrollHeight);
const viewportHeight = 900;
const slices = Math.ceil(pageHeight / viewportHeight);

for (let i = 0; i < slices; i++) {
  const y = i * viewportHeight;
  await page.evaluate((y) => window.scrollTo(0, y), y);
  await new Promise((r) => setTimeout(r, 350));
  const out = path.join(dir, `screenshot-${next}-slice-${String(i + 1).padStart(2, '0')}.png`);
  await page.screenshot({ path: out, fullPage: false });
  console.log(`Saved: screenshot-${next}-slice-${String(i + 1).padStart(2, '0')}.png`);
  next++;
}

await browser.close();
