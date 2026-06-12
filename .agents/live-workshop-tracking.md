# Live-Workshop — Tracking & A/B-Test (Stand 2026-06-12)

Single source of truth für alles Tracking/Experiment auf der Live-Workshop-LP.
Bei Änderungen an Events, Danke-Seite, Formular oder Test-Setup: **diese Datei mitpflegen.**

Betrifft: `live-workshop.html` (= Variante A, canonical, indexierbar),
`live-workshop-b.html` (= Variante B, `noindex`) und **`danke-live-workshop.html`**
(Danke-/Survey-Seite, `noindex`). Live-Routen: `https://vorflows.com/live-workshop`
und `https://vorflows.com/danke-live-workshop`.

Strategie-Basis der Danke-Seite: FULLSTACK-Playbook Learning #3 (Survey auf der
Dankesseite), #4 (WhatsApp/Telefon), #29 (Warm-Up-Video) —
`.agents/vorflows-ads/webinar/playbook-01-traffic-showup.md`.

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
| **Microsoft Clarity** | **AKTIV** | Property `wnn5d5ehwn` (gleiche wie Homepage). Im A/B-Modus **ohne Consent-Gate** geladen (sealed Funnel, eigene Cookie-/Legal-Pages). Snippet inline im AB-Block. Auch auf der Danke-Seite. |
| **Meta Pixel (fbq)** | **AKTIV** | Pixel `2002118703756086` (gleiches wie Homepage). Block „META PIXEL + AD-ATTRIBUTION“ in beiden LP-Files + Danke-Seite. A/B-Test-Modus: unconditional, vor Public-Launch Consent-Gate reaktivieren. Alle bestehenden `cEvent`/`track`-Aufrufe feuern jetzt real zu Meta. |
| **Meta CAPI** | **AKTIV** | `/api/capi` (Vercel-Function, env `META_PIXEL_ID` + `META_CAPI_TOKEN`). Browser-Events werden mit identischer `event_id` gespiegelt → Meta dedupliziert. `external_id` = `vf_ext_id` (localStorage, gleiche Konvention wie Homepage). |
| **Survey-Sink** | **AKTIV (Log) / optional (Sheet)** | `/api/lw-survey` loggt jeden Lead als JSON-Zeile ins Vercel-Log (Prefix `lw-survey`) und forwarded an env **`LW_SURVEY_WEBHOOK`** (beliebige URL, JSON-POST). Empfohlen: Google-Sheets-Apps-Script (Setup unten). **Kein Klaviyo** — Alex nutzt hierfür kein Klaviyo. |
| Google gtag (GA4/Ads) | **NICHT installiert** | Code feuert `window.gtag(...)` nur `if(window.gtag)` → No-Op. Bei Bedarf Lade-Snippet in `<head>`, dann feuern alle Events automatisch mit. |

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

### Events der Danke-Seite (`danke-live-workshop.html`)

Helfer dort: `lwTrack(metaName, props, clarityName)` — feuert Clarity (Name mit
Antwort codiert, da Clarity keine Props kann), Meta Pixel (`track`/`trackCustom`
mit `eventID`) und CAPI-Mirror (gleiche `event_id`). Props enthalten immer
`variant` + `utm_campaign`/`utm_content` aus dem Attributions-Cookie.

| Meta-Event | Clarity-Event | Wann |
|---|---|---|
| **`CompleteRegistration`** (Standard) | `lw_signup_complete` | 1× pro Browser bei Pageload (Guard `vf_lw_reg_fired`). **= Primär-Conversion Anmeldung.** |
| `LW_Survey_Revenue` `{answer}` | `lw_q_revenue_<answer>` | Frage 1 beantwortet. Antworten: `kein_shop / lt5k / 5to20k / gt20k` |
| `LW_Survey_Apps` `{answer}` | `lw_q_apps_<answer>` | Frage 2. Antworten: `lt50 / 50to150 / 150to400 / gt400` |
| `LW_Survey_Focus` `{answer}` | `lw_q_focus_<answer>` | Frage 3. Antworten: `apps_ersetzen / seo / conversion` |
| `LW_Phone_Optin` / `LW_Phone_Skip` | `lw_phone_optin` / `lw_phone_skip` | Frage 4 (WhatsApp-Unterlagen → Telefonnummer) |
| `LW_Survey_Complete` `{score, qualified, …}` | `lw_survey_complete` | Survey abgeschlossen |
| **`QualifiedLead`** `{score, revenue, apps, focus}` | `lw_qualified` | Nur wenn qualifiziert. **= Optimierungs-Event für Ads (CPQL).** |
| `LW_AddToCalendar` `{type}` | `lw_calendar_google` / `lw_calendar_ics` | Kalender-Klick (Show-Up-Commitment) |
| `LW_WarmupVideo_Play` | `lw_warmup_play` | Warm-Up-Video gestartet |

Clarity-Tags (Session-Filter): `lw_experiment` (A/B), `lw_revenue`, `lw_apps`,
`lw_focus`, `lw_qualified`, `lw_utm_campaign`, `lw_utm_content`.

**Qualifizierungs-Logik (eine Stelle: `finishSurvey()` in danke-live-workshop.html):**
- Score 0–7 = Umsatz (kein_shop 0 · lt5k 1 · 5to20k 2 · gt20k 3) + App-Kosten (lt50 0 · 50to150 1 · 150to400 2 · gt400 3) + Telefon +1.
- **QualifiedLead = Umsatz-Tier ≥ 5.000 €/Monat** (laufender Shop im ICP). Score dient der Feinauswertung im Lead-Sheet/Clarity.

---

## 5. Signup-Flow (aktueller Stand)

1. Meta-Ad → LP mit UTM-Parametern. Block „META PIXEL + AD-ATTRIBUTION“ sichert
   `utm_*` + `fbclid` in **Cookie `vf_lw_attr`** (90 Tage, letzter Paid-Touch
   gewinnt) + localStorage-Mirror. Außerdem: `_fbc`/`_fbp` setzen, `vf_ext_id`,
   Pixel-PageView + CAPI-Mirror.
2. Klick `[data-webinar-cta]` → `lw_signup_click` (cEvent) **+** öffnet Qualifier-Modal.
3. Modal Schritt 1 → `lw_commit_date` → Schritt 2.
4. Schritt 2 "Shopify? Ja" → `lw_qualify_yes` → `openWebinarForm()`.
5. **`openWebinarForm()` zeigt noch den Platzhalter `#reg-note`. Hier kommt das
   WebinarJam-Popup-Embed rein** (Button-/Popup-Code aus WebinarJam einfügen).
6. WebinarJam-Registrierung → **Custom Thank You Page** (in WebinarJam
   konfigurieren!): `https://vorflows.com/danke-live-workshop`. WebinarJam hängt
   Lead-Daten an die URL (`wj_lead_email`, `wj_lead_first_name`), die Seite liest
   sie defensiv aus und speichert sie als `vf_known_email`/`vf_known_first_name`.
7. Danke-Seite: `CompleteRegistration` + Survey (4 Fragen) + `QualifiedLead` +
   Kalender + Warm-Up-Video. Attribution kommt aus `vf_lw_attr` —
   **funktioniert unabhängig vom WebinarJam-Popup**, weil nie URL-Parameter
   durch WebinarJam durchgereicht werden müssen.
- Termin-Datum zentral: `var WEBINAR_DATE` (LP) bzw. `WEBINAR_DATE_TEXT` +
  `WEBINAR_START_UTC`/`WEBINAR_END_UTC` (Danke-Seite, für Kalender-Links).
  **Bei Terminänderung: beide LP-Files + Danke-Seite!**

### WebinarJam-Checkliste (einmalig konfigurieren)
1. Registrierungs-Popup-Code in `openWebinarForm()` beider LP-Files einsetzen (ersetzt `#reg-note`).
2. Thank You Page → "Custom page" → `https://vorflows.com/danke-live-workshop`.
3. Test-Anmeldung mit `?utm_campaign=test&utm_content=testad` durchklicken und im Meta Events Manager (Test-Events) + Clarity prüfen.

### Ad-URL-Template (Meta, in jede Anzeige)
```
https://vorflows.com/live-workshop?utm_source=meta&utm_medium=paid&utm_campaign={{campaign.name}}&utm_term={{adset.name}}&utm_content={{ad.name}}
```
Meta füllt `{{…}}` automatisch (Dynamic URL Parameters). `utm_content` = Anzeigen-Name
= das Feld, über das Survey-Antworten pro Ad ausgewertet werden (Spalte `utm_content` im Lead-Sheet).

### Auswertung „welche Ad bringt qualifizierte Leads“
1. **Meta Ads Manager (Hauptweg):** Custom Conversions anlegen auf
   `QualifiedLead` (+ optional `CompleteRegistration` als Registrierung). Dann
   als Spalten im Ad-Reporting → Kosten pro QualifiedLead **pro Anzeige** (CPQL,
   FULLSTACK-Kennzahl #1). Attribution läuft über `_fbp`/`_fbc`/CAPI, nicht über UTM.
2. **Lead-Sheet (Narrow Tracking):** Google Sheet via `LW_SURVEY_WEBHOOK` — eine
   Zeile pro Lead mit allen Antworten + `utm_campaign/term/content`. Pivot nach
   `utm_content` → pro Ad sehen, *welche Antworten* die Leads gegeben haben
   (nicht nur wie viele). Ohne Webhook: Vercel-Log `lw-survey` als Backup.
3. **Clarity:** Sessions filtern nach Tag `lw_utm_content` / `lw_qualified`.

---

## 6. Wenn du in Zukunft Tracking änderst — wo andocken

- **Neues Event auf der LP:** `cEvent('lw_<name>', {…})` im A/B-Block. Variant kommt automatisch mit. **In beide Files** (A + B identisch halten!).
- **Echtes Anmeldeformular / Embed:** WebinarJam-Popup-Code in `openWebinarForm()` einbauen (ersetzt `#reg-note`-Platzhalter, in BEIDEN LP-Files).
- **Danke-Seite:** existiert (`danke-live-workshop.html`). Neue Events dort über `lwTrack(metaName, props, clarityName)`. Qualifizierungs-Logik nur in `finishSurvey()` ändern + hier dokumentieren.
- **GA4/Google Ads aktivieren:** Lade-Snippet in `<head>` aller drei Files — der Event-Code feuert dann automatisch mit (`if(window.gtag)` überall verdrahtet).
- **Goldene Regel:** A und B müssen im Tracking **identisch** sein (sonst verzerrt der Copy-Test). Jede JS-Änderung in beide Files. Der Pixel/Attribution-Block ist byte-identisch in A + B — bei Änderungen so halten.

---

## 7. Auswertung

- Clarity-Dashboard: Funnel `lw_signup_click` (Primär), Heatmaps/Recordings je Variante via `smartEvents: ["lw_A"]` / `["lw_B"]`.
- Vergleich A vs B: Signup-Click-Rate (lw_signup_click / Pageview) pro Variant-Tag.
- Sekundär: Scroll-Tiefe + Dwell-Buckets pro Variante (zeigt, ob B-Hero hält oder abschreckt).

---

## 8. Google-Sheet-Webhook einrichten (einmalig, ~5 Min)

1. Neues Google Sheet "LW Leads". Kopfzeile = Feldnamen aus `api/lw-survey.js`
   (`submitted_at, email, first_name, phone, revenue, app_costs, focus,
   phone_optin, score, qualified, variant, utm_source, utm_medium,
   utm_campaign, utm_content, utm_term, fbclid, landed_at`).
2. Erweiterungen → Apps Script, einfügen:

```js
const HEADERS = ['submitted_at','email','first_name','phone','revenue','app_costs','focus',
  'phone_optin','score','qualified','variant','utm_source','utm_medium',
  'utm_campaign','utm_content','utm_term','fbclid','landed_at'];
function doPost(e) {
  const d = JSON.parse(e.postData.contents);
  SpreadsheetApp.getActiveSpreadsheet().getSheets()[0]
    .appendRow(HEADERS.map(h => d[h] !== undefined ? d[h] : ''));
  return ContentService.createTextOutput('ok');
}
```

3. Deploy → "Neue Bereitstellung" → Typ **Web-App** → Ausführen als *ich*,
   Zugriff **Jeder**. Web-App-URL kopieren.
4. Vercel → Projekt → Environment Variables → `LW_SURVEY_WEBHOOK` = diese URL → Redeploy.
