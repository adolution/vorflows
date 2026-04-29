import fs from 'node:fs/promises';
import path from 'node:path';
import puppeteer from 'puppeteer';

const SVG = await fs.readFile('brand_assets/logos/07a-paper-v.svg', 'utf8');
const OUT = path.resolve('brand_assets/logos');

const browser = await puppeteer.launch({ headless: 'new' });
const page = await browser.newPage();

const sizes = [
  { name: 'favicon-16.png', px: 16 },
  { name: 'favicon-32.png', px: 32 },
  { name: 'apple-touch-icon.png', px: 180 },
];

for (const { name, px } of sizes) {
  const html = `<!doctype html><html><head><meta charset="utf-8">
<style>html,body{margin:0;padding:0;}svg{display:block;width:${px}px;height:${px}px;}</style>
</head><body>${SVG}</body></html>`;
  await page.setViewport({ width: px, height: px, deviceScaleFactor: 1 });
  await page.setContent(html, { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: path.join(OUT, name), clip: { x: 0, y: 0, width: px, height: px } });
  console.log(`wrote ${name}`);
}

// Plain favicon.svg copy (alias)
await fs.copyFile(path.join(OUT, '07a-paper-v.svg'), path.join(OUT, 'favicon.svg'));
console.log('wrote favicon.svg');

await browser.close();
