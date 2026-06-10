import fs from 'fs';

let failed = false;
function edit(content, file, find, replace, { required = true } = {}) {
  if (!content.includes(find)) {
    if (required) { console.error(`✗ [${file}] NOT FOUND: ${find.slice(0, 70).replace(/\n/g, '⏎')}`); failed = true; }
    return content;
  }
  return content.split(find).join(replace);
}
function countReplace(content, find, replace) {
  const n = content.split(find).length - 1;
  return [content.split(find).join(replace), n];
}

// ---- Shared schema strings (A + B identical) ----
const SCHEMA_NAME_FROM = '"vorflows Bundle (BaseFlow + SEOFlow + ClarityFlow) — Launch-Preis"';
const SCHEMA_NAME_TO   = '"vorflows Bundle (BaseFlow + SEOFlow + ClarityFlow)"';
const SCHEMA_DESC_FROM = '"Einmalkauf 297 € statt 597 € · 100 € Launch-Rabatt · oder 6 Raten à 49,50 € via Digistore24."';
const SCHEMA_DESC_TO   = '"Einmalkauf 597 € · oder 6 Raten à 100 € via Digistore24."';
const PRICESPEC_FROM = `            "priceSpecification": [
              {
                "@type": "UnitPriceSpecification",
                "priceType": "https://schema.org/SalePrice",
                "price": "297",
                "priceCurrency": "EUR",
                "valueAddedTaxIncluded": true,
                "validThrough": "2026-12-31"
              },
              {
                "@type": "UnitPriceSpecification",
                "priceType": "https://schema.org/ListPrice",
                "price": "597",
                "priceCurrency": "EUR",
                "valueAddedTaxIncluded": true
              }
            ],`;
const PRICESPEC_TO = `            "priceSpecification": {
              "@type": "UnitPriceSpecification",
              "priceType": "https://schema.org/ListPrice",
              "price": "597",
              "priceCurrency": "EUR",
              "valueAddedTaxIncluded": true
            },`;

const COUNTDOWN_JS_FROM = `      // ── Launch sale window — date-bound, no fake scarcity ──────────────
      // To change the deadline, edit LAUNCH_END below and sync the
      // priceValidUntil field in the Product JSON-LD at the top of <head>.
      const LAUNCH_START = new Date('2026-05-06T00:00:00+02:00');
      const LAUNCH_END   = new Date('2026-05-31T23:59:00+02:00');
      (function applyLaunchCountdown() {
        const now = new Date();
        const total = LAUNCH_END - LAUNCH_START;
        const remainingMs = LAUNCH_END - now;
        const remaining = Math.max(0, Math.min(total, remainingMs));
        const days = Math.max(0, Math.ceil(remainingMs / 86400000));
        const fillPct = total > 0 ? (remaining / total) * 100 : 0;
        const dateFmt = new Intl.DateTimeFormat('de-DE', { day: 'numeric', month: 'long' }).format(LAUNCH_END);
        const apply = () => {
          document.querySelectorAll('[data-launch-days]').forEach((el) => { el.textContent = days; });
          document.querySelectorAll('[data-launch-until]').forEach((el) => { el.textContent = dateFmt; });
          document.querySelectorAll('[data-launch-bar]').forEach((el) => { el.style.width = fillPct + '%'; });
          document.querySelectorAll('[data-launch-days-wrap]').forEach((el) => { el.hidden = false; });
          if (remainingMs <= 0) {
            document.querySelectorAll('[data-launch-expired]').forEach((el) => { el.hidden = false; });
            document.querySelectorAll('[data-launch-active]').forEach((el) => { el.hidden = true; });
          }
        };
        if (document.readyState === 'loading') {
          document.addEventListener('DOMContentLoaded', apply, { once: true });
        } else {
          apply();
        }
      })();

`;

// ============================== index.html (A) ==============================
{
  const f = 'index.html';
  let c = fs.readFileSync(f, 'utf8');
  c = edit(c, f, SCHEMA_NAME_FROM, SCHEMA_NAME_TO);
  c = edit(c, f, SCHEMA_DESC_FROM, SCHEMA_DESC_TO);
  c = edit(c, f, PRICESPEC_FROM, PRICESPEC_TO);
  c = edit(c, f, '<meta property="product:price:amount" content="297.00" />', '<meta property="product:price:amount" content="597.00" />');
  c = edit(c, f, 'nur das Bundle zum Launch-Preis.', 'nur das Bundle.'); // schema FAQ
  c = edit(c, f, '<div class="meta eyebrow">Launch-Preis</div>', '<div class="meta eyebrow">Einmalkauf</div>');
  // Launch-Sale header markup (active + expired)
  c = edit(c, f, `          <!-- ─────────────────────────────────────────────────────────────
               Launch-Sale window — date-bound. To change the deadline,
               edit LAUNCH_END in the main <script> tag (search for
               "Launch sale window") and sync priceValidUntil in JSON-LD.
               ───────────────────────────────────────────────────────────── -->
          <header class="bundle-hero-launch" data-launch-active>
            <div class="bundle-hero-launch-row">
              <span class="bundle-hero-launch-tag">Launch-Preis · spar 300&nbsp;€</span>
              <span class="bundle-hero-launch-count">Aktion bis <span data-launch-until>31. Mai</span><span data-launch-days-wrap hidden> · noch <strong data-launch-days>—</strong> Tage</span></span>
            </div>
            <div class="bundle-hero-launch-track" aria-hidden="true">
              <div class="bundle-hero-launch-fill" data-launch-bar style="width: 100%"></div>
            </div>
          </header>
          <header class="bundle-hero-launch bundle-hero-launch--soldout" data-launch-expired hidden>
            <span class="bundle-hero-launch-tag">Launch-Preis abgelaufen</span>
            <span class="bundle-hero-launch-count">Bundle dauerhaft zu 597&nbsp;€</span>
          </header>
`, '');
  // Price block
  c = edit(c, f, `                  <span class="bundle-hero-price"><span data-count-to="297" data-count-suffix="&nbsp;€">297&nbsp;€</span></span>
                  <span class="bundle-hero-strike">597&nbsp;€</span>
                  <span class="bundle-hero-suffix">einmalig · dauerhaft besitzen</span>`,
`                  <span class="bundle-hero-price">597&nbsp;€</span>
                  <span class="bundle-hero-suffix">einmalig · dauerhaft besitzen</span>`);
  c = edit(c, f, '<span class="bp-alt-price">49,50&nbsp;€<span class="bp-alt-unit">/Monat</span></span>', '<span class="bp-alt-price">100&nbsp;€<span class="bp-alt-unit">/Monat</span></span>');
  // CTA voucher + text
  c = edit(c, f, 'https://www.digistore24.com/product/688983?voucher=launchsale&ds24tr=vf_ab_A', 'https://www.digistore24.com/product/688983?ds24tr=vf_ab_A');
  // Sticky: drop launch label line
  c = edit(c, f, `        <span class="sticky-cta-label">Launch-Preis · spar 300&nbsp;€</span>
        <span class="sticky-cta-price">Bundle <strong>297&nbsp;€</strong></span>`,
`        <span class="sticky-cta-price">Bundle <strong>597&nbsp;€</strong></span>`);
  // Countdown JS
  c = edit(c, f, COUNTDOWN_JS_FROM, '');
  // Blanket numeric
  let n1, n2;
  [c, n1] = countReplace(c, '297', '597');
  [c, n2] = countReplace(c, '49,50', '100');
  fs.writeFileSync(f, c);
  console.log(`✓ ${f} — blanket 297→597 ×${n1}, 49,50→100 ×${n2}`);
}

// ============================== index-b.html (B) ==============================
{
  const f = 'index-b.html';
  let c = fs.readFileSync(f, 'utf8');
  c = edit(c, f, SCHEMA_NAME_FROM, SCHEMA_NAME_TO);
  c = edit(c, f, SCHEMA_DESC_FROM, SCHEMA_DESC_TO);
  c = edit(c, f, PRICESPEC_FROM, PRICESPEC_TO);
  c = edit(c, f, '<meta property="product:price:amount" content="297.00" />', '<meta property="product:price:amount" content="597.00" />');
  c = edit(c, f, 'nur das Bundle zum Launch-Preis.', 'nur das Bundle.');
  // offer-meta launch pill
  c = edit(c, f, `          <div class="offer-meta">
            <span class="offer-meta-pill">Launch-Preis · spar 300&nbsp;€</span>
          </div>
`, '');
  // price: drop strike
  c = edit(c, f, `            <span class="offer-price-now">297&nbsp;€</span>
            <span class="offer-price-was">597&nbsp;€</span>`,
`            <span class="offer-price-now">597&nbsp;€</span>`);
  // pricing note
  c = edit(c, f, 'Einmalkauf · oder <strong>6&nbsp;× 49,50&nbsp;€/Monat</strong> über Digistore24.', 'Einmalkauf · oder <strong>6&nbsp;× 100&nbsp;€/Monat</strong> über Digistore24.');
  // CTA voucher
  c = edit(c, f, 'https://www.digistore24.com/product/688983?voucher=launchsale&ds24tr=vf_ab_B', 'https://www.digistore24.com/product/688983?ds24tr=vf_ab_B');
  // sticky launch label
  c = edit(c, f, `        <span class="sticky-cta-label">Launch · spar 300&nbsp;€</span>
`, '');
  // countdown JS
  c = edit(c, f, COUNTDOWN_JS_FROM, '');
  let n1, n2;
  [c, n1] = countReplace(c, '297', '597');
  [c, n2] = countReplace(c, '49,50', '100');
  fs.writeFileSync(f, c);
  console.log(`✓ ${f} — blanket 297→597 ×${n1}, 49,50→100 ×${n2}`);
}

// ============================== module pages ==============================
for (const f of ['baseflow.html', 'seoflow.html', 'clarityflow.html']) {
  let c = fs.readFileSync(f, 'utf8');
  c = edit(c, f, 'zum Launch-Preis 297 €', 'zum Preis von 597 €', { required: false });
  c = c.split(' statt 597 €').join(''); // remove discount framing everywhere
  let n;
  [c, n] = countReplace(c, '297', '597');
  fs.writeFileSync(f, c);
  console.log(`✓ ${f} — 297→597 ×${n}, removed " statt 597 €"`);
}

// ============================== danke + datenschutz (numeric only) ==============================
for (const f of ['danke.html', 'datenschutz.html', 'datenschutz-lw-a.html', 'datenschutz-lw-b.html']) {
  let c = fs.readFileSync(f, 'utf8');
  let n;
  [c, n] = countReplace(c, '297', '597');
  fs.writeFileSync(f, c);
  console.log(`✓ ${f} — 297→597 ×${n}`);
}

if (failed) { console.error('\n✗ SOME REQUIRED FINDS MISSING — review above.'); process.exit(1); }
console.log('\n✓ all edits applied');
