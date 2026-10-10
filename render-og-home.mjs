// Rendert brand_assets/og-home.jpg (1200×630) für die Startseite.
// Braucht den lokalen Server (node serve.mjs), damit Schriften und Bilder aus /assets laden.
import puppeteer from 'puppeteer';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const out = path.join(__dirname, 'brand_assets', 'og-home.jpg');
const base = process.argv[2] || 'http://localhost:3001';

const html = `<!doctype html>
<html lang="de"><head><meta charset="utf-8"/>
<base href="${base}/" />
<link rel="stylesheet" href="assets/fonts/fonts.css" />
<style>
  * { box-sizing: border-box; }
  html, body { margin: 0; }
  body {
    width: 1200px; height: 630px; overflow: hidden; position: relative;
    background: #0E0E0D; color: #EDECE7;
    font-family: 'Inter', system-ui, sans-serif;
    -webkit-font-smoothing: antialiased;
  }
  .light {
    position: absolute; inset: 0;
    background:
      radial-gradient(700px 420px at 40% -10%, rgba(237,236,231,.08), transparent 62%),
      radial-gradient(560px 420px at 0% 70%, rgba(200,99,62,.16), transparent 66%),
      radial-gradient(520px 380px at 100% 100%, rgba(200,99,62,.08), transparent 70%);
  }
  .stage { position: relative; display: grid; grid-template-columns: 1fr 330px; gap: 56px; align-items: center; height: 100%; padding: 64px 72px; }
  .wordmark { font-family: 'Fraunces', Georgia, serif; font-weight: 500; font-size: 34px; letter-spacing: -.02em; }
  .wordmark i { color: #C8633E; }
  h1 {
    margin: 34px 0 0; font-family: 'Fraunces', Georgia, serif; font-weight: 400;
    font-size: 62px; line-height: 1.05; letter-spacing: -.033em; font-variation-settings: "opsz" 60;
  }
  h1 em.s { color: #A9CF68; } h1 em.m { color: #4DA6FF; }
  .chips { display: flex; gap: 14px; margin-top: 38px; }
  .chip { display: inline-flex; align-items: center; gap: 10px; padding: 9px 16px; border-radius: 999px; border: 1px solid #33322E; background: #151514; font-size: 19px; font-weight: 500; }
  .chip i { width: 10px; height: 10px; border-radius: 50%; }
  .photo { position: relative; border-radius: 22px; overflow: hidden; border: 1px solid #33322E; aspect-ratio: 4 / 5; box-shadow: 0 30px 80px -20px rgba(0,0,0,.8), 0 40px 120px -40px rgba(200,99,62,.25); }
  .photo img { width: 100%; height: 100%; object-fit: cover; object-position: 55% 40%; display: block; }
  .photo::after { content: ""; position: absolute; inset: 0; background: linear-gradient(to top, rgba(10,10,9,.75), rgba(10,10,9,0) 45%); }
  .cap { position: absolute; left: 20px; bottom: 18px; z-index: 1; font-size: 17px; line-height: 1.35; color: #B6B4AC; }
  .cap b { display: block; color: #EDECE7; font-weight: 500; font-size: 20px; }
</style></head>
<body>
  <div class="light"></div>
  <div class="stage">
    <div>
      <div class="wordmark">vor<i>flows</i></div>
      <h1>vorflows macht aus Claude deinen <em class="s">Shopify&#8209;Entwickler</em> und dein <em class="m">Anzeigen&#8209;Team</em></h1>
      <div class="chips">
        <span class="chip"><i style="background:#95BF47"></i>vorflows für Shopify</span>
        <span class="chip"><i style="background:#0081FB"></i>AdsFlow für Meta Ads</span>
      </div>
    </div>
    <div class="photo">
      <img src="assets/images/home/alex-lifestyle-640.webp" alt="" />
      <p class="cap"><b>Alexander Dück</b>Gründer von vorflows</p>
    </div>
  </div>
</body></html>`;

const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
const page = await browser.newPage();
await page.setViewport({ width: 1200, height: 630, deviceScaleFactor: 1 });
await page.goto(base, { waitUntil: 'domcontentloaded' });
await page.setContent(html, { waitUntil: 'networkidle0' });
await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: out, type: 'jpeg', quality: 88 });
await browser.close();
console.log('og-home.jpg geschrieben:', out);
