# A/B-Test-Logbuch · vorflows.com

Tracking aller A/B-Tests, Hypothesen, Ergebnisse und Learnings. Verhindert
Doppel-Tests und macht künftige Tests präziser. Jeder neue Test bekommt
einen Eintrag — vor Start (Hypothese), während Lauf (Setup-Details), nach
Stop (Ergebnis + Decision + Learnings).

## Infrastruktur

- **Routing:** `middleware.js` (Vercel Edge) splittet **nur Mobile-UA** 50/50.
  Desktop bleibt deterministisch auf A. Bots immer auf A. Sticky Cookie
  `vf_ab` (90 Tage). Override per `?ab=A|B` für QA.
- **Tracking:** Microsoft Clarity Custom-Events `ab_A` / `ab_B` +
  Meta Pixel `ExperimentAssigned`. Conversions via Digistore24 mit
  `ds24tr=vf_ab_A` / `ds24tr=vf_ab_B` Param.
- **Auswertung:** Clarity MCP (`query-analytics-dashboard`,
  `list-session-recordings`) mit `smartEvents: ["ab_A"]` oder `["ab_B"]`.
  Digistore-Backend für Verkaufszahlen pro Variante.
- **SEO-Hygiene:** Nur **A ist canonical** (`robots: index, follow` +
  JSON-LD url/mainEntityOfPage/sameAs). B trägt `noindex, follow`.
  Verhindert Duplicate Content im Index.
- **Dateien:** `index.html` = A (canonical, indexierbar).
  `index-b.html` = B (Experiment, noindex). Nach Test-Ende: B-Sieger nach
  A übertragen, A-spezifische SEO-Bits zurückpatchen, B-Datei für nächsten
  Test stehen lassen.

## Verfügbare Custom-Events (für Variant-Vergleich)

Alle Events tragen automatisch `variant` Property (A oder B). Auswertung:
Clarity MCP filtert via `smartEvents`, GA via Custom-Dimension `variant`,
Meta via Custom-Parameter.

| Event | Trigger | Auswertung pro Variante |
|---|---|---|
| `ab_A` / `ab_B` | Page-View (Variant-Tag) | Sessions pro Variante |
| `cta_click_hero` / `_sticky` / `_inline` / `_final` | CTA-Klick je Position | Klickrate je Position |
| `pricing_view` | `#bundle` 60% im Viewport | Pricing-Reach |
| `digistore_redirect` | Klick auf Digistore-CTA | Checkout-Initiation |
| `faq_open` | FAQ-Akkordeon geöffnet | FAQ-Engagement |
| `video_play` | Hero-Video startet (einmalig) | Video-Start-Rate |
| **`hero_video_pct_25/50/75/100`** | Hero-Video erreicht Milestone | Completion-Funnel |
| **`hero_video_watch_<bucket>`** | Watchtime-Bucket bei Pause/End/Tab-Switch | Watchtime-Verteilung |

### Hero-Video-Watchtime (seit 2026-05-20)

**Wie es misst:**
- Kumulierte Wiedergabezeit pro Page-View (pausen-bereinigt, nicht Wall-Clock).
- Tab-Wechsel + Page-Hide werden geflusht → kein Datenverlust bei "User
  schließt Tab mid-video".
- Milestones zünden bei 25/50/75/100% Video-Position.
- Bucket-Events zünden bei Pause/End/Tab-Hide mit aktueller Watchtime.

**Buckets:** `lt5s`, `5to15s`, `15to30s`, `30to60s`, `60to120s`, `gt120s`.

**Auswertung pro Variante:**

1. **Clarity Dashboard** (Custom-Tags, filterbar):
   - `hero_video_watchtime` → globale Verteilung
   - `hero_video_watchtime_A` / `hero_video_watchtime_B` → pro Variante
   - Filter: Sessions wo Tag = `30to60s` UND `ab_A` → Anzahl A-Sessions mit
     30-60s Watchtime.

2. **Clarity MCP** (zählbar):
   ```
   query-analytics-dashboard mit smartEvents: ["hero_video_watch_30to60s", "ab_A"]
   ```
   liefert Sessions, die beide Events haben.

3. **Google Analytics** (numerisch, exakt):
   - Event: `hero_video_watchtime` mit `value` = Sekunden, `variant` = A/B.
   - Report: `avg(value) GROUP BY variant` → Durchschnitts-Watchtime pro
     Variante in Sekunden.

4. **Milestones (Completion-Rate):**
   - `hero_video_pct_25` Sessions / `ab_A` Sessions = 25%-Reach A.
   - Vergleich A vs B zeigt, welche Variante Zuschauer länger hält.

**Edge-Cases beachtet:**
- Mehrere Hero-Videos auf einer Seite werden via `slot` (`primary` / `alt`)
  unterschieden.
- `playing` Event statt nur `play` → Resume nach Buffer wird korrekt gezählt.
- `pagehide` + `visibilitychange→hidden` doppelt registriert → robuste
  Capture auch bei iOS Safari (das `pagehide` nicht immer feuert).

---

## Test-Template

```markdown
### Test #N · <Kurz-Slug> · <Status: live | stopped | won-A | won-B | inconclusive>

**Laufzeit:** YYYY-MM-DD → YYYY-MM-DD
**Scope:** Mobile only · 50/50 · sticky cookie
**Geänderte Datei:** index-b.html
**Commit-Refs:** <hash launch> ... <hash stop>

**Hypothese:**
Wenn wir X ändern, dann steigt Y, weil Z.

**Variante A (Kontrolle):** kurze Beschreibung
**Variante B (Test):** kurze Beschreibung des Unterschieds

**Primary Metric:** Digistore-Conversion-Rate (Mobile)
**Secondary Metrics:** Scroll-Tiefe bis #bundle, CTA-Klicks (hero/sticky/inline),
Session-Duration, Bounce-Rate

**Sample-Size-Ziel:** mind. X Mobile-Sessions pro Variante
**Stop-Kriterium:** statistisch signifikant (95%) ODER N Sessions ohne Klar-Trend

**Ergebnis:**
- Sessions A: ... | B: ...
- Conversion A: ... | B: ...
- Lift: ±X%
- Signifikanz: ja/nein

**Decision:** A bleibt | B übernehmen | weiter laufen | neue Iteration
**Learnings:** Was hat funktioniert / nicht funktioniert / was nächstes Mal anders
```

---

## Tests

### Test #1 · mobile-produkt-vertical-stack · won-B

**Laufzeit:** 2026-05-09 → 2026-05-20
**Scope:** Mobile only · 50/50 · sticky cookie
**Geänderte Datei:** index-b.html
**Commit-Refs:** `16549eb` (Launch) → `48d3174` (B-Sieger nach A übernommen)

**Hypothese:**
Mobile-User scrollen den 600vh-Pin-Runway im `#produkt`-Section nicht durch
und springen vor der `#bundle`-Section ab. Wenn wir den Pin-Scroll auf
Mobile deaktivieren und die 6 Produkt-Cards vertikal stacken (Display-Order
01→06), reduziert sich Scroll-Strecke bis Pricing um ~3 Viewport-Längen.
Erwartung: höhere Pricing-View-Rate + mehr CTA-Klicks + bessere Conversion.

**Variante A (Kontrolle):** Pin-Scroll-Runway 600vh, Cards horizontal
gesteuert via JS, gleiche Mechanik wie Desktop.
**Variante B (Test):** CSS-Override `@media (max-width:880px)`. Pin-Runway
deaktiviert, Cards stacken vertikal in CSS-`order` (matched zu
`applyMobileNumbering` JS). Zusätzlich: Reibungspunkte als
`<details>`-Akkordeon (mobile öffnen/schließen). Compare-Table als Stack
statt 3-Spalten-Grid. Bundle-Hero-Preis-Größen optimiert (64px Headline,
19px Strike, 28px Alt-Preis).

**Primary Metric:** Digistore-Conversion-Rate (Mobile)
**Secondary Metrics:** Scroll-Tiefe bis #bundle, CTA-Klicks, Bounce-Rate

**Ergebnis:** _(vom User bestätigt: B hat gewonnen — Zahlen nachtragen wenn vorhanden)_

**Decision:** **B → A übernommen** (Commit `48d3174`, 2026-05-20). index-b.html
bleibt für nächsten Test stehen.

**Learnings:**
- Mobile-Pin-Scroll-Runways über mehrere Viewport-Längen kosten Conversions.
  Vertikaler Stack auf Mobile schlägt horizontale Story-Mechanik.
- Akkordeon-Pattern bei langen Reibungspunkten/FAQs reduziert Scroll-Strecke
  ohne Info zu verstecken.
- 3-Spalten-Compare-Tables hyphenieren auf Mobile hässlich
  ("Countdown-Ti-mer-App") — Card-Stack-Layout vermeidet das.
- Test-Setup war sauber: middleware Mobile-only + sticky Cookie + Clarity
  Custom-Events (ab_A/ab_B) + Digistore ds24tr-Param. Setup
  wiederverwendbar für künftige Tests.

---

## Backlog · Test-Ideen (priorisiert)

Hier Hypothesen sammeln, die noch nicht getestet wurden. Beim Start eines
neuen Tests Eintrag von hier nach "Tests" hochziehen.

- _(noch leer — User briefed nächsten Test)_

## Verbrannte Hypothesen · NICHT erneut testen

Hier landen Tests die klar verloren haben — verhindert Wiederholung.

- _(noch leer)_

---

## Best Practices · Lessons Learned

Globale Erkenntnisse über mehrere Tests, die in jedes neue Setup einfließen.

- **Mobile-only-Splits sind sicherer als All-Traffic-Splits.** Desktop-A/B
  vermeidet Crawler-Inkonsistenzen + Bot-Skew.
- **Bots immer auf A pinnen.** Verhindert Split-Indexing. In middleware.js
  per BOT_UA-Regex erzwingen.
- **Sticky Cookie 90d.** Vermeidet Bucket-Hopping bei Returning Visits.
- **JSON-LD nur auf A.** B trägt `noindex, follow`. Sonst Duplicate-Snippets
  im SERP.
- **Ein Change pro Test.** Nicht 5 Variablen gleichzeitig ändern, sonst weiß
  man am Ende nicht was den Lift gebracht hat. (Test #1 verletzt das
  bewusst — 4 zusammenhängende Mobile-UX-Fixes als Paket. Nächste Tests:
  isoliert.)
- **Sample-Size vor Stop.** Bei niedrigem Traffic nicht zu früh stoppen —
  Faustregel: mind. 100 Conversions pro Variante für robuste Aussage.
  Zur Not auf Proxy-Metric (Pricing-View, CTA-Klick) ausweichen.
- **Cache-Header sauber.** middleware.js + Root-HTML auf `no-store`, sonst
  cached CDN die falsche Variante. Lesson aus `ba41170`.
- **Variant-Marker im HTML-Head** (`<!-- ab-test-active variant=A -->`).
  Macht QA + Bug-Reports eindeutig zuordenbar.
