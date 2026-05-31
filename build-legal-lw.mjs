import fs from 'fs';

// --- Extract the verbatim legal content (hero + main) from the originals ---
function extractContent(file) {
  const html = fs.readFileSync(file, 'utf8');
  const start = html.indexOf('<header class="legal-hero">');
  const end = html.indexOf('</main>');
  if (start < 0 || end < 0) throw new Error('markers not found in ' + file);
  return html.slice(start, end + '</main>'.length).trim();
}

const impressumContent = extractContent('impressum.html');
const datenschutzContent = extractContent('datenschutz.html');

// --- Cookie banner: markup + JS (Test-Modus: schliesst nur, blockt/lädt nichts) ---
const cookieMarkup = (dsHref) => `
  <!-- ===================== COOKIE-BANNER (Test-Modus) ===================== -->
  <div class="cookie-backdrop" id="cookieBackdrop" hidden></div>
  <div class="cookie-banner" id="cookieBanner" hidden role="dialog" aria-modal="true" aria-labelledby="cookieTitle" aria-describedby="cookieText">
    <p class="cookie-title" id="cookieTitle">Cookies &amp; Tracking</p>
    <p class="cookie-text" id="cookieText">
      Wir nutzen Cookies und ähnliche Technologien (u.&nbsp;a. Meta Pixel &amp; Conversions API, Microsoft Clarity, Google Ads Conversion-Tracking) für Reichweitenmessung, Verhaltensanalyse und um relevante Anzeigen auszuspielen. Einwilligung jederzeit widerrufbar. Details in der <a href="${dsHref}">Datenschutzerklärung</a>.
    </p>
    <div class="cookie-actions">
      <button type="button" class="cookie-btn cookie-btn-ghost" id="cookieDecline">Nur notwendige</button>
      <button type="button" class="cookie-btn cookie-btn-primary" id="cookieAccept">Alle akzeptieren</button>
    </div>
  </div>`;

const cookieJS = `
  <script>
    /* Cookie-Banner · TEST-MODUS: beide Buttons schliessen nur das Banner.
       Es wird kein Tracking geladen und nichts geblockt. */
    (function(){
      var KEY = 'vf_lw_cookie';
      var banner = document.getElementById('cookieBanner');
      var backdrop = document.getElementById('cookieBackdrop');
      if(!banner || !backdrop) return;
      var seen = null; try { seen = localStorage.getItem(KEY); } catch(e) {}
      if(!seen){ banner.hidden = false; backdrop.hidden = false; }
      function dismiss(){
        banner.hidden = true; backdrop.hidden = true;
        try { localStorage.setItem(KEY, '1'); } catch(e) {}
      }
      var a = document.getElementById('cookieAccept'); if(a) a.addEventListener('click', dismiss);
      var d = document.getElementById('cookieDecline'); if(d) d.addEventListener('click', dismiss);
    })();
  </script>`;

// --- Shared cookie-banner CSS (Homepage-Look, literale Werte → in beiden Shells gleich) ---
const cookieCSS = `
    /* ---------- Cookie-Banner (zentriert, Backdrop-Blur · wie Homepage) ---------- */
    .cookie-banner{position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);width:calc(100% - 32px);max-width:460px;text-align:center;background:#FFFFFF;border:1px solid #E5E3DD;border-radius:14px;box-shadow:0 18px 48px rgba(15,15,15,.18),0 2px 8px rgba(15,15,15,.08);padding:22px 22px 20px;z-index:1100;font-family:'Inter',system-ui,sans-serif;animation:cookieRise 280ms cubic-bezier(.22,1,.36,1)}
    @keyframes cookieRise{from{transform:translate(-50%,calc(-50% + 12px));opacity:0}to{transform:translate(-50%,-50%);opacity:1}}
    .cookie-backdrop{position:fixed;inset:0;background:rgba(15,15,15,.32);backdrop-filter:blur(2px);-webkit-backdrop-filter:blur(2px);z-index:1099;animation:cookieFade 220ms ease-out}
    .cookie-backdrop[hidden]{display:none}
    @keyframes cookieFade{from{opacity:0}to{opacity:1}}
    .cookie-banner[hidden]{display:none}
    .cookie-title{font-size:14.5px;font-weight:600;margin:0 0 6px;color:#1A1A1A;letter-spacing:-.005em}
    .cookie-text{font-size:13px;line-height:1.55;color:#5C5C5C;margin:0 0 14px}
    .cookie-text a{color:#C8633E;border-bottom:1px solid currentColor;text-decoration:none}
    .cookie-text a:hover{color:#B05530}
    .cookie-actions{display:flex;gap:8px;justify-content:center;flex-wrap:wrap}
    .cookie-btn{padding:9px 14px;font-size:13px;font-weight:500;font-family:inherit;border-radius:8px;cursor:pointer;transition:background-color 160ms ease,color 160ms ease,border-color 160ms ease}
    .cookie-btn:focus-visible{outline:2px solid #C8633E;outline-offset:2px}
    .cookie-btn-ghost{background:transparent;color:#5C5C5C;border:1px solid #C7C4BB}
    .cookie-btn-ghost:hover{color:#1A1A1A;border-color:#1A1A1A}
    .cookie-btn-primary{background:#C8633E;color:#FFFFFF;border:1px solid #C8633E}
    .cookie-btn-primary:hover{background:#B05530;border-color:#B05530}
    @media (max-width:480px){.cookie-banner{width:calc(100% - 24px);padding:18px 16px 16px}.cookie-actions{flex-direction:column-reverse}.cookie-btn{width:100%}}`;

// ===================== VARIANT A (dark · Instrument Serif + Barlow) =====================
function shellA({ title, content, dsHref, backHref, impHref, dsFootHref }) {
  return `<!doctype html>
<html lang="de">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
  <title>${title} — vorflows</title>
  <meta name="robots" content="noindex, follow" />
  <meta name="theme-color" content="#000000" />
  <meta name="color-scheme" content="dark" />
  <link rel="icon" type="image/png" sizes="32x32" href="/brand_assets/logos/favicon-32.png" />
  <link rel="icon" type="image/png" sizes="16x16" href="/brand_assets/logos/favicon-16.png" />
  <link rel="apple-touch-icon" sizes="180x180" href="/brand_assets/logos/apple-touch-icon.png" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Barlow:wght@300;400;500;600&family=Instrument+Serif:ital@0;1&display=swap" rel="stylesheet" />
  <style>
    /* vorflows · Rechtstext (Variante A · startupads-Slide-Design, ohne Home-Navigation) */
    :root{
      --font-heading:'Instrument Serif','Times New Roman',serif;
      --font-body:'Barlow',system-ui,-apple-system,sans-serif;
      --bg:#000;--surface-1:rgba(255,255,255,.04);
      --text-1:#fff;--text-2:rgba(255,255,255,.76);--text-3:rgba(255,255,255,.52);--text-4:rgba(255,255,255,.40);
      --line-subtle:rgba(255,255,255,.07);--line-medium:rgba(255,255,255,.12);
      --acc:#C8633E;--r-pill:9999px;--maxw:1180px;--gut:20px;--ease:cubic-bezier(.16,1,.3,1);
    }
    *{box-sizing:border-box;margin:0;padding:0}
    html{scroll-behavior:smooth;-webkit-text-size-adjust:100%}
    body{background:var(--bg);color:var(--text-2);font-family:var(--font-body);font-weight:300;line-height:1.65;-webkit-font-smoothing:antialiased;overflow-x:hidden;position:relative;font-size:16px}
    body::before{content:"";position:fixed;inset:0;z-index:0;pointer-events:none;opacity:.42;mix-blend-mode:screen;
      background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.03 0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>");
      background-size:220px 220px}
    a{color:inherit}
    strong{font-weight:500;color:var(--text-1)}
    em{font-style:italic}

    .nav{position:sticky;top:0;z-index:40;backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);background:rgba(0,0,0,.62);border-bottom:1px solid var(--line-subtle);padding-top:env(safe-area-inset-top)}
    .nav-in{max-width:var(--maxw);margin:0 auto;padding:12px var(--gut);display:flex;align-items:center;justify-content:space-between;gap:12px}
    .nav .mark{height:22px;width:auto;display:block}
    .nav-back{display:inline-flex;align-items:center;gap:7px;font-size:14px;color:var(--text-3);text-decoration:none;transition:color .16s var(--ease)}
    .nav-back:hover{color:var(--text-1)}
    .nav-back:focus-visible{outline:2px solid var(--acc);outline-offset:3px;border-radius:4px}

    .legal-hero{position:relative;z-index:2;padding:56px 0 28px}
    .container-prose{position:relative;z-index:2;width:100%;max-width:760px;margin:0 auto;padding:0 var(--gut)}
    .legal-eyebrow{font-family:var(--font-body);font-weight:500;font-size:12px;letter-spacing:.2em;text-transform:uppercase;color:var(--text-3);display:inline-flex;align-items:center;gap:12px;margin-bottom:16px}
    .legal-eyebrow::before{content:"";width:24px;height:2px;background:var(--acc);opacity:.9}
    .legal-h1{font-family:var(--font-heading);font-style:italic;font-weight:400;color:#fff;letter-spacing:-.03em;line-height:1.02;font-size:clamp(34px,9vw,72px)}
    .legal-h1 em{font-style:italic}
    .legal-lead{font-family:var(--font-body);font-weight:300;font-size:clamp(16px,4.4vw,20px);line-height:1.5;color:var(--text-2);margin-top:16px;max-width:54ch}
    .legal-body{position:relative;z-index:2;padding:8px 0 64px}
    .legal-section{padding:28px 0;border-top:1px solid var(--line-subtle)}
    .legal-section:first-child{border-top:0}
    .legal-section h2{font-family:var(--font-heading);font-style:italic;font-weight:400;color:#fff;letter-spacing:-.02em;font-size:clamp(20px,4.6vw,28px);margin-bottom:14px}
    .legal-section .body{color:var(--text-2);font-size:16px;line-height:1.7}
    .legal-section .body p{margin-bottom:12px}
    .legal-section .body p:last-child{margin-bottom:0}
    .legal-section .body strong{display:block;color:var(--text-1);font-weight:500;margin-bottom:6px}
    .legal-section .body a{color:var(--acc);text-decoration:none;border-bottom:1px solid rgba(200,99,62,.42)}
    .legal-section .body a:hover{color:#fff}
    .id-row{display:inline-block;font-family:var(--font-body);font-weight:500;color:var(--text-1);background:var(--surface-1);border:1px solid var(--line-medium);border-radius:8px;padding:8px 14px;letter-spacing:.04em;margin-top:4px}

    footer{position:relative;z-index:2;border-top:1px solid var(--line-subtle);padding:32px 0 calc(32px + env(safe-area-inset-bottom))}
    .foot-in{max-width:var(--maxw);margin:0 auto;padding:0 var(--gut);display:flex;flex-direction:column;gap:18px}
    .foot-in .mark{height:18px;width:auto;opacity:.8}
    .foot-links{display:flex;gap:18px;flex-wrap:wrap;font-size:14px}
    .foot-links a{color:var(--text-3);text-decoration:none}
    .foot-links a:hover{color:var(--text-1)}
    .foot-copy{font-size:12px;color:var(--text-4);letter-spacing:.03em}
${cookieCSS}
  </style>
</head>
<body>

  <!-- NAV · kein Home-Link · Logo ist statisch, Back führt nur zum Workshop -->
  <header class="nav">
    <div class="nav-in">
      <img class="mark" src="/brand_assets/logos/10d.1-wordmark-dark.svg" alt="vorflows" width="110" height="22" />
      <a class="nav-back" href="${backHref}" aria-label="Zurück zum Live-Workshop">&larr;&nbsp;Zum Workshop</a>
    </div>
  </header>

  ${content}

  <!-- FOOTER · ohne Startseite-Link -->
  <footer>
    <div class="foot-in">
      <img class="mark" src="/brand_assets/logos/10d.1-wordmark-dark.svg" alt="vorflows" width="100" height="20" />
      <nav class="foot-links">
        <a href="${impHref}">Impressum</a>
        <a href="${dsFootHref}">Datenschutz</a>
        <a href="mailto:alex@adolution.de">Kontakt</a>
      </nav>
      <span class="foot-copy">© 2026 vorflows</span>
    </div>
  </footer>
${cookieMarkup(dsHref)}
${cookieJS}
</body>
</html>
`;
}

// ===================== VARIANT B (light · Fraunces + Inter + JetBrains Mono) =====================
function shellB({ title, content, dsHref, backHref, impHref, dsFootHref }) {
  return `<!doctype html>
<html lang="de">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
  <title>${title} — vorflows</title>
  <meta name="robots" content="noindex, follow" />
  <meta name="theme-color" content="#FAFAF7" />
  <meta name="color-scheme" content="light" />
  <link rel="icon" type="image/png" sizes="32x32" href="/brand_assets/logos/favicon-32.png" />
  <link rel="icon" type="image/png" sizes="16x16" href="/brand_assets/logos/favicon-16.png" />
  <link rel="apple-touch-icon" sizes="180x180" href="/brand_assets/logos/apple-touch-icon.png" />
  <link rel="preload" as="font" type="font/woff2" href="/assets/fonts/fraunces-400-latin.woff2" crossorigin />
  <link rel="preload" as="font" type="font/woff2" href="/assets/fonts/inter-400-latin.woff2" crossorigin />
  <link rel="preload" as="style" href="/assets/fonts/fonts.css" onload="this.onload=null;this.rel='stylesheet'" />
  <noscript><link rel="stylesheet" href="/assets/fonts/fonts.css"></noscript>
  <style>
    /* vorflows · Rechtstext (Variante B · Homepage-Editorial, ohne Home-Navigation) */
    :root{
      --bg-light:#FAFAF7;--bg-dark:#0F0F0F;--text-primary:#1A1A1A;--text-inverse:#EAEAE5;
      --text-secondary:#5C5C5C;--text-secondary-dark:#8A8A82;--border:#E5E3DD;--border-strong:#C7C4BB;
      --accent:#C8633E;--accent-hover:#B05530;--ease-out-expo:cubic-bezier(.16,1,.3,1);
    }
    *{box-sizing:border-box}
    html{scroll-behavior:smooth;-webkit-text-size-adjust:100%}
    html,body{overflow-x:clip}
    body{margin:0;background:var(--bg-light);color:var(--text-primary);font-family:'Inter',system-ui,-apple-system,sans-serif;font-weight:400;font-size:17px;line-height:1.6;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;font-feature-settings:"ss01","cv11"}
    a{color:inherit}
    em{font-style:italic}
    .container{max-width:1200px;margin:0 auto;padding-inline:clamp(20px,4vw,48px)}

    .nav{position:sticky;top:0;z-index:50;background:rgba(250,250,247,.96);backdrop-filter:saturate(180%) blur(14px);-webkit-backdrop-filter:saturate(180%) blur(14px);border-bottom:1px solid var(--border);padding-top:env(safe-area-inset-top)}
    .nav-inner{height:64px;display:flex;align-items:center;justify-content:space-between;gap:14px}
    .wordmark{font-family:'Fraunces',Georgia,serif;font-weight:500;font-size:22px;letter-spacing:-.02em;font-feature-settings:"ss01";color:var(--text-primary);text-decoration:none}
    .wordmark .flows{font-style:italic;font-weight:500;color:var(--accent)}
    .nav-back{display:inline-flex;align-items:center;gap:7px;font-family:'JetBrains Mono',monospace;font-size:13px;color:var(--text-secondary);text-decoration:none;transition:color 150ms ease}
    .nav-back:hover{color:var(--text-primary)}
    .nav-back:focus-visible{outline:2px solid var(--accent);outline-offset:3px;border-radius:4px}

    .legal-hero{padding:64px 0 32px;border-bottom:1px solid var(--border)}
    .container-prose{max-width:760px;margin:0 auto;padding-inline:clamp(20px,4vw,48px)}
    .legal-eyebrow{font-family:'JetBrains Mono',monospace;font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:var(--accent);margin-bottom:16px}
    .legal-h1{font-family:'Fraunces',Georgia,serif;font-weight:500;letter-spacing:-.02em;line-height:1.05;color:var(--text-primary);font-size:clamp(34px,7vw,60px)}
    .legal-h1 em{font-style:italic;font-weight:400}
    .legal-lead{font-size:clamp(16px,2.4vw,19px);line-height:1.6;color:var(--text-secondary);margin-top:16px;max-width:56ch}
    .legal-body{padding:8px 0 72px}
    .legal-section{padding:32px 0;border-bottom:1px solid var(--border)}
    .legal-section h2{font-family:'Fraunces',Georgia,serif;font-weight:500;letter-spacing:-.01em;font-size:clamp(20px,3.4vw,26px);color:var(--text-primary);margin-bottom:14px}
    .legal-section .body{color:var(--text-secondary);font-size:16px;line-height:1.75}
    .legal-section .body p{margin:0 0 12px}
    .legal-section .body p:last-child{margin-bottom:0}
    .legal-section .body strong{display:block;color:var(--text-primary);font-weight:600;margin-bottom:6px}
    .legal-section .body a{color:var(--accent);text-decoration:none;border-bottom:1px solid rgba(200,99,62,.4)}
    .legal-section .body a:hover{color:var(--accent-hover)}
    .id-row{display:inline-block;font-family:'JetBrains Mono',monospace;color:var(--text-primary);background:#fff;border:1px solid var(--border-strong);border-radius:8px;padding:8px 14px;letter-spacing:.04em;margin-top:4px}

    footer{background:var(--bg-dark);color:var(--text-inverse);padding:48px 0 calc(40px + env(safe-area-inset-bottom))}
    .foot-in{display:flex;flex-direction:column;gap:18px}
    .foot-links{display:flex;gap:22px;flex-wrap:wrap;font-size:14px}
    .foot-links a{color:var(--text-secondary-dark);text-decoration:none}
    .foot-links a:hover{color:var(--text-inverse)}
    .foot-copy{font-size:12px;color:var(--text-secondary-dark);letter-spacing:.02em}
${cookieCSS}
  </style>
</head>
<body>

  <!-- NAV · kein Home-Link · Wordmark statisch, Back führt nur zum Workshop -->
  <header class="nav">
    <div class="container">
      <div class="nav-inner">
        <span class="wordmark">vor<span class="flows">flows</span></span>
        <a class="nav-back" href="${backHref}" aria-label="Zurück zum Live-Workshop">&larr;&nbsp;Zum Workshop</a>
      </div>
    </div>
  </header>

  <div class="container">
  ${content}
  </div>

  <!-- FOOTER · ohne Startseite-Link -->
  <footer>
    <div class="container">
      <div class="foot-in">
        <span class="wordmark" style="color:var(--text-inverse)">vor<span class="flows">flows</span></span>
        <nav class="foot-links">
          <a href="${impHref}">Impressum</a>
          <a href="${dsFootHref}">Datenschutz</a>
          <a href="mailto:alex@adolution.de">Kontakt</a>
        </nav>
        <span class="foot-copy">© 2026 vorflows</span>
      </div>
    </div>
  </footer>
${cookieMarkup(dsHref)}
${cookieJS}
</body>
</html>
`;
}

// --- Emit the four pages ---
const pages = [
  { file: 'impressum-lw-a.html',   shell: shellA, title: 'Impressum',     content: impressumContent,   dsHref: '/datenschutz-lw-a', backHref: '/live-workshop',   impHref: '/impressum-lw-a', dsFootHref: '/datenschutz-lw-a' },
  { file: 'datenschutz-lw-a.html', shell: shellA, title: 'Datenschutz',   content: datenschutzContent, dsHref: '/datenschutz-lw-a', backHref: '/live-workshop',   impHref: '/impressum-lw-a', dsFootHref: '/datenschutz-lw-a' },
  { file: 'impressum-lw-b.html',   shell: shellB, title: 'Impressum',     content: impressumContent,   dsHref: '/datenschutz-lw-b', backHref: '/live-workshop-b', impHref: '/impressum-lw-b', dsFootHref: '/datenschutz-lw-b' },
  { file: 'datenschutz-lw-b.html', shell: shellB, title: 'Datenschutz',   content: datenschutzContent, dsHref: '/datenschutz-lw-b', backHref: '/live-workshop-b', impHref: '/impressum-lw-b', dsFootHref: '/datenschutz-lw-b' },
];

for (const p of pages) {
  fs.writeFileSync(p.file, p.shell(p));
  console.log('wrote', p.file);
}
console.log('done');
