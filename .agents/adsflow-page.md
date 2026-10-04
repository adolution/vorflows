# AdsFlow-Landingpage `/adsflow`

Stand 2026-10-04. Datei `adsflow.html` → Route `https://vorflows.com/adsflow` (`cleanUrls`).
Zweck: Ziel der Meta-Ads für den AdsFlow-VSL. Dunkles Design in der Sprache des VSL
(Grund + Studiolicht, Fraunces/Inter), Farbregel: Terracotta = Claude/AdsFlow/CTA,
Meta-Blau `#0081FB` = alles in Metas Welt (Schalter, Werbekonto). Blau nie als CTA oder Glow.

## Preis + Countdown

Kauf-Link: `https://www.digistore24.com/product/690701?voucher=<gutschein>&ds24tr=vf_adsflow` (Produkt 690701).
Preis-Stufen im Script (`PRICE.steps`): Launch **199 € netto statt 399 €**, Gutschein `adlaunch`, gültig bis
**2026-10-11 23:59 (Berlin)**. Danach steigt der Preis alle 7 Tage. **Für jede neue Stufe einen Eintrag ergänzen**
(Preis, Gutschein aus Digistore, Ende). Ist keine Stufe aktiv, zeigt die Seite automatisch 399 € ohne Gutschein,
Countdown und Launch-Leiste verschwinden. Digistore rechnet netto + 19 % MwSt. (199 € → 236,81 € brutto), deshalb
steht auf der Seite „zzgl. MwSt.“. Gutschein-Ablauf in Digistore muss zum `end` passen.

## Social Proof

Testimonials stammen aus dem Webinar-Deck (`~/Adolution/vorflows-ads/webinar/deck-A-startupads.html`, A13 bis A13e)
und `sales.html` (Adrian), Wortlaut unverändert (Kürzungen nur ganze Sätze oder mit […]). Sie betreffen vorflows
(Shopify-Systeme), nicht AdsFlow, das steht als Hinweis unter dem oberen Block. Referenzen im Alex-Block aus
`live-workshop.html` (404/Atlas/Quiver, Höhle der Löwen, 20.000+ Bestellungen, 1.000+ Kursteilnehmende).

## Produkt-Claims (geprüft 2026-10-04 gegen AdsFlow-2026-10-03)

- Anzeigen werden **veröffentlicht, aber PAUSED** angelegt (CLAUDE.md, ad-upload, upload-und-freigabe.md).
- Gesperrt per `permissions.deny`: `ads_activate_entity`, `ads_update_entity` (auch `mcp__*__…`). Damit kein
  Einschalten und keine Änderung bestehender Anzeigen/Budgets/Status, auch nicht auf Bitte.
- **Nur per Regel, nicht technisch**: dass `ads_create_ad`/`ads_create_campaign`/`ads_create_ad_set` mit PAUSED
  aufgerufen werden. `ads_boost_ig_post` ist nicht gesperrt. Empfehlung fürs Produkt: PreToolUse-Hook, der
  `status != PAUSED` bei Create-Aufrufen blockt, und `ads_boost_ig_post` in die deny-Liste.
- Seite formuliert deshalb: „legt … ausgeschaltet an“ + „Werkzeuge zum Einschalten und Ändern sind gesperrt“.
- Videoanleitung: im ZIP nicht enthalten, Seite nennt nur die PDF-Anleitung.

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
| – | `af_cta_hero` / `nav` / `dock` / `final`, `af_folder_*`, `af_lock_try`, `af_toggles_replay` | Interaktionen |

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
