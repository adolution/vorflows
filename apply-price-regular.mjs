import fs from 'fs';

// ─────────────────────────────────────────────────────────────────────────
// REVERT the June-2026 webinar launch sale → regular price 897 € netto.
// Sale state being removed: 397 € netto, 897 € netto strike, voucher
// `launchsale`, countdown until 28.06.2026, "Launch-Preis · spar 500 €" strips.
// Regular state restored: 897 € netto, no strike, no voucher, no countdown.
// Countdown JS + .bundle-hero-launch* CSS are LEFT as dormant scaffolding
// (selectors match nothing once the markup is gone) so the sale re-enables
// fast. See SALE-PLAYBOOK.md for the full set/revert procedure.
// Run:  node apply-price-regular.mjs
// ─────────────────────────────────────────────────────────────────────────

let failed = false;
function edit(content, file, find, replace, { required = true } = {}) {
  if (!content.includes(find)) {
    if (required) { console.error(`✗ [${file}] NOT FOUND: ${find.slice(0, 80).replace(/\n/g, '⏎')}`); failed = true; }
    return content;
  }
  return content.split(find).join(replace);
}
function countReplace(content, find, replace) {
  const n = content.split(find).length - 1;
  return [content.split(find).join(replace), n];
}

// ---- Shared JSON-LD strings (A + B byte-identical) ----
const SCHEMA_NAME_FROM = '"vorflows Bundle (BaseFlow + SEOFlow + ClarityFlow) — Launch-Preis"';
const SCHEMA_NAME_TO   = '"vorflows Bundle (BaseFlow + SEOFlow + ClarityFlow)"';
const SCHEMA_DESC_FROM = '"Einmalkauf 397 € netto statt 897 € · befristete Aktion bis 28.06.2026 · Ratenzahlung möglich via Digistore24."';
const SCHEMA_DESC_TO   = '"Einmalkauf 897 € netto · Ratenzahlung möglich via Digistore24."';
const PRICEVALID_FROM  = '"priceValidUntil": "2026-06-28",';
const PRICEVALID_TO    = '"priceValidUntil": "2026-12-31",';
const PRICESPEC_FROM = `            "priceSpecification": [
              {
                "@type": "UnitPriceSpecification",
                "priceType": "https://schema.org/SalePrice",
                "price": "397",
                "priceCurrency": "EUR",
                "valueAddedTaxIncluded": false,
                "validThrough": "2026-06-28"
              },
              {
                "@type": "UnitPriceSpecification",
                "priceType": "https://schema.org/ListPrice",
                "price": "897",
                "priceCurrency": "EUR",
                "valueAddedTaxIncluded": false
              }
            ],`;
const PRICESPEC_TO = `            "priceSpecification": {
              "@type": "UnitPriceSpecification",
              "priceType": "https://schema.org/ListPrice",
              "price": "897",
              "priceCurrency": "EUR",
              "valueAddedTaxIncluded": false
            },`;
const STICKY_LABEL = '        <span class="sticky-cta-label">Launch-Preis · spar 500&nbsp;€</span>\n';

// ============================== index.html (A) ==============================
{
  const f = 'index.html';
  let c = fs.readFileSync(f, 'utf8');
  c = edit(c, f, SCHEMA_NAME_FROM, SCHEMA_NAME_TO);
  c = edit(c, f, SCHEMA_DESC_FROM, SCHEMA_DESC_TO);
  c = edit(c, f, PRICEVALID_FROM, PRICEVALID_TO);
  c = edit(c, f, PRICESPEC_FROM, PRICESPEC_TO);
  c = edit(c, f, '<meta property="product:price:amount" content="397.00" />', '<meta property="product:price:amount" content="897.00" />');
  // Launch-sale strip (active + expired headers) — remove, keep the HTML comment + CSS as scaffolding
  c = edit(c, f, `          <header class="bundle-hero-launch" data-launch-active>
            <div class="bundle-hero-launch-row">
              <span class="bundle-hero-launch-tag">Launch-Preis · spar 500&nbsp;€</span>
              <span class="bundle-hero-launch-count">Aktion bis <span data-launch-until>28. Juni</span><span data-launch-days-wrap hidden> · noch <strong data-launch-days>—</strong> Tage</span></span>
            </div>
            <div class="bundle-hero-launch-track" aria-hidden="true">
              <div class="bundle-hero-launch-fill" data-launch-bar style="width: 100%"></div>
            </div>
          </header>
          <header class="bundle-hero-launch bundle-hero-launch--soldout" data-launch-expired hidden>
            <span class="bundle-hero-launch-tag">Launch-Preis abgelaufen</span>
            <span class="bundle-hero-launch-count">Bundle wieder zum regulären Preis
          </header>
`, '');
  // Price block — drop strike, keep "netto"
  c = edit(c, f, `                  <span class="bundle-hero-price">397&nbsp;€</span>
                  <span class="bundle-hero-strike">897&nbsp;€</span>
                  <span class="bundle-hero-suffix">netto · einmalig · dauerhaft besitzen</span>`,
`                  <span class="bundle-hero-price">897&nbsp;€</span>
                  <span class="bundle-hero-suffix">netto · einmalig · dauerhaft besitzen</span>`);
  // Checkout link — drop voucher
  c = edit(c, f, 'https://www.digistore24.com/product/688983?voucher=launchsale&ds24tr=vf_ab_A', 'https://www.digistore24.com/product/688983?ds24tr=vf_ab_A');
  // Hero primary CTA — drop "statt 897" framing
  c = edit(c, f, 'Bundle sichern · 397&nbsp;€ statt 897&nbsp;€', 'Bundle sichern · 897&nbsp;€');
  // Sticky bar — drop launch label line
  c = edit(c, f, STICKY_LABEL, '');
  // Blanket: every remaining sale price + tracking value
  let n;
  [c, n] = countReplace(c, '397', '897');
  fs.writeFileSync(f, c);
  console.log(`✓ ${f} — blanket 397→897 ×${n}`);
}

// ============================== index-b.html (B) ==============================
{
  const f = 'index-b.html';
  let c = fs.readFileSync(f, 'utf8');
  c = edit(c, f, SCHEMA_NAME_FROM, SCHEMA_NAME_TO);
  c = edit(c, f, SCHEMA_DESC_FROM, SCHEMA_DESC_TO);
  c = edit(c, f, PRICEVALID_FROM, PRICEVALID_TO);
  c = edit(c, f, PRICESPEC_FROM, PRICESPEC_TO);
  c = edit(c, f, '<meta property="product:price:amount" content="397.00" />', '<meta property="product:price:amount" content="897.00" />');
  c = edit(c, f, STICKY_LABEL, '');
  // Transform-row inline price
  c = edit(c, f, 'Einmal 397&nbsp;€ netto statt 897&nbsp;€.', 'Einmal 897&nbsp;€ netto.');
  // Offer price — drop strike
  c = edit(c, f, `            <span class="offer-price-now">397&nbsp;€</span>
            <span class="offer-price-was">897&nbsp;€</span>`,
`            <span class="offer-price-now">897&nbsp;€</span>`);
  // Offer pricing note — drop Launch + countdown, keep netto + Ratenzahlung
  c = edit(c, f, '<p class="offer-pricing-note"><strong>Launch-Preis</strong> · netto · Aktion bis <span data-launch-until>28. Juni</span><span data-launch-days-wrap hidden> · noch <strong data-launch-days>—</strong> Tage</span> · <strong>Ratenzahlung möglich</strong> über Digistore24.</p>',
         '<p class="offer-pricing-note">Netto · <strong>Ratenzahlung möglich</strong> über Digistore24.</p>');
  // Checkout link — drop voucher
  c = edit(c, f, 'https://www.digistore24.com/product/688983?voucher=launchsale&ds24tr=vf_ab_B', 'https://www.digistore24.com/product/688983?ds24tr=vf_ab_B');
  let n;
  [c, n] = countReplace(c, '397', '897');
  fs.writeFileSync(f, c);
  console.log(`✓ ${f} — blanket 397→897 ×${n}`);
}

// ============================== module pages ==============================
for (const f of ['baseflow.html', 'seoflow.html', 'clarityflow.html']) {
  let c = fs.readFileSync(f, 'utf8');
  c = c.split('397 € netto (statt 897 €)').join('897 € netto');
  c = c.split('397 € netto statt 897 €').join('897 € netto');
  let n;
  [c, n] = countReplace(c, '397', '897');
  fs.writeFileSync(f, c);
  console.log(`✓ ${f} — 397→897 ×${n}, removed "statt 897 €"`);
}

// ============================== danke (gAds purchase value) ==============================
{
  const f = 'danke.html';
  let c = fs.readFileSync(f, 'utf8');
  let n;
  [c, n] = countReplace(c, '397', '897');
  fs.writeFileSync(f, c);
  console.log(`✓ ${f} — 397→897 ×${n}`);
}

if (failed) { console.error('\n✗ SOME REQUIRED FINDS MISSING — review above, nothing was guaranteed.'); process.exit(1); }
console.log('\n✓ all edits applied — sale reverted to regular price 897 € netto');
