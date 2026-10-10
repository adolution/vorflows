# AdsFlow-Landingpage `/adsflow`

Stand 2026-10-04. Datei `adsflow.html` → Route `https://vorflows.com/adsflow` (`cleanUrls`).
Zweck: Ziel der Meta-Ads für den AdsFlow-VSL. Dunkles Design in der Sprache des VSL
(Grund + Studiolicht, Fraunces/Inter), Farbregel: Terracotta = Claude/AdsFlow/CTA,
Meta-Blau `#0081FB` = alles in Metas Welt (Schalter, Werbekonto). Blau nie als CTA oder Glow.

## Preis + Countdown

Kauf-Link: `https://www.digistore24.com/product/690701?voucher=<gutschein>&ds24tr=vf_adsflow_<A|B>` (Produkt 690701).
Preis-Stufen im Script (`PRICE.steps`): Launch **199 € netto statt 399 €**, Gutschein `adlaunch`, gültig bis
**2026-10-11 23:59 (Berlin)**. Danach steigt der Preis alle 7 Tage. **Für jede neue Stufe einen Eintrag ergänzen**
(Preis, Gutschein aus Digistore, Ende). Ist keine Stufe aktiv, zeigt die Seite automatisch 399 € ohne Gutschein,
Countdown und Launch-Leiste verschwinden. Digistore rechnet netto + 19 % MwSt. (199 € → 236,81 € brutto), deshalb
steht auf der Seite „zzgl. MwSt.“. Gutschein-Ablauf in Digistore muss zum `end` passen.

## Social Proof

Testimonials stammen aus dem Webinar-Deck (`~/Adolution/vorflows-ads/webinar/deck-A-startupads.html`, A13 bis A13e)
und `sales.html` (Adrian), Wortlaut unverändert (Kürzungen nur ganze Sätze oder mit […]). Sie betreffen vorflows
(Shopify-Systeme). Alex 2026-10-04: KEIN Hinweis „Stimmen zu vorflows“ auf der Seite, die Zuordnung der Bewertungen klärt er später selbst. Referenzen im Alex-Block aus
`live-workshop.html` (404/Atlas/Quiver, Höhle der Löwen, 20.000+ Bestellungen, 1.000+ Kursteilnehmende).

## Produkt-Claims (geprüft 2026-10-04 gegen AdsFlow-2026-10-03)

- Anzeigen werden **veröffentlicht, aber PAUSED** angelegt (CLAUDE.md, ad-upload, upload-und-freigabe.md).
- Gesperrt per `permissions.deny`: `ads_activate_entity`, `ads_update_entity` (auch `mcp__*__…`). Damit kein
  Einschalten und keine Änderung bestehender Anzeigen/Budgets/Status, auch nicht auf Bitte.
- **Nur per Regel, nicht technisch**: dass `ads_create_ad`/`ads_create_campaign`/`ads_create_ad_set` mit PAUSED
  aufgerufen werden. `ads_boost_ig_post` ist nicht gesperrt. Empfehlung fürs Produkt: PreToolUse-Hook, der
  `status != PAUSED` bei Create-Aufrufen blockt, und `ads_boost_ig_post` in die deny-Liste.
- Seite formuliert deshalb: „legt … ausgeschaltet an“ + „Werkzeuge zum Einschalten und Ändern sind gesperrt“.
- Videoanleitungen: nicht im ZIP, aber Käufer:innen bekommen mehrere Videoanleitungen (Alex 2026-10-04) → steht auf der Seite.

## A/B-Test #5: Headline (seit 2026-10-04)

| | Headline | Unterzeile | Herkunft |
|---|---|---|---|
| **A** | „Du testest zu wenig Anzeigen. Schuld ist der Ads Manager.“ | „43 Anzeigen in meinem Werbekonto, keine einzige habe ich selbst eingestellt. Im Video zeige ich dir, wie Claude das macht.“ | Schwartz (Problem-Mechanismus) + Ogilvy (Beweis) |
| **B** | „Ein Satz an Claude. 40 fertige Meta Ads in deinem Werbekonto.“ | „Texte, Einstellungen, Formate: alles erledigt. Im Video siehst du live, wie es in meinem Konto passiert.“ | Hormozi (Value Equation) |

Nur Headline + Unterzeile unterscheiden sich, Rest identisch. **Clientseitig, eine Datei** (keine Middleware, keine
B-Datei): Inline-Script im `<head>` lost vor dem ersten Paint aus, Cookie **`vf_ab_af`** (90 Tage), `?ab=A|B`
erzwingt ohne Cookie (QA), Bots immer A. `html[data-ab]` + CSS zeigt `.ab-a` bzw. `.ab-b`. Split 50/50 auf Mobil und Desktop.

Auswertung:
- **Käufe je Variante:** Digistore-Tracking-Key `ds24tr=vf_adsflow_A` bzw. `vf_adsflow_B` (Digistore → Statistiken nach Tracking).
- **Clarity-MCP:** nur über den Titel trennbar → A = „AdsFlow: Du testest zu wenig Anzeigen · vorflows“,
  B = „AdsFlow: Ein Satz an Claude, 40 fertige Meta Ads · vorflows (Variante B)“. Dazu Tag `af_experiment` + Event `af_A`/`af_B` (nur Web-UI).
- **Meta/CAPI:** jedes Event trägt `variant` (A/B). Agentur-Anfragen: Spalte `variant` im Sheet (seit Deployment @4).
- Bei Entscheidung: Verlierer-Markup (`.ab-a`/`.ab-b`) + Head-Script entfernen bzw. Variante fest setzen, Titel angleichen.

## VSL-Video (nicht im Repo)

Quelle: `~/Adolution/motion-system/vsl/test/meta-ads-full_v3.mp4` (12:36,7) auf **1,2×** beschleunigt
(Bild `setpts=PTS/1.2`, Ton `atempo=1.2`, Tonhöhe bleibt) → **10:30,6**. Drei Stufen, H.264 High,
`aq-mode=3` (gegen Banding im dunklen Lichtpool), 2-s-Keyframes zum Spulen, `+faststart`:

| Datei (Vercel Blob `video/…`) | Auflösung | Größe |
|---|---|---|
| `adsflow-vsl-v3-1080.mp4` | 1920×1080, CRF 22, max 3 Mbit/s, AAC 128k | 94 MB (Ø 1,19 Mbit/s) |
| `adsflow-vsl-v3-720.mp4` | 1280×720, CRF 22, max 1,8 Mbit/s, AAC 96k | 50 MB (Ø 0,64 Mbit/s) |
| `adsflow-vsl-v3-480.mp4` | 854×480, CRF 23, max 0,95 Mbit/s, AAC 80k | 27 MB (Ø 0,35 Mbit/s) |

Store `vorflows-media`, Basis-URL `https://ywogisjwo1efkri1.public.blob.vercel-storage.com/video/`.
Upload wie Replay (§9 in `live-workshop-tracking.md`): `vercel blob put <datei> --rw-token $BLOB_READ_WRITE_TOKEN
--access public --pathname video/<name>.mp4 --content-type video/mp4 --cache-control-max-age 31536000`.
**Neuer Schnitt = neuer Dateiname** (`…-v4-…`), weil 1 Jahr immutable gecacht; dann `VSL_BASE` + `VSL_VTT` im Script tauschen.

Auswahl im Browser (`pickRes()`): Datensparen oder 2G/3G → 480, Handy (≤ 760 px) → 720,
Desktop mit `downlink < 2.5` → 720, sonst 1080. Das Video lädt erst beim Klick auf Play
(Poster `assets/images/adsflow/vsl-poster*.webp` = LCP). Untertitel: `assets/video/adsflow-vsl-v3.vtt`
(aus der v3-SRT, Zeiten ÷ 1,2, Schreibweisen Claude/Higgsfield/Ogilvy korrigiert), im Player zuschaltbar.

## Feste Leisten (Sticky-CTA)

Pro Gerät genau EINE feste Kaufleiste: Handy (≤ 760 px) nur die untere Leiste `.dock` (Preis + „AdsFlow holen“,
sichtbar zwischen Hero und Angebot, aus bei Angebot/Agentur/Schluss), die Kopfzeile scrollt dort mit (`position: relative`).
Desktop nur die feste Kopfzeile, `.dock` gibt es dort nicht. Beide Leisten haben einen **deckenden** Hintergrund
(`var(--bg)`) und **kein `backdrop-filter`**: Safari 26 (iOS) zieht nur dann die Leistenfarbe bis hinter Statusleiste
bzw. Toolbar. Mit Transparenz/Blur scrollt die Seite sichtbar über/unter der Leiste („Pflaster“-Optik).

## Ordner-Explorer mobil (≤ 900 px)

Die Ordner sind dort eine seitlich scrollbare Chip-Leiste. Damit klar ist, dass man sie antippen kann:
Hinweis „9 Ordner · zum Öffnen tippen“, beim ersten Sichtkontakt ruckelt die Leiste kurz nach rechts und zurück,
dann tippt eine Hand (Phosphor `hand-tap`) dreimal auf den zweiten Ordner. Ordner antippen, Leiste wischen oder
blättern beendet die Hand für immer. Unter dem Inhalt sitzt eine Weiter-Leiste (← · Fortschritt · „Weiter ad-qa →“),
die zum Anfang des Explorers zurückspringt. Desktop unverändert. Klasse heißt `is-tapping`, nicht `play`
(`.play` ist der Video-Button mit negativem Margin).

## Tracking

Clarity (`af_*`) + Meta Pixel/CAPI mit Event-ID-Dedup, gleicher Attribution-Block wie LP/Replay
(`vf_lw_attr`, `_fbc`/`_fbp`). Lokal (localhost) wird nichts gesendet, nur `console.info`.

| Meta-Event | Clarity-Event | Wann |
|---|---|---|
| `ViewContent` `{content_name:'AdsFlow'}` | `af_view` | Seitenaufruf |
| `AF_VSL_Play` `{res}` | `af_vsl_play` | Klick auf Play (Tag `af_vsl_res`) |
| `AF_VSL_Progress` `{pct}` | `af_vsl_25` / `_50` / `_75` / `af_vsl_complete` | Watch-Depth, je 1× pro Seitenaufruf |
| `InitiateCheckout` | `af_checkout` | Kauf-Button im Angebot |
| `Lead` `{clients, spend}` | `af_agency_lead` | Agentur-Formular erfolgreich |
| – | `af_agency_q1` / `_q2` | Formular-Fragen beantwortet |
| – | `af_cta_hero` / `nav` / `dock` / `final`, `af_folder_*` (+ `af_folder_pager` = Weiter-Leiste mobil), `af_lock_try`, `af_toggles_replay` | Interaktionen |

## Sicherheit Formular

API (`api/adsflow-agency.js`): nur POST + JSON, max. 4 KB, Origin muss `https://vorflows.com` oder
`https://www.vorflows.com` sein (sonst 403), Honeypot + Zeitfalle (< 3 s) → stilles 200 ohne Speichern,
Rate-Limit 5 Anfragen / 10 min pro IP und Instanz (429), Felder gekürzt, Steuerzeichen und Formel-Präfixe raus,
Auswahlfelder nur aus fester Liste, E-Mail streng geprüft (keine Zeilenumbrüche → keine Header-Injection).
Apps Script: Pflicht-Secret `SHARED_SECRET` aus `secret.js` (gitignored, nur per clasp bei Google, Gegenstück
Vercel-Env `ADSFLOW_AGENCY_SECRET`, fail closed), Formel-Schutz beim Schreiben, Mail-Drossel (1 Mail pro Adresse
in 30 min, max. 20 Mails/h), Mail nur Klartext ohne Links. Script-Scopes: nur `spreadsheets.currentonly` +
`script.send_mail`, es kommt also an nichts anderes in deinem Google-Konto.
Secret rotieren: neuen Wert in `secret.js` + `clasp push` + `create-deployment -i …`, dann Vercel-Env ersetzen + Redeploy.

## Agentur-Formular → Sheet + Mail

`POST /api/adsflow-agency` (`api/adsflow-agency.js`): prüft E-Mail, loggt jede Anfrage ins Vercel-Log
(Prefix `adsflow-agency`) und leitet an env `ADSFLOW_AGENCY_WEBHOOK` weiter (+ `ADSFLOW_AGENCY_SECRET`).
Felder: `email`, `phone` (optional), `clients` (`1-5|6-15|16-40|40+`), `spend` (`<10k|10-50k|50-200k|200k+`),
`qualified` (ab 6 Kunden oder ab 10k Spend), UTM.

Apps Script in `.agents/adsflow-agency-sheet/` (clasp, an das Sheet „AdsFlow Agentur-Anfragen“ gebunden):
hängt eine Zeile an und schickt eine Mail an alex@adolution.de (Reply-To = Anfragende:r).
Deployment `AKfycbxwoFmr…P96eT1h` (@1). Einmalig nötig:

1. Script im Editor öffnen (`npx @google/clasp open-script` im Ordner), Funktion `authorizeOnce` ausführen,
   Zugriff erlauben → Testzeile + Test-Mail kommen an. (Einziger offener Schritt, Stand 2026-10-04.)
2. Erledigt 2026-10-04: Secret in `secret.js` (gepusht, Deployment @3), Vercel-Env `ADSFLOW_AGENCY_WEBHOOK`
   + `ADSFLOW_AGENCY_SECRET` (Production) gesetzt.

Code-Änderung: `npx @google/clasp push -f && npx @google/clasp create-deployment -i <deploymentId>` (URL bleibt gleich).
Hinweis: `.agents/` ist auf vorflows.com öffentlich abrufbar, deshalb hier keine vollständige Webhook-URL und kein Secret.

## Danke-Seite `/danke-adsflow` (seit 2026-10-10)

Datei `danke-adsflow.html` → `https://vorflows.com/danke-adsflow`, `noindex`, nicht in Sitemap/llms.txt.
**In Digistore (Produkt 690701) als Danke-Seite eintragen** (Stand 2026-10-10 noch offen). Look = LP `/adsflow`
(gleiche Tokens, Terracotta = Claude/Aktion, Meta-Blau = Metas Welt).

Aufbau: Hero mit Pflicht-Download „Bitte zuerst diese Datei herunterladen und lesen.“
(`assets/help/AdsFlow-Zuerst-lesen.pdf` = Kopie von `product/adsflow/00-ZUERST-LESEN.pdf`, **bei jedem Release neu kopieren**)
→ drei Schritte (Wortlaut aus `~/Downloads/AdsFlow/docs/kunden-kommunikation.md`, Text 3, ohne Gedankenstriche)
→ 8 Loom-Videos in drei Teilen → Spickzettel „Sätze“ (aus Produkt-README) → Installation von null → FAQ → Hilfe.

Videos (Reihenfolge von Alex, Titel aus den Transkripten neu formuliert):

| # | Titel | Loom-ID | Dauer |
|---|---|---|---|
| 01 | Setup und Sicherheit | fcacd86099f74f62907536fe32fc2889 | 8:15 |
| 02 | Claude richtig nutzen | 1b4b86929446447bbfe40c1d1d7bf5bd | 5:08 |
| 03 | Meta-Werbekonto verbinden | 5ba2934fa1954f7f95002103fef04ca1 | 3:42 |
| 04 | Das Setup starten | 87ec2f62ac064d0e8ca2784c75652669 | 2:29 |
| 05 | KI-Bilder mit Higgsfield (optional) | b85ad39bbd9a4f98b50bc752aa7c63e4 | 5:29 |
| 06 | Die ersten Anzeigen | 10935fb0ca7942b5995365274a64c27a | 8:34 |
| 07 | Jeden Tag neue Creatives | 5148b04a739a452d9402804f0547d23d | 5:25 |
| 08 | Connector-Rechte (optional) | 31a56db6f72646a6806382b430c7804c | 2:37 |

- Loom lädt erst per Klick (Facade, wegen Loom-Rate-Limit wie auf `/danke`). Rahmen 1662:1080 = Videoformat.
- Vorschaubilder + Screenshots in `assets/images/adsflow/danke/`: `poster-1..8.webp` (Frames aus den Videos,
  weichgezeichnet + abgedunkelt, damit Chat-Titel/Konten nicht lesbar sind), Ausschnitte `connector-dialog`,
  `erweiterung`, `modus-menue`, `medienbibliothek` (Kontoname weichgezeichnet), `spalten-id`, `tool-rechte`,
  `higgsfield-mcp`. Neues Video = neue Datei (Assets sind 1 Jahr immutable gecacht).
- „Angesehen“-Häkchen + Fortschritt pro Browser in `localStorage` (`vf_af_danke_seen`), Play-Klick hakt automatisch ab.
- FAQ-Suche clientseitig (Umlaute normalisiert), Kategorien zählen sich selbst.
- Modell-Empfehlung für AdsFlow (laut Video 2): Opus Standard, Sonnet bei Limit, **Fable + Haiku nie**; Effort Medium,
  bei flachen Ergebnissen High. Weicht bewusst von `/faqs` (Shopify) ab.
- Kein Tracking eingebaut (kein Purchase-Pixel, kein Clarity), Stand 2026-10-10.
