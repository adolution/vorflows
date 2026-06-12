# Live-Workshop A/B-Test (Test #4) — Design Spec

> ⚠️ **SUPERSEDED (2026-06-12).** Dieser Design-Test wurde verworfen, bevor er Daten
> lieferte. Test #4 ist seit 2026-06-12 ein **Hero-Copy-Test** (A=B design-identisch).
> Aktueller Stand: `ab-tests.md` → Test #4 + `.agents/live-workshop-tracking.md`.
> Dieses Dokument bleibt nur als historischer Spec-Record.

**Datum:** 2026-05-30
**Status:** ~~approved~~ → superseded 2026-06-12 (siehe Banner oben)

## Ziel

Zweite Designvariante (B) der Anmeldeseite `vorflows.com/live-workshop`.
Gleiche Copy, gleiche 10 Sections — nur Designsprache getauscht. A/B-Test
auf Mobile, exakt nach dem Muster des laufenden Homepage-Tests, mit Clarity
als primärer Auswertung für **Scroll-Tiefe, Verweilzeit, Signup-Klicks**.

## Varianten

| | A (Kontrolle) | B (Test) |
|---|---|---|
| Datei | `live-workshop.html` | `live-workshop-b.html` (neu) |
| Design | dunkles Glass-Slide-Design (#000, Instrument Serif + Barlow) | Homepage-Editorial (Creme #FAFAF7 + Dark-Sections, Fraunces + Inter + JetBrains Mono) |
| SEO | `index, follow`, canonical, in Sitemap | `noindex, follow`, kein Self-Canonical, NICHT in Sitemap |
| Copy / Sections | unverändert | **identisch zu A** |

Sections (beide, 1:1): Nav · Hero · "Drei Dinge live" · Einwände ·
Kostenrechnung · Credibility · Qualifier · Final-CTA · FAQ · Footer.

B-Theme-Rhythmus (Homepage-Idiom, Light/Dark-Wechsel): Hero dark · Drei-Dinge
light · Einwände dark · Kosten light · Credibility light · Qualifier light ·
Final-CTA dark · FAQ light · Footer dark. Reuse Homepage-Klassen
(`.container .section .section-dark .display .h2 .meta .mono .btn-primary
.btn-outline .eyebrow .faq-item`) + Tokens 1:1. Self-hosted Fonts via
`/assets/fonts/fonts.css`.

## Routing (`middleware.js`)

- Matcher erweitern: `+ '/live-workshop'`.
- Branch nach `url.pathname`:
  - `/` + `/index.html` → bestehende Logik, Cookie `vf_ab`, Rewrite `/index-b`. **Unverändert.**
  - `/live-workshop` → eigener Cookie `vf_ab_lw`, Rewrite `/live-workshop-b` für Bucket B.
- Gleiche Regeln je Test: Mobile 50/50, Desktop→A (deterministisch), Bots→A
  (kein Cookie), Sticky-Cookie 90 Tage, Override `?ab=A|B`.
- Beide Tests laufen unabhängig (getrennte Cookies → keine Vermischung).

## Tracking (beide Seiten identisch, scoped `lw_`)

A hat aktuell KEIN Tracking → wird nachgerüstet (Instrumentierung, keine
Copy/Section-Änderung). Clarity-first, leichte Meta/gtag-Parität für Klicks.
Kein voller CAPI/Lead-Identity-Stack (overkill, Push-Risiko).

- Variant aus Cookie `vf_ab_lw` (default A). `clarity('set','lw_experiment',V)` + Event `lw_<V>`.
- **Signup-Klicks** (Primärziel): jeder `[data-webinar-cta]` → `lw_signup_click` {loc: nav|hero|final}.
- **Scroll-Tiefe:** `lw_scroll_25|50|75|100` (einmalig je Schwelle).
- **Verweilzeit:** Clarity nativ + `lw_dwell` {sec, bucket} on `pagehide`/`visibilitychange` (pausen-bereinigt, sichtbarkeitsbasiert).
- FAQ-Toggle → `lw_faq_open`. Clarity-Loader = gleiche ID `wnn5d5ehwn`. Kein Consent-Gate (A/B-Modus wie Homepage).

## SEO / Hygiene

- A bleibt canonical/indexed/in-Sitemap.
- B: `noindex, follow`, kein Sitemap-Eintrag, Variant-Marker im Head (`<!-- ab-test-active variant=B -->`).

## Auswertung (Clarity MCP)

`smartEvents: ["lw_A"]` vs `["lw_B"]` für Sessions/Scroll/Dwell.
`lw_signup_click` pro Variante = Primär-KPI. Scroll-Reach via `lw_scroll_*`.

## Doc / Verify

- Neuer Eintrag `ab-tests.md` (Test #4 · live-workshop-design · live).
- `node serve.mjs` → Screenshots `/live-workshop` (A) vs `/live-workshop-b` (B)
  Desktop+Mobile, Abgleich gegen Homepage-Look, ≥2 Runden. `?ab=B`-Override + Routing lokal prüfen.
</content>
</invoke>
