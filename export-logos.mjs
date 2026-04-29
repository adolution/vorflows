// Export Vorflows logos: 10d.1 wordmark and 07a (v, f) — SVG + PNG.
import fs from 'node:fs/promises';
import path from 'node:path';
import puppeteer from 'puppeteer';

const OUT = path.resolve('brand_assets/logos');
await fs.mkdir(OUT, { recursive: true });

const ACCENT = '#C8633E';
const INK = '#1A1A1A';
const PAPER = '#FAFAF7';

const UA_WOFF2 = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36';
const fontsCssUrl = 'https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,500;1,9..144,500&family=JetBrains+Mono:wght@500&display=swap';
const cssRes = await fetch(fontsCssUrl, { headers: { 'User-Agent': UA_WOFF2 } });
const css = await cssRes.text();

function pickFace(family, style, weight) {
  const blocks = [...css.matchAll(new RegExp(`@font-face\\s*\\{[^}]*?font-family:\\s*'${family}';[^}]*?font-style:\\s*${style};[^}]*?font-weight:\\s*${weight};[^}]*?src:\\s*url\\((https:[^)]+)\\)\\s*format\\('woff2'\\);[^}]*?unicode-range:\\s*([^;]+);[^}]*?\\}`, 'g'))];
  if (!blocks.length) throw new Error(`No face for ${family} ${style} ${weight}`);
  const latin = blocks.find(b => b[2].includes('U+0000-00FF') || b[2].includes('U+0-FF')) || blocks.at(-1);
  return latin[1];
}

const faces = {
  fraunces500: pickFace('Fraunces', 'normal', 500),
  fraunces500i: pickFace('Fraunces', 'italic', 500),
  jbmono500: pickFace('JetBrains Mono', 'normal', 500),
};

const b64 = {};
for (const [k, url] of Object.entries(faces)) {
  const r = await fetch(url);
  const buf = Buffer.from(await r.arrayBuffer());
  b64[k] = buf.toString('base64');
  console.log(`fetched ${k}: ${buf.length} bytes`);
}

const fontFaceCss = `
@font-face{font-family:'Fraunces';font-style:normal;font-weight:500;src:url(data:font/woff2;base64,${b64.fraunces500}) format('woff2');}
@font-face{font-family:'Fraunces';font-style:italic;font-weight:500;src:url(data:font/woff2;base64,${b64.fraunces500i}) format('woff2');}
@font-face{font-family:'JetBrains Mono';font-style:normal;font-weight:500;src:url(data:font/woff2;base64,${b64.jbmono500}) format('woff2');}
`.trim();

const svg_10d1 = (color = INK) => `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 220" width="800" height="220">
  <style>${fontFaceCss}
    .wm{font-family:'Fraunces',Georgia,serif;font-weight:500;font-size:140px;letter-spacing:-0.02em;font-feature-settings:"ss01";dominant-baseline:alphabetic;}
    .vor{fill:${color};}
    .flows{font-style:italic;fill:${ACCENT};}
  </style>
  <text x="400" y="148" text-anchor="middle" class="wm"><tspan class="vor">vor</tspan><tspan class="flows">flows</tspan></text>
</svg>`;

function svg_07a(char) {
  const SIZE = 320;
  const FS = 161.2;
  const SHIFT = -10.4;
  const x0 = SIZE / 2;
  const y0 = SIZE / 2 + FS * 0.34;
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${SIZE} ${SIZE}" width="${SIZE}" height="${SIZE}">
  <style>${fontFaceCss}
    .bg{fill:${PAPER};}
    .caret{font-family:'JetBrains Mono',ui-monospace,monospace;font-weight:500;font-size:${FS}px;fill:${ACCENT};dominant-baseline:alphabetic;}
    .glyph{font-family:'Fraunces',Georgia,serif;font-style:italic;font-weight:500;font-size:${FS}px;fill:${INK};dominant-baseline:alphabetic;}
  </style>
  <rect class="bg" x="0" y="0" width="${SIZE}" height="${SIZE}"/>
  <text x="${x0}" y="${y0}" text-anchor="middle" dominant-baseline="alphabetic"><tspan class="caret">›</tspan><tspan class="glyph" dx="${SHIFT}">${char}</tspan></text>
</svg>`;
}

const outputs = {
  '10d.1-wordmark.svg': svg_10d1(INK),
  '10d.1-wordmark-dark.svg': svg_10d1('#EAEAE5'),
  '07a-paper-v.svg': svg_07a('v'),
  '07a-paper-f.svg': svg_07a('f'),
};

for (const [name, content] of Object.entries(outputs)) {
  await fs.writeFile(path.join(OUT, name), content, 'utf8');
  console.log(`wrote ${name} (${content.length} bytes)`);
}

const browser = await puppeteer.launch({ headless: 'new' });
const page = await browser.newPage();
const SCALE = 4;

for (const [name, svg] of Object.entries(outputs)) {
  const m = svg.match(/viewBox="0 0 (\d+(?:\.\d+)?) (\d+(?:\.\d+)?)"/);
  const W = parseFloat(m[1]);
  const H = parseFloat(m[2]);
  const html = `<!doctype html><html><head><meta charset="utf-8">
<style>html,body{margin:0;padding:0;background:transparent;}svg{display:block;}</style>
</head><body>${svg}</body></html>`;
  await page.setViewport({ width: Math.ceil(W), height: Math.ceil(H), deviceScaleFactor: SCALE });
  await page.setContent(html, { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => document.fonts.ready);
  const pngName = name.replace(/\.svg$/, '.png');
  const transparent = !name.startsWith('07a-paper');
  await page.screenshot({
    path: path.join(OUT, pngName),
    omitBackground: transparent,
    clip: { x: 0, y: 0, width: W, height: H },
  });
  console.log(`rendered ${pngName} @ ${SCALE}x = ${Math.ceil(W*SCALE)}x${Math.ceil(H*SCALE)}`);
}

await browser.close();
console.log('Done.');
