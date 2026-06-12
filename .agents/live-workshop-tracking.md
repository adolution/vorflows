# Live-Workshop — Tracking & A/B-Test (Stand 2026-06-12)

Single source of truth für alles Tracking/Experiment auf der Live-Workshop-LP.
Bei Änderungen an Events, Danke-Seite, Formular oder Test-Setup: **diese Datei mitpflegen.**

Betrifft: `live-workshop.html` (= Variante A, canonical, indexierbar) und
`live-workshop-b.html` (= Variante B, `noindex`). Live-Route: `https://vorflows.com/live-workshop`.

---

## 1. A/B-Test (Test #4)

- **Was wird getestet:** nur **Hero-Copy** (H1 + Lead). Design A=B identisch, sonst keine Variable.
  - A (Control): "Ich baue mit KI vor deinen Augen einen Shopify-Shop um."
  - B (Challenger): "Du zahlst für Apps, die KI gratis ersetzt. Und für Rankings, die du selbst holen könntest."
- **Routing:** `middleware.js`. Pfad `/live-workshop` → `testConfig()`:
  - Cookie **`vf_ab_lw`** (getrennt vom Homepage-Test `vf_ab`).
  - B-Rewrite-Target: `/live-workshop-b`. A = pass-through (canonical).
  - `splitDesktop: true` → **Desktop UND Mobile je 50/50** gebucket.
  - **Bots** (ohne `?ab=`-Override) → immer A (kein Cookie, keine Split-Crawl-Inkonsistenz).
  - Override per URL: `?ab=A` / `?ab=B` (gewinnt über Cookie). Cookie-Lebensdauer 90 Tage.
- **Force-Links:** `…/live-workshop?ab=A`, `…/live-workshop?ab=B`. Auto-Split: `…/live-workshop` (ohne Param).
- **Bucket-Quelle im Frontend:** `getCookie('vf_ab_lw') || 'A'` → Variable `variant`.
  Wer ohne Cookie reinkommt (z.B. Bot-pinned A, oder Cache) sieht Default 'A' im JS.

---

## 2. Analytics-Sinks — was ist aktiv

| Sink | Status | Anmerkung |
|---|---|---|
| **Microsoft Clarity** | **AKTIV** | Property `wnn5d5ehwn` (gleiche wie Homepage). Im A/B-Modus **ohne Consent-Gate** geladen (sealed Funnel, eigene Cookie-/Legal-Pages). Snippet inline im AB-Block. |
| Google gtag (GA4) | **NICHT installiert** | Code feuert `window.gtag(...)` nur `if(window.gtag)`. Kein GA-Snippet auf der Seite → **No-Op**. Wenn GA4 gewünscht: gtag.js-Snippet in `<head>` ergänzen, dann feuern alle Events automatisch mit. |
| Meta Pixel (fbq) | **NICHT installiert** | analog `if(window.fbq)`. Kein Pixel-Snippet → No-Op. |

Heißt: aktuell laufen **alle Events real nur in Clarity**. gtag/fbq sind vorverdrahtet, brauchen nur das jeweilige Lade-Snippet.

---

## 3. Event-Helfer (ZWEI verschiedene — wichtig!)

Es gibt zwei Funktionen, die Events feuern. Inkonsistenz bewusst kennen:

### `cEvent(name, props)` — A/B-Block (`<script>` ganz unten, "A/B-TRACKING")
- Hängt **automatisch `props.variant`** an (A/B).
- Clarity: `clarity('event', name)` — **ohne props** (Clarity-Event-API nimmt nur Namen).
- gtag/fbq: bekommen `name` + `props` (inkl. `variant`).
- **Für neue variant-bewusste Events immer `cEvent` benutzen.**

### `track(name)` — Commitment-Ladder-Modal (`<script>` davor)
- Feuert clarity/gtag/fbq **ohne** `variant`-Prop, **ohne** weitere props.
- Nutzt nur das Qualifier-Modal (`lwqModal`).
- ⚠️ `lw_commit_date` / `lw_qualify_*` tragen damit **keine Variant-Info**. Wenn du die pro Variante auswerten willst → auf `cEvent` umstellen.

### Variant-Tagging in Clarity
- `clarity('set','lw_experiment', variant)` + `clarity('event','lw_'+variant)` → einmal pro Pageview.
- Im Clarity-MCP filterbar via `smartEvents: ["lw_A"]` bzw. `["lw_B"]`.

---

## 4. Event-Taxonomie (alle `lw_`-Events)

| Event | Gefeuert von | Wann / wo | Props |
|---|---|---|---|
| `lw_A` / `lw_B` | sendTag (Clarity) | 1× pro Pageview, Variant-Tag | — |
| **`lw_signup_click`** | cEvent | **Primärziel.** Klick auf jeden `[data-webinar-cta]` | `loc`: hero / sticky / nav / final / inline |
| `lw_commit_date` | track | Modal Schritt 1 "Termin bestätigen" | — (kein variant!) |
| `lw_qualify_yes` | track | Modal: "Shop bei Shopify? Ja" → öffnet Form | — |
| `lw_qualify_no` | track | Modal: "Nein" → Reject-Screen | — |
| `lw_scroll_25/50/75/100` | cEvent | Scroll-Tiefe, je 1× | `pct` |
| `lw_dwell` | cEvent | Verweilzeit (sichtbarkeits-/pausenbereinigt), bei Bucket-Wechsel | `sec`, `bucket`, `reason` |
| `lw_faq_open` | cEvent | `<details>` aufgeklappt | `q` (Fragetext, 80 Zeichen) |
| `lw_dwell` / `lw_dwell_<variant>` | Clarity `set` | Dwell-Bucket als Clarity-Tag | — |

Dwell-Buckets: `lt5s / 5to15s / 15to30s / 30to60s / 60to120s / gt120s`.

---

## 5. Signup-Flow (aktueller Stand)

1. Klick `[data-webinar-cta]` → `lw_signup_click` (cEvent) **+** öffnet Qualifier-Modal (`open()` in der Commitment-Ladder).
2. Modal Schritt 1 → `lw_commit_date` → Schritt 2.
3. Schritt 2 "Shopify? Ja" → `lw_qualify_yes` → `openWebinarForm()`.
4. **`openWebinarForm()` zeigt aktuell nur den Platzhalter `#reg-note`** (Zeile ~569). **Noch kein echtes Formular / kein Embed / keine Danke-Seite.** Kommentar im Code: "später WebinarJam-Embed".
- Termin-Datum zentral: `var WEBINAR_DATE` (eine Stelle, in `[data-webinar-date]` injiziert).

---

## 6. Wenn du in Zukunft Tracking änderst — wo andocken

- **Neues Event auf der LP:** `cEvent('lw_<name>', {…})` im A/B-Block. Variant kommt automatisch mit. **In beide Files** (A + B identisch halten!).
- **Echtes Anmeldeformular / Embed:** in `openWebinarForm()` einbauen (ersetzt `#reg-note`-Platzhalter). Form-Submit → neues Event `lw_form_submit` via `cEvent`. Feldfehler/Schritte → `lw_form_*`.
- **Danke-Seite (nach Anmeldung):** eigene Seite/Route. Dort:
  - Conversion-Event `lw_signup_complete` (Primär-Conversion!) feuern — Variant aus `vf_ab_lw`-Cookie lesen (Cookie überlebt Navigation), damit A/B-Zuordnung erhalten bleibt.
  - Wenn GA4/Pixel dann live: dort die eigentliche Conversion (`purchase`/`Lead`/`CompleteRegistration`) auslösen.
  - Danke-Seite ggf. `noindex`.
- **GA4 oder Meta Pixel aktivieren:** nur Lade-Snippet in `<head>` beider Files — der Event-Code (`cEvent`/`track`) feuert dann automatisch mit, da bereits `if(window.gtag)`/`if(window.fbq)` verdrahtet.
- **Goldene Regel:** A und B müssen im Tracking **identisch** sein (sonst verzerrt der Copy-Test). Jede JS-Änderung in beide Files.

---

## 7. Auswertung

- Clarity-Dashboard: Funnel `lw_signup_click` (Primär), Heatmaps/Recordings je Variante via `smartEvents: ["lw_A"]` / `["lw_B"]`.
- Vergleich A vs B: Signup-Click-Rate (lw_signup_click / Pageview) pro Variant-Tag.
- Sekundär: Scroll-Tiefe + Dwell-Buckets pro Variante (zeigt, ob B-Hero hält oder abschreckt).
