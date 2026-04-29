# Buttons — aktueller Stand (vor Waitlist-Umbau)

Snapshot aller CTA-Buttons auf `index.html`. Reihenfolge = von oben nach unten.

| # | Bereich | Selector / Klasse | Text | Datei:Zeile |
|---|---------|-------------------|------|-------------|
| 1 | Nav (Desktop) | `a.btn.btn-primary.nav-cta` | `Pricing →` | index.html:1244 |
| 2 | Mobile Menu | `a.mobile-cta` | `Pricing ansehen →` | index.html:1257 |
| 3 | Hero — primär | `a.btn.btn-primary` (in `.hero-ctas`) | `Start mit Base →` | index.html:1273 |
| 4 | Hero — sekundär | `a.btn.btn-ghost` (in `.hero-ctas`) | `Wie es funktioniert ↓` | index.html:1274 |
| 5 | Pricing — Base | `a.pricing-cta` | `Start mit Base` | index.html:1588 |
| 6 | Pricing — Base + SEOFlow | `a.pricing-cta` | `Base + SEOFlow` | index.html:1603 |
| 7 | Pricing — Base + ClarityFlow | `a.pricing-cta` | `Base + ClarityFlow` | index.html:1618 |
| 8 | Pricing — Bundle (empfohlen) | `a.pricing-cta.primary` | `Bundle holen →` | index.html:1636 |
| 9 | Final CTA | `a.btn.btn-primary` | `Pakete ansehen →` | index.html:1694 |

## Nicht-CTA Buttons (bleiben unverändert)

- `button.nav-toggle` (Hamburger, nur aria-label, kein Text) — index.html:1245
- `button.filetree-copy` → `copy` — index.html:1293
- `button.codeblock-copy` → `copy` (3×) — index.html:1361, 1380, 1402
