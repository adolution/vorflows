# Live-Workshop — Tracking & A/B-Test (Stand 2026-06-12)

Single source of truth für alles Tracking/Experiment auf der Live-Workshop-LP.
Bei Änderungen an Events, Danke-Seite, Formular oder Test-Setup: **diese Datei mitpflegen.**

Betrifft: `live-workshop.html` (= Variante A, canonical, indexierbar),
`live-workshop-b.html` (= Variante B, `noindex`) und **`danke-live-workshop.html`**
(Danke-/Survey-Seite, `noindex`). Live-Routen: `https://vorflows.com/live-workshop`
und `https://vorflows.com/danke-live-workshop`.

Strategie-Basis der Danke-Seite: FULLSTACK-Playbook Learning #3 (Survey auf der
Dankesseite) + #4 (WhatsApp/Telefon) —
`.agents/vorflows-ads/webinar/playbook-01-traffic-showup.md`.
KEIN **Content-/Warm-Up-Video** (Learning #29): Alex zeigt die Inhalte live,
nichts davon vorab auf der Danke-Seite. **ABER** seit 2026-06-13 läuft ein
**Show-Up-Video** (40s, **quer 16:9 1920×1080**, Alex) zwischen confirm-box und
Survey — es verrät keinen Workshop-Inhalt, sondern treibt nur die nächste Aktion
(Mail bestätigen → Fragen → Kalender). Subline darüber: „Damit du am **25.06. um
11:00 Uhr** sicher dabei bist, schau dir dieses Video an:" (Datum/Zeit unterstrichen,
`.cue-date`). Die alte Live-Termin-Pill (`.datebar`) wurde 2026-06-13 entfernt
(Mobile-Umbruch + redundant, Termin steht jetzt in der Subline). Assets: `assets/video/lw-danke-1080.mp4` (H.264,
1920×1080 quer) + `lw-danke-poster.webp`. Erstes Play feuert
`LW_Danke_Video_Play` / `lw_danke_video_play` (1× pro Browser, Show-Up-Signal).
**2026-07-07:** Video neu geschnitten → `lw-danke-1080-v2.mp4` (37,3s statt 40,3s;
endet nach „…es wird keine Aufzeichnung geben", das veraltete „Bis zum 25." raus).
Assets sind 1 Jahr immutable gecached → neuer Dateiname `-v2` als Cache-Bust, Source
im `<video>` entsprechend. Bei erneutem Schnitt: `-v3` etc.
**Hero-Umbau 2026-07-07:** optin-Bar + H1 + confirm-box zu EINEM lauten Terracotta-Alert
(`.confirm-alert`) konsolidiert — „Deine Anmeldung ist noch nicht bestätigt" ist die
erste + einzige Botschaft ganz oben (Spam-/Werbung-Hinweis + Postfach-Button inklusive).
Ziel: DOI-Bestätigungsrate hoch → schließt die Lücke Ads-Manager vs. WJ-Backend (s.u.).

---

## 1. A/B-Test (Test #4)

### ✅ ENTSCHIEDEN 2026-06-18 — Sieger: **Variante A**. B verloren.
Test vorzeitig beendet (Webinar 25.06., kein Test-Runway mehr). **A geht auf 100 %** für den Webinar-Push.

- **Was wurde getestet:** nur Hero-Copy (H1 + Lead), Design A=B identisch.
  - **A (Sieger):** „Ich baue mit KI vor deinen Augen einen Shopify-Shop um." — Demo-/Neugier-Framing, positiv, konkret (Live-Vorführung, Alex tut es).
  - **B (Verlierer):** „Du zahlst für Apps, die KI gratis ersetzt. Und für Rankings, die du selbst holen könntest." — Pain-/Kosten-Framing (Loss-Aversion-Hypothese).
- **Hypothese hinter B:** Negativ-/Verlust-Framing („du verbrennst Geld") zieht härter als A's neutrale Demo-Ansage — Schmerz > Neugier. **Widerlegt.**
- **Daten (Clarity, 15.–18.06., erst ab Titel-Fix trennbar):** A schlägt B auf JEDER Stufe.
  | Metrik | A | B |
  |---|---|---|
  | Sessions | 104 | 83 |
  | Ø Engagement-Zeit | 39,6s | 31,7s |
  | Ø Scrolltiefe | 31,5% | 26,2% |
  | Signup-Klick-Rate | 28,6% | 21,7% |
  | Shopify-Ja (Gate) | 25,5% | 15,7% |
  | „Termin passt" (WJ-Trigger, stärkstes Signal) | 24,5% | 15,7% |
  | Klick→Commit-Rate | 86% | 72% |
- **Warum B verlor:** Negativ-Framing schreckt eher ab als zieht — B hält 8s kürzer, scrollt flacher, klickt seltener UND committet im Modal schlechter. A's positives Demo-/Neugier-Framing zieht durchgängig besser.
- **Caveat:** statistisch NICHT signifikant (~180 LP-Sessions, 3 Tage, z≈1,1–1,5, p≈0,14). Richtung aber eindeutig + konsistent über alle Metriken → bei Deadline klar genug, A zu nehmen. Echte WJ-Anmeldungen pro Variante nicht Clarity-trennbar (Danke-Titel generisch) → bei Bedarf Lead-Sheet-Spalte `variant`.

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
| **Meta CAPI** | **AKTIV** | `/api/capi` (Vercel-Function, env `META_PIXEL_ID` + `META_CAPI_TOKEN`). Browser-Events werden mit identischer `event_id` gespiegelt → Meta dedupliziert. `external_id` = `vf_ext_id` (localStorage, gleiche Konvention wie Homepage). ⚠️ **OFFEN (entdeckt 2026-07-06):** Seit ~26.06. kommen bei Meta pro Browser-Event **exakt 2 Server-Events** an (vorher 1:1; betrifft ALLE gespiegelten Events, kein Site-Deploy als Ursache). Zählung im Ads Manager bleibt korrekt, solange event_id-Dedup greift — trotzdem klären: Vercel-Log `/api/capi` (1 Invocation pro Event?) + Events Manager → Event-Details → Dedup-Statistik. |
| **Survey-Sink** | **AKTIV (Log) / optional (Sheet)** | `/api/lw-survey` loggt jeden Lead als JSON-Zeile ins Vercel-Log (Prefix `lw-survey`) und forwarded an env **`LW_SURVEY_WEBHOOK`** (beliebige URL, JSON-POST). **EINGERICHTET + GETESTET 2026-06-12**: Google Sheet "LW Leads — Workshop" (ID `1hxXiIMAhHMmjO9YyYxmQEdD6YM6vJjvImh_Kkrc3dTI`), Apps-Script-Projekt in `.agents/lw-sheet/` (clasp). Kein Klaviyo. **Seit 2026-06-13: Partial-Capture** — jede Frage feuert sofort einen Teil-Datensatz (`status=partial`) + ein `pagehide`/`visibilitychange`-Beacon; das Sheet macht **Upsert per `survey_id`** (eine Zeile/Person, wird beim Weiterklicken aktualisiert, endet `complete`). Abspringer landen also IM Sheet statt zu verschwinden. |
| Google gtag (GA4/Ads) | **NICHT installiert** | Code feuert `window.gtag(...)` nur `if(window.gtag)` → No-Op. Bei Bedarf Lade-Snippet in `<head>`, dann feuern alle Events automatisch mit. |

**Cookie-Consent (zwei Keys, gebrückt):** Homepage-Funnel nutzt `vf_consent`
(`granted`/`denied`), LW-Funnel (Test-Modus, kein echtes Gating) nutzt `vf_lw_cookie='1'`.
Damit der Banner pro Browser **nur einmal site-weit** erscheint, prüfen alle LW-Banner
(`live-workshop*.html`, `impressum-lw-*`, `datenschutz-lw-*`) **beide** Keys
(`vf_lw_cookie || vf_consent`) und schreiben beim Schliessen **beide** (`vf_lw_cookie='1'`
+ `vf_consent='granted'|'denied'`). So unterdrückt ein Klick auf einem der beiden Funnel
den Banner auch im anderen. Homepage-Legal-Pages (`impressum.html`/`datenschutz.html`)
lesen `vf_consent` → bleiben dadurch ebenfalls still.

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
| **`lw_signup_click`** | cEvent | **Primärziel.** Klick auf jeden `[data-webinar-cta]` | `loc`: hero / nav / final / inline (**`sticky` entfällt** — Sticky-Bottom-CTA mobil deaktiviert, Nav-CTA „Platz sichern" bleibt sticky sichtbar; kein Doppel-CTA. Markup/JS bleiben, nur `display:none`) |
| `lw_qualify_yes` | track | **Modal Schritt 1** "Hast du einen Shopify-Shop? → Ja" → weiter zu Termin-Step | — |
| `lw_qualify_no` | track | Modal Schritt 1: "Nein, hab ich nicht" → Reject-Screen | — |
| **`lw_no_shop_mailto`** | track | Reject-Screen: Klick auf "Passenderes Angebot anfragen" (mailto an alex@adolution.de, vorformulierter Body). **KEIN Lead-Event** — nur Interessens-Signal No-Shop. | — |
| `lw_commit_date` | track | **Modal Schritt 2** "Ja, der Termin passt" → **IST jetzt der WJ-Trigger** (öffnet WJ-Popup direkt) | — (kein variant!) |
| **`lw_wj_open`** | track | Popup-Overlay-Iframe nach Termin-Bestätigung erkannt (`armWjProbe` pollt ~8s; **jedes** Iframe >300×300px ODER `src` mit `webinarjam`/`genndi`). **= Öffnen hat geklappt** (auch spät). | — |
| **`lw_wj_noopen`** | track | Nach ~8s **nie** ein Popup-Iframe → ging echt nicht auf. **= true fail.** | — |
| `lw_wj_fallback_shown` | track | ~4s kein Popup → Fallback-Karte (`#reg-note`) eingeblendet. Superset (enthält auch Spät-Öffner); kommt ein Popup danach, wird die Karte wieder versteckt + `lw_wj_open`. | — |
| `lw_wj_fallback_click` | track | Klick auf den `#reg-note`-Fallback-Button | — |
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
| **`CompleteRegistration`** (Standard) | `lw_signup_complete` | ⚠️ **WICHTIG (2026-07-07): CR feuert beim TY-Seiten-Landing = direkt nach dem WJ-Formular-Submit (Registrierung), NICHT nach dem Double-Opt-in.** WJ-Backend zählt aber nur **DOI-bestätigte** Leads → Ads Manager ≥ WJ-Backend **per Design** (Beispiel 07.07.: Meta 9 vs. WJ 5 = 4 Registrierte ohne DOI-Klick). Event_id ist deterministisch (`cr_+djb2(email)`) → Registrierungs-Landing UND spätere DOI-Landing derselben Person dedupen zu 1 Conversion; d.h. Meta zählt „unique Registrierte", nicht „Bestätigte". **Umbau auf „erst-nach-DOI" NICHT machbar mit unserem WJ-Zugang (recherchiert 2026-07-07):** (a) WJ-API/Webhook laut User **nicht verfügbar**; (b) WebinarJam gibt der Seite **kein „confirmed"-Signal** — es existiert nur EINE Thank-You-/Confirmation-Seite („Your post-registration confirmation page"), die **nach der Registrierung** (vor DOI) lädt; **keine** separate Post-Confirmation-URL und **kein** Bestätigt-Flag im Querystring (WJ-Doku: `your-own-custom-confirmation-page` → 301 → support-Artikel 153000168593). Auch `wj_lead_unique_link_live_room` kommt schon beim Registrierungs-Landing (verifiziert 2026-06-12) → kein Confirmed-Proxy. **Konsequenz:** CR bleibt = **Registrierungen**. Zwei ehrliche Hebel: (1) prominenter Bestätigungs-Alert (live seit 2026-07-07) hebt die DOI-Rate → Lücke schrumpft; im Ads Manager die Custom Conversion als „Registrierungen" benennen. (2) Falls DOI rechtlich nicht nötig: in WJ **Single-Opt-in** → Registrierung = Teilnehmer → Meta = WJ-Backend, Lücke weg (Deliverability-/Consent-Abwägung, User-Entscheidung). Details:<br>Feuert **nur bei echter WJ-Anmeldung**: (1) `wj_lead_email`/`wj_lead_unique_link_live_room` in TY-URL (= `arrivedFromWJ`), (2) **First-Only-Gate seit 2026-07-06**: Commit-Cookie **`vf_lw_commit`** (setzt die LP beim „Termin passt"-/Fallback-Klick, 45 min) ODER Referrer webinarjam/`/live-workshop`, (3) Guard `vf_lw_reg_fired` (1× pro Browser). Cookie wird nach dem Fire gelöscht. **Grund:** WJ-Mails (Double-Opt-in, Reminder) verlinken die TY-URL INKL. `wj_lead_*` — Klicks landeten in fremden Browser-Kontexten (Mail-App statt In-App-Browser), wo der localStorage-Guard nicht griff → Ads Manager zählte ~3× so viele „Registrierungen" wie WJ-Backend (diagnostiziert 2026-07-06: 10 Browser-Fires bei 3 echten Anmeldungen). Direktaufruf/Bookmark/Reload/Mail-Klick → **kein** Fire. **event_id deterministisch aus E-Mail** (`'cr_'+djb2(email)`). Test: `node test-cr-first-only.mjs`. **= Primär-Conversion Anmeldung.** |
| `LW_Survey_Revenue` `{answer}` | `lw_q_revenue_<answer>` | Frage 1 beantwortet. Antworten: `kein_shop / lt5k / 5to20k / gt20k` |
| `LW_Survey_Apps` `{answer}` | `lw_q_apps_<answer>` | Frage 2. Antworten: `lt50 / 50to150 / 150to400 / gt400` |
| `LW_Survey_Builder` `{answer}` | `lw_q_builder_<answer>` | Frage 3 "Wer macht Änderungen am Shop?". Antworten: `selbst / team / agentur / niemand` |
| `LW_Survey_Focus` `{answer}` | `lw_q_focus_<answer>` | Frage 4. Antworten: `apps_ersetzen / seo / conversion` |
| `LW_Phone_Optin` / `LW_Phone_Skip` | `lw_phone_optin` / `lw_phone_skip` | **Frage 6** (WhatsApp-Unterlagen → Telefonnummer). Versand der Unterlagen passiert NICHT automatisch — manuell aus dem Sheet. |

Seit 2026-06-13: Survey hat **6 Steps**. **Q5 = eigener Step „Welcher Shop ist deiner?"** (optionales Freitext-Feld Shop-Name/URL, „Weiter"-Button, kein eigenes Event) **direkt VOR** dem WhatsApp-Step (Q6). Wert → Spalte `shop` im Sheet, wird beim „Weiter" als Teil-Antwort gepusht.
| `LW_Survey_Complete` `{score, qualified, …}` | `lw_survey_complete` | Survey abgeschlossen |
| **`QualifiedLead`** `{score, revenue, apps, focus}` | `lw_qualified` | Nur wenn qualifiziert. **= Optimierungs-Event für Ads (CPQL).** |
| `LW_OpenInbox` | `lw_open_inbox` | Klick "Postfach öffnen" (Double-Opt-in-Hilfe, Provider aus E-Mail-Domain erkannt) |
| `LW_Danke_Video_Play` | `lw_danke_video_play` | Erstes Play des Show-Up-Videos (zwischen confirm-box + Survey). 1× pro Browser. Show-Up-Signal. |
| `LW_AddToCalendar` `{type}` | `lw_calendar_google` / `lw_calendar_ics` | Kalender-Klick (Show-Up-Commitment) |

Clarity-Tags (Session-Filter): `lw_experiment` (A/B), `lw_revenue`, `lw_apps`,
`lw_builder`, `lw_focus`, `lw_qualified`, `lw_utm_campaign`, `lw_utm_content`.

**Qualifizierungs-Logik (eine Stelle: `finishSurvey()` in danke-live-workshop.html):**
- Score 0–9 = Umsatz (kein_shop 0 · lt5k 1 · 5to20k 2 · gt20k 3) + App-Kosten (lt50 0 · 50to150 1 · 150to400 2 · gt400 3) + Selbermacher (selbst 2 · team/agentur 1 · niemand 0) + Telefon +1.
- **QualifiedLead = Umsatz-Tier ≥ 5.000 €/Monat** (laufender Shop im ICP). Score dient der Feinauswertung im Lead-Sheet/Clarity.

---

## 5. Signup-Flow (aktueller Stand)

1. Meta-Ad → LP mit UTM-Parametern. Block „META PIXEL + AD-ATTRIBUTION“ sichert
   `utm_*` + `fbclid` in **Cookie `vf_lw_attr`** (90 Tage, letzter Paid-Touch
   gewinnt) + localStorage-Mirror. Außerdem: `_fbc`/`_fbp` setzen, `vf_ext_id`,
   Pixel-PageView + CAPI-Mirror.
2. Klick `[data-webinar-cta]` → `lw_signup_click` (cEvent) **+** öffnet Qualifier-Modal.
3. **Modal Schritt 1 = Shopify-Gate** „Hast du einen Shopify-Shop?" (Ja/Nein).
   - „Nein, hab ich nicht" → `lw_qualify_no` → Reject-Screen (harter Filter: nur
     echte Shop-Besitzer kommen durch; Werbe-Algo soll nicht auf Nicht-Besitzer
     optimieren — Grund für den Umbau am 2026-06-15).
     **Reject-Screen (2026-06-16):** glasklarer Ausschluss-Text ("Ohne Shop bringt
     dir der Workshop gar nichts") + Primär-CTA `[data-lwq-mailto]` = mailto an
     alex@adolution.de mit vorformuliertem Body ("Hallo, ich habe noch keinen Shop,
     bin aber trotzdem interessiert am Thema KI + Shopify."). Klick feuert
     `lw_no_shop_mailto` (**kein Lead**). Sekundär: "Nein danke, schließen"
     (`data-lwq-done`). Step 1 hat zusätzlich eine Sub-Zeile, die den Shop-Zwang
     vorab glasklar macht (Anti-Fake-Klick).
   - „Ja, hab ich" → `lw_qualify_yes` → weiter zu Schritt 2 (`show(2)`, **kein** WJ,
     **kein** Close).
4. **Modal Schritt 2 = Termin-Commit** „Kannst du am 9. Juli, 11:00 Uhr?" → der
   **„Ja, der Termin passt"-Button IST jetzt der WebinarJam-Trigger**
   (`.wj-embed-button` + `data-lwq-confirm` + `data-webinarHash="0qgn9gag"`): der echte
   Klick feuert `lw_commit_date`, öffnet das WJ-Registrierungs-Popup direkt und schliesst
   unser Qualifier-Modal (Handler: `track('lw_commit_date'); armWjProbe(); close();`).
   **Reihenfolge bewusst gedreht (2026-06-15):** Shopify-Frage zuerst (Filter), Termin
   zuletzt (= letzter Klick muss der WJ-Popup-Trigger sein, Browser-Popup-Regel).
   **Seit 2026-07-06** setzt der „Termin passt"-Klick (und der `#reg-note`-Fallback-Button)
   zusätzlich das Cookie **`vf_lw_commit`** (45 min, first-party) — das First-Only-Gate
   der Danke-Seite (s. `CompleteRegistration` in §4). In BEIDEN LP-Files identisch.
5. **WebinarJam-Embed ist live.** WJ-Popup öffnet aus dem Shopify-Ja-Klick.
   **Fallback nur bei echtem Fehlschlag:** `armWjProbe()` pollt 3s auf ein sichtbares
   WJ-Iframe. Geht keins auf (`lw_wj_noopen`), blendet es `#reg-note` ein — eine
   **fixierte, zentrierte Karte** (`position:fixed`, raus aus dem Footer-Flow, eigener
   Anmelde-Button + "Kein Fenster aufgegangen?"-Text). Kein Scroll, kein Doppel-CTA.
   Geht das Popup auf (`lw_wj_open`), bleibt `#reg-note` versteckt. `openWebinarForm()`
   existiert nur noch für den No-Modal-Fallback (blendet `#reg-note` ohne Scroll ein).
   **Kein `ready`-Zwischenscreen.** WJ-Loader-Script `embed-button` liegt einmal vor
   `</body>` (beide LP-Files). **Akzentfarbe des Popups:** WJ-Iframe ist
   cross-origin → nicht per CSS stylebar. Einziger Hebel sind die Script-URL-Presets
   `formTemplate=2` (Layout) + `formColor=4` (Farb-Swatch, fixe WJ-Palette, KEIN freies
   Hex). Button selbst trägt Site-Klassen → exakt Terracotta `#C8633E`. Will man die
   Popup-Farbe näher an Terracotta: im WJ-Generator den orangenen Swatch wählen und die
   neue `formColor`-Zahl in beide Script-Tags übernehmen.
6. WebinarJam-Registrierung → **Custom Thank You Page** (in WebinarJam
   konfigurieren!): `https://vorflows.com/danke-live-workshop`. WebinarJam hängt
   Lead-Daten an die URL — verifiziert per Test-Anmeldung (2026-06-12):
   `wj_lead_email`, `wj_lead_first_name`, `wj_lead_last_name`,
   `wj_lead_phone_country_code`+`wj_lead_phone_number`, `wj_room_password`,
   **`wj_lead_unique_link_live_room`** (persönlicher Live-Room-Link),
   `wj_event_ts`/`wj_event_tz`/`wj_next_event_*`. Die Seite liest alles defensiv
   aus, speichert in localStorage (`vf_known_email/_first_name/_last_name/_phone`,
   `vf_lw_live_link`) und macht dann **`history.replaceState` → Query-Params weg**,
   BEVOR Clarity/Pixel laden (sonst PII + persönlicher Link in Recordings/Logs).
   - **Live-Link-Validierung:** nur Links, die exakt auf
     `https://event.webinarjam.com/<hash>/go/live/<hash>` matchen, werden
     akzeptiert — sonst Kalender-Fallback („Link in der Bestätigungs-Mail").
     Validierter Link wandert in Google-Kalender-`details`+`location` und
     ICS-`LOCATION`/`DESCRIPTION` (Show-Up-Hebel: 1 Klick vom Kalender in den Raum).
   - **Advanced Matching:** `fbq('init')` bekommt `em`, `fn`, `ln`, `ph`
     (Pixel hasht selbst per SHA-256); CAPI-Mirror bekommt email/first/last/phone
     und hasht in `api/capi.js`. Telefon wird dort E.164-normalisiert
     (führende `0` → `49`, `00` gestrippt) — sonst matcht Meta deutsche Nummern nicht.
   - **Inbox-Button** zeigt Provider-Namen im Label („Gmail öffnen", „GMX öffnen" …),
     erkannt über E-Mail-Domain; unbekannte Domain → Button bleibt versteckt.
   - Scratch-Test: `node test-wj-params.mjs` (Server auf :3001 nötig).
7. Danke-Seite: **Double-Opt-in zuerst** (Hero: 50%-Balken "Schritt 1 von 2",
   Aufforderung Bestätigungs-Link im Postfach zu klicken, "Postfach öffnen"-Button)
   + `CompleteRegistration` + Survey (5 Fragen) + `QualifiedLead` + Kalender.
   WebinarJam-Double-Opt-in muss in WebinarJam aktiviert sein; der Teilnahme-Link
   geht erst nach Bestätigung raus. Attribution kommt aus `vf_lw_attr` —
   **funktioniert unabhängig vom WebinarJam-Popup**, weil nie URL-Parameter
   durch WebinarJam durchgereicht werden müssen.
- Termin-Datum zentral: `var WEBINAR_DATE` (LP) bzw. `WEBINAR_DATE_TEXT` +
  `WEBINAR_START_UTC`/`WEBINAR_END_UTC` (Danke-Seite, für Kalender-Links).
  **Bei Terminänderung: beide LP-Files + Danke-Seite!**

### WebinarJam-Checkliste (einmalig konfigurieren)
1. ~~Registrierungs-Popup-Code einsetzen~~ ✅ erledigt (Step `ready` im Modal + `#reg-note`-Fallback, WJ-Loader vor `</body>`, beide Files).
2. Thank You Page → "Custom page" → `https://vorflows.com/danke-live-workshop`.
3. Test-Anmeldung mit `?utm_campaign=test&utm_content=testad` durchklicken und im Meta Events Manager (Test-Events) + Clarity prüfen.
4. **WJ-Tracking-Felder** (Integrations → 3rd Party Tracking): Registration/Form/
   Thank-You-Felder **leer lassen** (eigener Funnel trackt besser, Custom-TY-Seite
   umgeht WJ-TY ohnehin). Nur **Live Room** + **Replay** befüllen: Pixel-Base-Code
   + `fbq('trackCustom','LW_Attend')` bzw. `'LW_Replay'` — einzige Stellen ohne
   eigenen Code-Zugriff (Show-Up-Audiences). Match dort schwächer (Fremddomain,
   kein `em`) — perfekte Stufe wäre später Attendance-Import via WJ-API → CAPI.

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

### ⚠️ Clarity-MCP kann den Test NICHT nach Variante trennen (Stand 2026-06-15)
Über die Clarity-MCP-Tools (Claude) ist der A/B-Split **nicht** per Custom-Event/-Tag
lesbar:
- `query-analytics-dashboard` kennt nur Standard-Dimensionen (URL, Titel, Gerät,
  Land, UTM, Engagement). Custom-Events/-Tags (`lw_A`/`lw_B`/`lw_experiment`) →
  Query liefert **leer**.
- `list-session-recordings` mit `smartEvents:["lw_A"]` vs `["lw_B"]` **filtert nicht**
  — beide Aufrufe liefern denselben Session-Topf (verifiziert: 2× exakt 46
  identische Sessions am 2026-06-15).
- **Gespeicherte Clarity-Segmente** (UI) sind über MCP **nicht** ansprechbar
  (kein `segmentId`-Parameter). Segment-Bauen bringt für die MCP-Auslesung nichts.

**Konsequenz Rewrite + früher identischer Titel:** B lief per `x-middleware-rewrite`
(Browser-URL bleibt `/live-workshop`) UND hatte denselben `<title>` wie A → B-Sessions
waren in JEDER MCP-Dimension von A ununterscheidbar (sahen aus wie A).

**FIX (2026-06-15): B hat eigenen `<title>`** → „…Du zahlst für Apps, die KI gratis
ersetzt — vorflows (Variante B)". Damit ist der Split für Claude **MCP-lesbar**:
`list-session-recordings` nur mit Datum-Filter (ohne smartEvents) holen, dann
`displayTitle` parsen — A-Titel = „…Ich baue mit KI…", B-Titel = „…Du zahlst für
Apps… (Variante B)". So zählbar: Sessions, Engagement, Scroll, Danke-Rate je Variante.
(URL bleibt für beide `/live-workshop` wegen Rewrite — volle URL-Trennung ginge nur
per Redirect, schlechter. Titel reicht.)
**Regel:** Bei künftigen A/B-Tests B-File immer eigenen `<title>` geben, sonst ist
der Test über MCP blind. Voller Funnel (Registrierungen je Variante) sonst über
Lead-Sheet-Spalte `variant` oder Clarity-Web-UI (Tag `lw_experiment`).

---

## 8. Google-Sheet-Webhook — EINGERICHTET (2026-06-12)

Live: Sheet "LW Leads — Workshop" → https://docs.google.com/spreadsheets/d/1hxXiIMAhHMmjO9YyYxmQEdD6YM6vJjvImh_Kkrc3dTI
Script-Quellcode + clasp-Config: `.agents/lw-sheet/` (Deploy: `cd .agents/lw-sheet && npx @google/clasp push -f && npx @google/clasp deploy -i <deploymentId>` — Deployment-ID in Vercel-Env `LW_SURVEY_WEBHOOK`).
WhatsApp-Workflow: Sheet nach `phone_optin = TRUE` filtern → Name, Nummer, Antworten, Ad (`utm_content`), Shop (`shop`).

**Schema seit 2026-06-13 (Upsert + Partial):** `Code.js` macht jetzt **Upsert per `survey_id`** statt blind `appendRow`, mit `LockService` gegen Races schneller Teil-Pushes. `submitted_at` = Erst-Kontakt (bleibt bei Updates erhalten), `last_update` = letzter Push. Neue Spalten **nur ans Ende angehängt** (`survey_id, status, shop, last_update`) → Altdaten-Positionen unverändert; `ensureHeaders()` rüstet die Kopfzeile beim ersten Lead automatisch nach. `status`: `partial` (mind. 1 Antwort, noch nicht fertig) / `complete`. **Blank-Schutz:** beim Update wird eine bereits gefüllte Zelle nie mit leer überschrieben (Zweit-Gerät ohne Attribution-Cookie löscht so kein UTM).
✅ **DEPLOYED 2026-06-13 als `@5`** auf die bestehende Webhook-Deployment-ID `AKfycbwwLOLa…KZn43G8sy` (`clasp deploy -i <id>`) → `/exec`-URL unverändert, kein Vercel-Env-Change. Upsert + Partial + Blank-Schutz sind live.
⚠️ **Deploy-Reihenfolge (für künftige Änderungen):** Erst Apps-Script neu deployen (Upsert), DANN Site pushen. Das alte Script ohne Upsert würde sonst pro Teil-Push eine eigene Zeile anlegen (Duplikate je Lead), bis es aktualisiert ist.

Ursprüngliche manuelle Anleitung (Referenz):

1. Neues Google Sheet "LW Leads". Kopfzeile = Feldnamen aus `api/lw-survey.js`
   (`submitted_at, email, first_name, phone, revenue, app_costs, builder, focus,
   phone_optin, score, qualified, variant, utm_source, utm_medium,
   utm_campaign, utm_content, utm_term, fbclid, landed_at` + ans Ende angehängt
   `survey_id, status, shop, last_update`). `Code.js` (aktuelle Quelle) legt die
   Kopfzeile via `ensureHeaders()` selbst an — Snippet unten ist nur historische Referenz.
2. Erweiterungen → Apps Script, einfügen:

```js
const HEADERS = ['submitted_at','email','first_name','phone','revenue','app_costs','builder','focus',
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
