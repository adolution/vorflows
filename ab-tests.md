# A/B-Test-Logbuch · vorflows.com

Tracking aller A/B-Tests, Hypothesen, Ergebnisse und Learnings. Verhindert
Doppel-Tests und macht künftige Tests präziser. Jeder neue Test bekommt
einen Eintrag — vor Start (Hypothese), während Lauf (Setup-Details), nach
Stop (Ergebnis + Decision + Learnings).

## Infrastruktur

- **Routing:** `middleware.js` (Vercel Edge), **pro Pfad konfiguriert** via `testConfig()`:
  - Homepage `/` + `/index.html` → Cookie `vf_ab`, B-Target `/index-b`, `splitDesktop:false`
    → **nur Mobile** 50/50, Desktop deterministisch auf A.
  - `/live-workshop` → Cookie `vf_ab_lw`, B-Target `/live-workshop-b`, `splitDesktop:true`
    → **Desktop UND Mobile** je 50/50 (seit Test #4-Setup).
  - Beide: Bots immer auf A, Sticky Cookie 90 Tage, Override `?ab=A|B` (nur clean-URL).
  - Live-Workshop-Details: siehe **`.agents/live-workshop-tracking.md`** (Single Source of Truth).
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

### Test #2 · hero-headline-cold-traffic · cancelled (never ran)

**Laufzeit:** 2026-05-20 → 2026-05-20 (abgebrochen vor Datensammlung)
**Scope:** Mobile only · 50/50 · sticky cookie
**Geänderte Datei:** index.html (A) + index-b.html (B) — **beide** Headlines neu (kein erhaltener Original-Control). Begründung: bestehende Headline ("In 5 Minuten mit KI: Apps, SEO, CRO") featurelastig, keine Outcome-Spezifität, kein Risk-Reversal sichtbar — wurde als unzureichend für Cold Traffic eingestuft und in beiden Varianten ersetzt.
**Commit-Refs:** Launch `8d8d906` → Cancel `<beim Push nachtragen>`

**Abbruch-Grund (2026-05-20):**
Setup-Risiko (kein erhaltener Original-Control) war zu schwerwiegend: A vs B
hätte nur "neu#5 vs neu#1" gemessen, ohne Sanity-Check "schlägt überhaupt eines
die alte Headline". User-Decision: Test stoppen, beide Varianten auf #5 setzen,
neue Headline ohne A/B als sitewide Live-Version übernehmen. Nächster Test wird
mit echter Control-Architektur aufgesetzt (Holdout-Bucket oder 3-Way-Split, s.
Backlog).

**Was sitewide übernommen wurde (auf A UND B, ab 2026-05-20):**
- Eyebrow: `Live demonstriert · 5 Min Video unten`
- H1: `Wie ich Shopify-Shops mit KI ranke, baue und auf Conversion trimme — ohne eine Zeile Code.`

**Hypothese:**
Cold-Traffic-Besucher springen ab, wenn Hero-H1 nur Feature-Schlagworte zeigt ("Apps, SEO, CRO") ohne Outcome, Mechanism oder Risk-Reversal. Wenn wir die H1 outcome-fokussiert und video-pull-orientiert formulieren, steigen Scroll-Tiefe (bis #bundle) und Hero-Video-Watchtime — weil Besucher schneller verstehen, was zu sehen ist und warum es sich lohnt.

**Variante A (Demonstration-Pull, First-Person, Mechanism-Reveal):**
- Eyebrow: `Live demonstriert · 5 Min Video unten`
- H1: `Wie ich Shopify-Shops mit KI ranke, baue und auf Conversion trimme — ohne eine Zeile Code.`
- Logik: First-Person ("wie ich"), drei Outcomes (ranken/bauen/CRO), Effort-Reduction-Hook ("ohne eine Zeile Code"), Video-Pull im Eyebrow (Länge + Position).

**Variante B (Hormozi-Offer-Stack: Specificity + Replace + Risk-Reversal):**
- Eyebrow: `Closed Beta abgeschlossen · Erfolgsgarantie`
- H1: `Ersetze 9 Shopify-Apps, deine Agentur und deinen Dev — mit einer KI, in 5 Minuten pro Aufgabe.`
- Logik: Specificity ("9 Apps" matched zur Compare-Table = 5.232 €/Jahr), drei Replacements (Apps/Agentur/Dev), Time-Compression ("5 Minuten pro Aufgabe"), Eyebrow trägt Likelihood ("Closed Beta") + Risk-Reversal ("Erfolgsgarantie").

**Primary Metric:** Hero-Video-Watchtime (Bucket-Verteilung + Avg-Sekunden) pro Variante
**Secondary Metrics:** Scroll-Tiefe bis `#bundle` (`pricing_view`-Rate), Hero-CTA-Klicks (`cta_click_hero`), `hero_video_pct_25/50/75/100`-Completion-Funnel, Digistore-Conversion-Rate
**Tertiary:** Bounce-Rate, Session-Duration

**Sample-Size-Ziel:** mind. 300 Mobile-Sessions pro Variante für Watchtime-Trend, 100 Conversions pro Variante für Conversion-Lift
**Stop-Kriterium:** klarer Trend (>20% Delta) bei Watchtime + Pricing-Reach ODER 100 Conversions/Variante ODER Stagnation nach 4 Wochen

**Warnung · Setup-Risiko:**
- Beide Varianten enthalten **neue** Copy → kein Vergleich gegen Original-Headline möglich. Test misst nur A vs B, nicht "neu vs alt". Wenn beide schlechter performen als die alte Headline, fällt das im A/B-Vergleich nicht auf — separater Vorher/Nachher-Check über Clarity-Trend (Tage vor 2026-05-20 vs danach) nötig.
- "9 Apps"-Claim in B ist an Compare-Table gebunden. Wenn Table-Apps-Anzahl ändert, B-Headline mit-aktualisieren.

**Ergebnis:**
- Sessions A: ... | B: ...
- Avg Watchtime A: ... s | B: ... s
- Pricing-View-Rate A: ... | B: ...
- Conversion A: ... | B: ...
- Lift: ±X%

**Decision:** _(nach Stop)_
**Learnings:** _(nach Stop)_

---

### Test #3 · radically-reduced-lp · live

**Start:** 2026-05-20 · 19:00 Uhr (Europe/Berlin)
**Laufzeit:** 2026-05-20 19:00 → offen
**Scope:** Mobile only · 50/50 · sticky cookie 90 Tage (middleware unverändert seit Test #1)
**Geänderte Datei:** index-b.html (Komplett-Refactor, 7006 → ~1700 Zeilen)
**Commit-Refs:** Launch `0d7f7d9` · Mobile-Hero-Fix `7a15ec0`

**Was ist das für ein Test (Kurzfassung):**
Die A-Variante (`index.html`) hat viel Traffic, aber null Sales. Test #3 prüft, ob eine **radikal reduzierte Landing Page mit Outcome-First-Messaging und Safety-USP** auf Mobile besser konvertiert als die Feature-tiefe Editorial-Architektur von A. Mobile-Besucher werden seit 2026-05-20 19:00 Uhr 50/50 auf A oder B gesplittet (Sticky Cookie `vf_ab`). Desktop und Bots bleiben deterministisch auf A.

**Hypothese:**
A hat hohe Cognitive Load (~25 Sektionen, Scroll-Scrub-Reveals, viele Feature-Details) und keine sichtbare Safety-Differenzierung gegenüber Shopify-Apps/Agenturen. Wenn wir B auf das Nötigste reduzieren (Hero · 4-Probleme-Transform · Safety-USP · Offer · 5-FAQ · Final-CTA), Outcome-First statt Feature-Tiefe formulieren und den Theme-Duplicate-Workflow als USP positionieren, steigt die Mobile-Conversion-Rate, weil Besucher schneller zum Pricing kommen, weniger Reibung sehen und ein klares Sicherheits-Argument bekommen, das kein Konkurrent bietet.

**Variante A (Kontrolle):** `index.html` · ~25 Sektionen · Produkt-Reveal-Scroll-Scrub · Workflow-Diagramm · Module-Detail · Compare-Table · Skill-Stack · 12 FAQ · Footer. Feature-tiefe Editorial-Architektur.

**Variante B (Test):** `index-b.html` · 7 Sektionen total:
- Nav (slim, 1 CTA)
- Hero (Video bleibt, Outcome-H1, ein primärer CTA, Mobile-Hero an A-Rhythmus angeglichen via `7a15ec0`)
- Transformation-Sektion (4 Probleme · App-Stack-Kosten, Agentur-Wartezeit, Ranking-Daten-Lücke, Profit-Bauchgefühl/CRO)
- **Safety-USP (neu in #3, einziger Punkt ohne A-Pendant):** "Du arbeitest am Shop, ohne ihn anzufassen." Theme-Duplicate-Workflow vs. Vollzugriff-Apps/Agenturen
- Offer-Card (Bundle regulär **597 €**, 5 Modul-Bullets, Raten 6 × 49,50 €, Garantien). _Hinweis 2026-06-02: ursprünglich Launch-Sale 297 € — Sale/Strike/Countdown komplett entfernt, jetzt regulär 597 € überall (A+B+Module)._
- FAQ (5 Fragen, Akkordeon)
- Final-CTA + Footer
- Alle Em-Dashes aus Body raus
- Humanizer-Pass: Negative-Parallelisms, rule-of-three und SaaS-Bro-Phrasen entfernt
- "Microsoft Clarity" + "Search Console" als Tool-Namen aus Body raus → Framing: "echte Nutzerverhaltensdaten" + "echte Such-/Ranking-Daten"

**Primary Metric:** Digistore-Conversion-Rate (Mobile)
**Secondary Metrics:** `pricing_view`-Rate, Hero-CTA-Klicks, Scroll-bis-Bundle, Bounce-Rate, Hero-Video-Watchtime (Bucket-Verteilung)
**Tertiary:** FAQ-Open-Rate (sollte bei B niedriger sein, weil weniger FAQs), Session-Duration (B niedriger erwartet, aber Conversion höher)

**Sample-Size-Ziel:** mind. 500 Mobile-Sessions pro Variante für Conversion-Signal
**Stop-Kriterium:** klarer Conversion-Trend (>30% Delta) ODER 50 Conversions/Variante ODER 6 Wochen Laufzeit

**Ergebnis:**
- Sessions A: ... | B: ...
- Pricing-View-Rate A: ... | B: ...
- Conversion A: ... | B: ...
- Lift: ±X%

**Decision:** _(nach Stop)_
**Learnings:** _(nach Stop)_

---

### Test #4 · live-workshop-hero-copy · live

**Volle Doku:** `.agents/live-workshop-tracking.md` (Tracking/Funnel/Sinks). Hier nur Test-Log.

**Scope:** **Desktop UND Mobile** 50/50 · sticky cookie 90 Tage · **eigener Cookie `vf_ab_lw`** (getrennt vom Homepage-Test `vf_ab`)
**URL:** `/live-workshop` (nicht Root). Eigene Test-Achse, läuft parallel zu Test #3.
**Dateien:** `live-workshop.html` (A, canonical/indexierbar) · `live-workshop-b.html` (B, `noindex`) · `middleware.js` (`splitDesktop:true`)

**Phase 1 — Design-Test (2026-05-30 → 2026-06-12, beendet/verworfen):**
Ursprünglich A=dunkles Glass-Slide-Design vs B=Homepage-Editorial (hell), Copy identisch.
Am 2026-06-12 verworfen, bevor signifikante Daten entstanden: A wurde **design-identisch
zu B gezogen** (beide helles Homepage-Editorial), um stattdessen einen **Hero-Copy-Test**
zu fahren. Grund: Copy ist der stärkere Hebel; Design-Parität isoliert die Copy sauber.

**Phase 2 — Hero-Copy-Test (live seit 2026-06-12):**
A und B sind **design-identisch** (helles Homepage-Editorial, Fraunces+Inter+Mono,
Terracotta). **Einzige Variable = Hero-Copy (H1 + Lead).** Rest des Bodys identisch.
Künftige Nicht-Hero-Änderungen immer gleichzeitig auf A UND B.

**Hypothese:**
Die alte H1 ("Ich baue … Shop um") ist prozess-/neugier-getrieben und vergräbt die
Outcomes (Umsatz/Rankings/App-Kosten) in der Lead. Eine reibungs-/loss-getriebene H1,
die das Geld-Argument (Apps + Rankings) direkt anspricht, hebt die Signup-Klickrate,
weil Founder die Relevanz schneller erfassen.

**Variante A (Kontrolle):**
- H1: "Ich baue mit KI vor deinen Augen einen Shopify-Shop um."
- Lead: "Live in 90 Minuten: mehr Umsatz, höhere Rankings, 5.232 € im Jahr an App-Kosten gespart …"

**Variante B (Challenger · Reibung/Loss):**
- H1: "Du zahlst für Apps, die KI gratis ersetzt. Und für Rankings, die du selbst holen könntest."
- Lead: "Live in 90 Minuten bau ich mit KI einen echten Shopify-Shop um. Du siehst, wie er mehr verkauft und sich die 5.232 € App-Kosten im Jahr spart. Kein Code."

**Beide (identisch, keine Test-Variable):**
- Trust-Row unter Hero-CTA: `Echte Suchdaten · Klick- & Scroll-Verhalten · App-Code statt Abos`
  (macht die 3 Säulen SEO/CRO/Apps above-the-fold sichtbar)
- Hero-Eyebrow + Hero-Pills + CTA-Sub entfernt; Humanizer-Pass (Prosa-Em-Dashes raus)

**Primary Metric:** Signup-Button-Klickrate (`lw_signup_click`, alle Positionen) pro Variante
**Secondary Metrics:** Scroll-Tiefe (`lw_scroll_*`), Verweilzeit (`lw_dwell`), FAQ-Open (`lw_faq_open`)
**Tertiary:** Signup-Klicks nach Position (`loc`: nav/hero/sticky/final/inline)

**Achtung Funnel:** `lw_signup_click` öffnet aktuell nur Qualifier-Modal → `#reg-note`-Platzhalter.
**Kein echtes Formular / keine Danke-Seite** → Click ist Proxy-Conversion bis Formular steht.
Nur Clarity aktiv (gtag/fbq verdrahtet, aber kein Snippet geladen).

**Sample-Size-Ziel:** mind. 300 Sessions pro Variante für Klick-Trend
**Stop-Kriterium:** klarer Klick-Trend (>20% Delta) ODER 4 Wochen Laufzeit

**SEO-Hygiene:** A canonical/indexed/in-Sitemap. B `noindex, follow`, canonical→A, nicht in Sitemap.

**Ergebnis:**
- Sessions A: ... | B: ...
- Signup-Klickrate A: ... | B: ...
- Lift: ±X%

**Decision:** _(nach Stop)_
**Learnings:** _(nach Stop)_

---

## Backlog · Test-Ideen (priorisiert)

Hier Hypothesen sammeln, die noch nicht getestet wurden. Beim Start eines
neuen Tests Eintrag von hier nach "Tests" hochziehen.

- **Hero-Headline #5 vs #1 mit echtem Control** — Test #2 wurde gestoppt wegen fehlendem Control. Setup für sauberen Re-Test: entweder (a) Holdout-Bucket-Architektur 45/45/10 mit `index-c.html` = alte Headline, oder (b) sequential test #5 (aktuell live) vs #1, sobald aktueller Sitewide-Roll-out Baseline-Daten in Clarity erzeugt hat. Prioritäts-Frage: ist #1 (Hormozi-Replace-Stack) überhaupt noch im Rennen oder gewinnt #5 sitewide-Roll-out das Argument schon ohne Test?

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
