# Startseite `/` (Marken-Hub)

Stand 2026-10-10. Datei `index.html` → `https://vorflows.com/`. Bis 2026-10-09 leitete `/` per 307 auf
`/live-workshop`; seitdem zeigt die Domain diesen Hub.

**Zweck:** Leute, die „vorflows“ googeln, nachdem sie eine Anzeige oder einen LinkedIn-Post gesehen haben. Sie wollen
prüfen, ob das seriös ist, wer dahinter steckt und was genau verkauft wird. Danach sollen sie zum passenden System:
`/sales` (vorflows für Shopify) oder `/adsflow` (AdsFlow für Meta Ads). Als dritter, leiserer Weg ist die
**Aufzeichnung des letzten Workshops** (`/replay`) verlinkt (Kopfzeile „Shopify-Workshop“, eigener Kasten, Schluss, Footer).
Immer **„Shopify-Workshop“** schreiben (Alex 2026-10-10), damit klar ist, dass es nicht um Meta geht. Ausnahme: Foto-Text
und Referenz „Workshops vor Ort“ im Alex-Block, das Foto zeigt einen Meta-Ads-Workshop.
Seit 2026-10-10 gibt es keinen laufenden Live-Workshop, deshalb nicht `/live-workshop` verlinken; wenn wieder einer
läuft, die vier Links zurückstellen.

## Aufbau

1. **Hero:** H1 „vorflows macht aus Claude deinen Shopify-Entwickler und dein Anzeigen-Team“, rechts Alex mit Name +
   Kurztext, darunter zwei gleich gewichtete **Türen** (je Video-Standbild, Welt-Markierung, Text, Button).
   Darunter Gesichter-Reihe + „Kunden wie 404, Atlas und Paddy AI …“ → `#stimmen`.
   **Handy (≤ 720 px):** Reihenfolge per CSS `order` umgestellt: Headline → Name/Foto → Türen → Kurztext → Gesichter,
   damit die erste Tür samt Knopf ab 360 px im ersten Bild steht und die zweite angeschnitten sichtbar ist.
2. **Namen-Laufband:** Kunden und Käufer als Text (keine Logos vorhanden).
3. **Stimmen `#stimmen`:** 12 echte Zitate. Jede trägt ihre Herkunft:
   - grün „über vorflows für Shopify“ = Käufer, Wortlaut wie auf `/sales` (Bodeske, Bonk, Kisker, Leo/PURE U, Adrian, Wonning)
   - grau „über meine Beratung/Ausbildung/Schulung“ = Kunden aus Alex' Beratung, Wortlaut + Fotos von
     `startupads.de` (Robin/404 & Atlas, Lukas/Paddy AI, Sebastian/Vansite, Felix/Curawork, Lasse/Ledist, Leo & Carla/PURE U).
     Gedankenstriche in den Zitaten durch Komma/Doppelpunkt ersetzt, sonst unverändert.
   - **Keine AdsFlow-Stimmen**, solange es keine echten gibt (siehe `.agents/adsflow-page.md`). Keine erfundenen Zitate.
   - Handy: erst 4 Kacheln, Rest hinter „Alle Stimmen zeigen“.
4. **Alex `#alex`** („Wer hinter vorflows steckt“; „Dahinter stehe ich mit meinem Namen“ klang Alex zu sehr nach HiPP): Workshop-Foto (Beweis) + Lifestyle-Foto (sympathisch), Ich-Text, Fakten (9 Jahre, 20.000+,
   1.000+, 1.200+), Referenzen, LinkedIn/Instagram/Mail, AMD Media GmbH + Impressum-Link.
5. **Vergleich `#systeme`:** zwei Karten mit gleichen Zeilen (Subgrid): Für wen, Was Claude übernimmt, Was du
   entscheidest, Im Paket, Was du brauchst, Preis. Darunter die gemeinsame Regel (live geht nur, was du freigibst).
6. **Aufzeichnung `#workshop`:** Kasten „Lieber erst mal zuschauen?“ → `/replay`, mit Terracotta-Laden (rechte Hälfte von `brand_assets/webinar/storefront.webp`).
7. **FAQ `#fragen`:** Marken-Check-Fragen (wer, Unterschied, beide nötig, Abo, Programmieren, Sicherheit, Zahlung).
   Links daneben Alex-Porträt + Mail.
8. **Schluss:** „Womit soll Claude für dich anfangen?“ mit beiden Buttons.
9. **Handy-Leiste `.dock` (≤ 760 px):** deckend, zwei Buttons „vorflows für Shopify“ + „AdsFlow“ (unter 360 px „Für Shopify“).
   Erscheint, sobald die Türen oben raus sind, und verschwindet, solange Vergleich, Schluss oder Footer im Bild sind.
   Das ist die einzige feste Leiste am Handy (Kopfzeile scrollt dort mit).

## Farbregel

Wie `/adsflow` (Fraunces + Inter, dunkler Grund, Terracotta `#C8633E` = Aktion/alle CTAs). Zusätzlich je System eine
Markierungsfarbe: **Shopify-Grün** (`--shop-ink #A9CF68`) für alles zu vorflows für Shopify, **Meta-Blau**
(`--meta-ink #4DA6FF`) für AdsFlow. Nur als Punkt, Wort in der H1 oder Linie über der Vergleichskarte, nie als Button
oder Glow.

## Preise auf der Seite (bei Preisänderung mitpflegen!)

Nur im Vergleichskasten `#systeme`:
- vorflows: `1.499 € netto, einmalig`, Strike `2.000 €`, „Ratenzahlung möglich“ (muss zu `sales.html` passen).
- AdsFlow: `299 € zzgl. MwSt.` statt `499 €`, „Launch-Preis bis 2.11.“. Ab `AF_LAUNCH_END` im Script
  (`2026-11-02T23:59:59+01:00`, verlängert 2026-10-11) ersetzt JS den Inhalt von `[data-af-price]` durch `499 € zzgl. MwSt., einmalig`.
  Neue AdsFlow-Preisstufe → Markup + `AF_LAUNCH_END` hier anpassen (Quelle: `PRICE.steps` in `adsflow.html`).
Die Startseite hat keinen eigenen Kauf-Link, alle Buttons gehen auf `/sales` bzw. `/adsflow`.
Die Zahl „noch N verfügbar“ der 1:1-Schulung steht bewusst nicht hier (nur auf `/sales`, `/replay`).

## Bilder (`assets/images/home/`)

| Datei | Quelle |
|---|---|
| `alex-lifestyle-400/640.webp` | `~/Downloads/Bildschirmfoto 2025-01-16 um 02.34.48.png` (Alex' Lieblingsbild für sympathisch) |
| `alex-portrait-480.webp` | `startupads.de/brand_assets/startup-marketing-ausbildung-alex.webp`, Ausschnitt |
| `av-*-96/192.webp` | Testimonial-Fotos von `startupads.de` (lasse, lukas, robin) und deren Framer-Bilder (sebastian, leo-carla, felix) |
| `workshop-shop(-372).webp` | rechte Hälfte von `brand_assets/webinar/storefront.webp` |
Wiederverwendet: `assets/images/adsflow/alex.webp` (Workshop vor Publikum), die Video-Poster von `/sales` und `/adsflow`.
OG-Bild `brand_assets/og-home.jpg` per `node render-og-home.mjs` (lokaler Server muss laufen).

## Tracking

Clarity `wnn5d5ehwn` + Meta Pixel `2002118703756086` (nur PageView), lokal nichts. Attribution (`vf_lw_attr`, `_fbc`,
`_fbp`, `vf_ext_id`) wie LP/Replay/AdsFlow, damit UTM und fbclid bis zur Kaufseite mitlaufen.
Clarity-Tag `vf_page=home`, Events `hub_view`, `hub_cta_<data-cta>` (z. B. `hub_cta_door_vorflows`,
`hub_cta_door_adsflow`, `hub_cta_sys_*`, `hub_cta_final_*`, `hub_cta_nav_*`, `hub_cta_dock_*`, `hub_cta_ws_replay`,
`hub_cta_nav_replay`, `hub_cta_final_replay`), `hub_voices_more`.
Im Clarity-MCP über den Titel „vorflows · Claude-Systeme für Shopify und Meta Ads“ filtern.

## Routing

- `vercel.json`: Redirects `/` + `/index.html` → `/live-workshop` entfernt. Neu `/index-b` → `/` (301), weil die alte
  B-Variante indexiert sein kann.
- `middleware.js`: matcht nur noch `/live-workshop` (Homepage-Test `vf_ab` beendet).
- Alte Startseite + B-Variante: `.agents/archiv/index-alt-2026-10-10.html`, `index-b-alt-2026-10-10.html`.
- Links `/#bundle`, `/#pricing`, `/#workflow`, `/#faq`, `/#module` auf Modul-, Blog- und Rechtsseiten zeigen jetzt auf
  `/sales#preis`, `/sales#ablauf`, `/sales#faq`, `/sales#ordner`.

## Copy-Regeln

Wie auf allen vorflows-Seiten: keine Gedankenstriche, Überschriften ohne Schlusspunkt, keine Stakkato-Paare, Ich-Form
ohne Selbstzitate, GitHub/Clarity/Search Console nicht nennen (Ersatz: Klick- und Suchdaten, Zwischenspeicher).
