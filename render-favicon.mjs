import fs from 'node:fs/promises';
import path from 'node:path';
import puppeteer from 'puppeteer';

const RAW_SVG = await fs.readFile('brand_assets/logos/07a-paper-v.svg', 'utf8');
// Strip hard-coded width/height on the root <svg> so CSS sizing wins.
const SVG = RAW_SVG.replace(/<svg([^>]*)>/, (m, attrs) =>
  `<svg${attrs.replace(/\s(width|height)="[^"]*"/g, '')} preserveAspectRatio="xMidYMid meet">`
);
const OUT = path.resolve('brand_assets/logos');

const browser = await puppeteer.launch({ headless: 'new' });
const page = await browser.newPage();

const sizes = [
  { name: 'favicon-16.png', px: 16 },
  { name: 'favicon-32.png', px: 32 },
  { name: 'apple-touch-icon.png', px: 180 },
];

// Zoom: scale glyph up inside container, clip to box, round corners.
const ZOOM = 2.3;           // >1 = closer / bigger glyph
const RADIUS_RATIO = 0.22;  // border-radius as fraction of icon size

for (const { name, px } of sizes) {
  const inner = Math.round(px * ZOOM);
  const radius = Math.round(px * RADIUS_RATIO);
  const html = `<!doctype html><html><head><meta charset="utf-8">
<style>
  html,body{margin:0;padding:0;background:transparent;}
  .icon{
    width:${px}px;height:${px}px;
    border-radius:${radius}px;
    overflow:hidden;
    display:flex;align-items:center;justify-content:center;
    background:#ffffff;
  }
  .icon svg{display:block;width:${inner}px;height:${inner}px;flex:0 0 auto;min-width:${inner}px;min-height:${inner}px;}
</style>
</head><body><div class="icon">${SVG}</div></body></html>`;
  await page.setViewport({ width: px, height: px, deviceScaleFactor: 1 });
  await page.setContent(html, { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({
    path: path.join(OUT, name),
    omitBackground: true,
    clip: { x: 0, y: 0, width: px, height: px },
  });
  console.log(`wrote ${name}`);
}

// Plain favicon.svg copy (alias)
await fs.copyFile(path.join(OUT, '07a-paper-v.svg'), path.join(OUT, 'favicon.svg'));
console.log('wrote favicon.svg');

await browser.close();
