import puppeteer from 'puppeteer';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const out = path.join(__dirname, 'brand_assets', 'og-image.png');

const html = `<!doctype html>
<html lang="de"><head><meta charset="utf-8"/>
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;1,9..144,500&family=Inter:wght@400;500;600&display=swap" rel="stylesheet"/>
<style>
  :root {
    --bg: #FAFAF7;
    --ink: #1A1A1A;
    --ink-soft: #5C5C5C;
    --accent: #C8633E;
    --line: #E5E3DD;
  }
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; }
  body {
    width: 1200px; height: 630px;
    background: var(--bg);
    font-family: 'Inter', system-ui, sans-serif;
    color: var(--ink);
    position: relative;
    overflow: hidden;
  }
  .bg-grain {
    position: absolute; inset: 0;
    background:
      radial-gradient(1100px 600px at 85% 20%, rgba(200,99,62,0.10), transparent 60%),
      radial-gradient(800px 500px at 10% 90%, rgba(200,99,62,0.06), transparent 60%);
    pointer-events: none;
  }
  .stage {
    position: relative;
    width: 100%; height: 100%;
    display: grid;
    grid-template-columns: 1.15fr 0.85fr;
    align-items: center;
    padding: 64px 72px;
    gap: 32px;
  }
  .eyebrow {
    font-size: 16px;
    text-transform: uppercase;
    letter-spacing: 0.18em;
    color: var(--accent);
    font-weight: 600;
    margin-bottom: 18px;
  }
  h1 {
    font-family: 'Fraunces', Georgia, serif;
    font-weight: 500;
    font-size: 76px;
    line-height: 1.02;
    letter-spacing: -0.025em;
    margin: 0 0 22px;
  }
  h1 em {
    font-style: italic;
    color: var(--accent);
    font-weight: 500;
  }
  .sub {
    font-size: 22px;
    line-height: 1.45;
    color: var(--ink-soft);
    max-width: 520px;
    margin: 0;
  }
  .right {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .box {
    width: 100%;
    max-width: 420px;
    aspect-ratio: 1 / 1;
    background-image: url('http://localhost:3001/brand_assets/boxes/family-tonal-1x1-transparent.webp');
    background-size: contain;
    background-position: center;
    background-repeat: no-repeat;
    filter: drop-shadow(0 30px 60px rgba(200,99,62,0.18)) drop-shadow(0 8px 16px rgba(0,0,0,0.10));
  }
  .footer {
    position: absolute;
    left: 72px; bottom: 36px;
    display: flex; align-items: center; gap: 16px;
    font-size: 18px;
    color: var(--ink);
    font-weight: 600;
  }
  .dot {
    width: 10px; height: 10px;
    border-radius: 50%;
    background: var(--accent);
    box-shadow: 0 0 0 4px rgba(200,99,62,0.18);
  }
  .url {
    position: absolute;
    right: 72px; bottom: 36px;
    font-family: 'Inter', sans-serif;
    font-size: 16px;
    color: var(--ink-soft);
    letter-spacing: 0.04em;
  }
  .top-line {
    position: absolute;
    left: 0; right: 0; top: 0;
    height: 6px;
    background: linear-gradient(90deg, transparent, var(--accent), transparent);
  }
</style></head>
<body>
  <div class="bg-grain"></div>
  <div class="top-line"></div>
  <div class="stage">
    <div>
      <div class="eyebrow">Sections · SEO · CVR</div>
      <h1>Shopify-Store wie ein <em>Senior Dev</em> bauen.</h1>
      <p class="sub">Über Claude Code umbauen, ranken und konvertieren. Ohne Agentur, ohne App-Stack, ohne Dev-Team.</p>
    </div>
    <div class="right"><div class="box"></div></div>
  </div>
  <div class="footer"><span class="dot"></span> vorflows</div>
  <div class="url">vorflows.com</div>
</body></html>`;

const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
const page = await browser.newPage();
await page.setViewport({ width: 1200, height: 630, deviceScaleFactor: 1 });
await page.setContent(html, { waitUntil: 'networkidle0' });
await page.evaluateHandle('document.fonts.ready');
await new Promise(r => setTimeout(r, 400));
await page.screenshot({ path: out, type: 'png', omitBackground: false });
await browser.close();
console.log('Saved:', out);
