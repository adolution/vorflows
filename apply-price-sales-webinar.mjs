import fs from 'fs';

// ─────────────────────────────────────────────────────────────────────────
// sales.html: Webinar-Offer setzen.
// Von:  697 € netto (aktiv) · 1.200 € (strike)  → Voucher `launch`
// Auf:  1.499 € netto (aktiv) · 2.000 € (strike) → Voucher `launch` bleibt
// 2.000 = Originalpreis (durchgestrichen/Anker), 1.499 = Webinar-Zahlpreis.
// Voucher + ds24tr unverändert (Digistore rabattiert 2000→1499 via `launch`).
// Guards: fasst KEINE 1200/697-Vorkommen außerhalb Preis an (og:width, CSS).
// Run:  node apply-price-sales-webinar.mjs
// ─────────────────────────────────────────────────────────────────────────

let failed = false;
function edit(c, find, replace, { required = true, n: expect } = {}) {
  const count = c.split(find).length - 1;
  if (count === 0) {
    if (required) { console.error(`✗ NOT FOUND: ${find.slice(0, 70).replace(/\n/g, '⏎')}`); failed = true; }
    return c;
  }
  if (expect != null && count !== expect) {
    console.error(`✗ COUNT ${count}≠${expect}: ${find.slice(0, 50)}`); failed = true;
  }
  return c.split(find).join(replace);
}

const f = 'sales.html';
let c = fs.readFileSync(f, 'utf8');

// ---- <head> meta ----
c = edit(c, '<meta property="product:price:amount" content="697.00" />',
            '<meta property="product:price:amount" content="1499.00" />', { n: 1 });

// ---- JSON-LD offer ----
c = edit(c, '"description": "Einmalkauf 697 € netto statt 1.200 € · befristete Launch-Aktion · Ratenzahlung möglich via Digistore24.",',
            '"description": "Einmalkauf 1.499 € netto statt 2.000 € · befristete Launch-Aktion · Ratenzahlung möglich via Digistore24.",', { n: 1 });
c = edit(c, '\n            "price": "697",\n', '\n            "price": "1499",\n', { n: 1 }); // top-level offer price
c = edit(c, 'SalePrice", "price": "697",', 'SalePrice", "price": "1499",', { n: 1 });
c = edit(c, 'ListPrice", "price": "1200",', 'ListPrice", "price": "2000",', { n: 1 });

// ---- sticky bar ----
c = edit(c, '<span class="sticky-cta-label">Launch-Preis · statt 1.200 €</span>',
            '<span class="sticky-cta-label">Launch-Preis · statt 2.000 €</span>', { n: 1 });
c = edit(c, '<span class="sticky-cta-price">Bundle <strong>697&nbsp;€</strong></span>',
            '<span class="sticky-cta-price">Bundle <strong>1.499&nbsp;€</strong></span>', { n: 1 });

// ---- hero + bottom CTAs (3×) ----
c = edit(c, 'Bundle sichern · 697&nbsp;€', 'Bundle sichern · 1.499&nbsp;€', { n: 3 });

// ---- inline-cta-meta variants ----
c = edit(c, 'Bundle&nbsp;697&nbsp;€', 'Bundle&nbsp;1.499&nbsp;€', { n: 2 });
c = edit(c, 'Bundle 697&nbsp;€', 'Bundle 1.499&nbsp;€', { n: 1 });
c = edit(c, '<span class="inline-cta-meta">697&nbsp;€</span>',
            '<span class="inline-cta-meta">1.499&nbsp;€</span>', { n: 1 });
c = edit(c, '697&nbsp;€ einmalig', '1.499&nbsp;€ einmalig', { n: 1 });
c = edit(c, '697&nbsp;€ · 14 Tage Rückgabe', '1.499&nbsp;€ · 14 Tage Rückgabe', { n: 1 });

// ---- bundle hero price block ----
c = edit(c, '<span class="bundle-hero-price">697&nbsp;€</span>',
            '<span class="bundle-hero-price">1.499&nbsp;€</span>', { n: 1 });
c = edit(c, '<span class="bundle-hero-strike">1.200&nbsp;€</span>',
            '<span class="bundle-hero-strike">2.000&nbsp;€</span>', { n: 1 });

// ---- tracking values ----
c = edit(c, "'pricing-bundle': 697,", "'pricing-bundle': 1499,", { n: 1 });
c = edit(c, 'PLAN_VALUE[k] : 697)', 'PLAN_VALUE[k] : 1499)', { n: 1 });
c = edit(c, 'value: 697.0,', 'value: 1499.0,', { n: 2 });

// ---- guard: no stray sale-price left ----
if (failed) { console.error('\n✗ ABORT — required find missing / count mismatch.'); process.exit(1); }
fs.writeFileSync(f, c);

const left = (c.match(/697|1\.200/g) || []).length;
console.log(`✓ ${f} — Webinar-Offer gesetzt (1.499 € / 2.000 €). Reste "697"/"1.200": ${left}`);
