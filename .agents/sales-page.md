# Kaufseite `/sales`

Stand 2026-10-06. Datei `sales.html` → Route `https://vorflows.com/sales` (`cleanUrls`), indexiert, in der Sitemap.
Neu gebaut im Stil von `/adsflow`: Materialsprache AdsFlow (fast schwarz, Spotlicht, dunkle Glasflächen, Orange,
Fraunces + Inter). Kein Papier/Karton/Korn-Look (Alex 2026-10-04: wirkt billig). Objekte aus dem VSL als Interaktionen.
**Seit 2026-10-06 zusätzlich die Workshop-Visuals von /replay** (Alex: „das Beste von beiden Seiten kombinieren“), auf
Produkt-Aussagen umgeschrieben, ohne Workshop-Bezug (kein Q&A, keine Ratgeberseite, keine Workshop-Zeiten).
**Fassung vor dem Umbau:** `sales-alt.html` → `/sales-alt` (noindex, ohne JSON-LD, ohne Tracking: `isLocal = true`).
Zurück: Datei nach `sales.html` kopieren, Titel/robots/JSON-LD/`isLocal`-Zeile aus der Git-Historie (Commit 96b6156) zurückholen.

## Farbregel

- **Claude-Orange `#D97757`** = Claude, vorflows, deine Aktion (alle CTAs).
- **Shopify-Grün `#95BF47`** (Logo-Grün, dunkel `#5E8E3E`) = alles aus dem Shop: Theme, Daten, Kunden, live.
  Grün nie als CTA. In Überschriften: `<em>` = Orange, `<em class="s">` = Grün.
- Keine Shopify- oder Claude-Logos, nur die Farben. Markenhinweis steht im Footer.

## Aufbau (CRO-Reihenfolge, Stand 2026-10-06)

Hero (VSL + Mini-Player, Hinweis-Kasten „Inklusive: 1:1-Schulung mit mir“ → `#schulung`, Vertrauenszeile, 5 Sprungmarken ins Video) → Stimmen → Laufband
→ **1:1-Schulung `#schulung`** (seit 2026-10-08, Alex: Schulung war „nur an einer kleinen Stelle“; Call-Fenster mit 2 Teilnehmenden,
Setup-Check und Use-Cases, 3 Schritte, Kauf-Knopf + „noch N von 20 frei“) → **Drei Dinge** (Apps ersetzen /
bei Google gefunden werden / mehr Käufe aus Verhalten, jede Zeile springt zu `#apps`, `#suche`, `#klicks`; 10 h → 1 h)
→ App-Miete (Stromzähler) → Ablauf (Schiene + Brücke) → Beweis (echter Shop, Chat, Versandleiste) → Daten (tote Klicks
`#klicks`, Clarity-Beleg, Rubbelfeld `#suche`, Search-Console-Beleg) → große Stimme + **Kauf-Zwischenstopp 1** →
**Problem** (Admin-Rechte: Tresor mit 10.000 Erstattungen; Qualität: Fremdblock im Theme; Sidekick) → **Sicher**
(Duplikat-Schleife, „Drei Wege“: Connector-App / Kopie auf deinem Rechner = Standard im Paket / Test- und Live-Version
mit zwei Zwischenspeichern = optional, „Stell es live“ klickbar; gesperrter Schalter) → **Kontext** (Sternekoch-Küche + Punktfeld
„googeln“) → Ordner mit 7 Registern → **Vorher/Nachher** (Demo-Kopie, `assets/images/replay/shop-*.webp`) → **Eine
Änderung** (29 → 39 € an 5 Theme-Stellen, „von Hand“ vergisst den Footer) + **Kauf-Zwischenstopp 2** → **Grenzen**
(was Claude baut, wo die App bleibt) → Alex → Setup → **Rechnen wir mal** (436 €/Monat, Monate-Regler, SEO-Agentur)
→ Angebot `#bundle` (Vergleich jetzt mit App-Stack 5.232 €) → FAQ (+ digitale Produkte, PageFly/GemPages, Ahrefs)
→ Schluss → Footer. Fett = neu seit 2026-10-06.

Belege (`assets/images/sales/beleg-*.webp`) sind Standbilder aus `assets/video/ki-im-shop.mp4` (Rohmaster,
untracked): Shop 2:08, Versandleiste-Chat 2:48, Clarity-Auswertung 3:20, Suchdaten 4:10. Ringe/Labels sind
Prozent-Positionen im Markup (`--l` Desktop, `--lm` Handy).

**Übernommene Klassen** stammen aus /replay; wo /sales den Namen schon nutzt, heißen sie hier anders: `.pviz` (statt
`.viz`), `.vkey`, `.ly1–3` (statt `.l1–3`, die kollidieren mit `.js .in .l1` der Beleg-Labels), `.cmp-legend`,
`.lchips`, `.sys .node`. Farben auf Claude-Orange `#D97757` umgerechnet.

**Texte:** keine Stakkato-Dreier und Slogan-Fragmente (Linie aus Commit 96b6156), keine Gedankenstriche.
Produkt-Aussagen nur wie im Ordner: Claude hat kein Shopify-Login, im Standard fügst du die geänderte Datei in die
Kopie ein („Deploy = Datei in den Theme-Editor kopieren“), optional mit zwei Zwischenspeichern (Test und Live), live
erst auf das Wort der Inhaberin. **Den Namen des Sync-Dienstes nie nennen, immer „Zwischenspeicher“** (Alex 2026-10-07,
gilt für alle Verkaufs- und Inhaltsseiten; **faqs und danke dürfen GitHub nennen**, dort stehen Käufer-Anleitungen und Prompts). Shopify Dev MCP = Prüf-Werkzeug für Theme-Code, nicht mit dem Shop verbunden.

## Mini-Player + Sprungmarken

Die VSL-Bühne steckt in `#stageSlot` (Platzhalter mit 16:9). Läuft das Video und der Platzhalter ist zu < 35 % im Bild,
bekommt `#stage` die Klasse `is-float` (nur `position: fixed`, kein DOM-Umhängen, sonst pausiert das Video). Leiste
mit Kapitel (`VSL_CH` im Script), ↑ zurück, × = Pause. **Am Handy (≤ 760 px) seit 2026-10-08 oben in voller Breite angeheftet**
(wie YouTube, Kapitel-Leiste darunter), statt eines Fensters über der Kaufleiste, das 62 % der Textbreite verdeckte.
**Stapelebenen:** `.hero` darf kein `isolation`/`z-index`/`transform` haben, `.rise` läuft mit `animation-fill-mode:
backwards`. Sonst liegt der Mini-Player hinter späteren Abschnitten oder klebt am Hero.
Sprungmarken `.tchip` (`data-t` Sekunden im VSL, `data-live="von-bis"`): Klick lädt das Video bei Bedarf und springt;
läuft die Stelle gerade, steht „läuft gerade“ daran. Zeiten aus `assets/video/vorflows-vsl-v1b.vtt`:
0:36 App, 0:59 Auftrag, 1:47 Versandleiste, 2:34 Nutzerdaten, 3:22 Suchdaten, 4:02 Ordner, 4:13 Einrichten.
**Beim VSL-Tausch (v2) alle `data-t`/`data-live` und `VSL_CH` neu setzen.**

## Produkt-Claims (geprüft gegen `~/Downloads/vorflows-produkt/shopifycld-DE`, Stand v3 2026-06-29)

- 119 Skills + 19 Agenten. Register-Zahlen: Shopify-Kern 2, Shop-Daten 4, SEO 25 (+18 SEO-Agenten), Design 28,
  Marketing 45, Arbeitsweise 15 (14 Dev-Workflow + playwright-cli). Summe 119.
- Claude hat **kein Shopify-Login**, arbeitet an der heruntergeladenen Theme-Kopie; `shopify theme push/deploy`
  per deny gesperrt. Duplizieren macht der Founder selbst (nicht Claude). Jede Änderung endet mit Deploy-Block inkl. Rückweg.
- Setup-Zeiten aus den Anleitungen: Claude Code ~10 Min, Search Console ~20 Min, Clarity 5 bis 10 Min (Daten nach ~2 Std).
  Keine Gesamtzeit fürs Grundsystem nennen.
- Mitgeliefertes Muster nur die Bundle-Auswahl (`examples/bundle-selector`). Versandleiste = Live-Demo aus dem VSL,
  kein mitgeliefertes Muster. Keine automatischen Reports/Mails versprechen: Reports laufen auf Zuruf.

## Preis + Checkout

1.499 € netto statt 2.000 €, Digistore 688983, Link
`https://www.digistore24.com/product/688983?voucher=launch&ds24tr=vf_ab_A` (Voucher MUSS mit, Basis ist 2.000 €).
Preis steht an: Dock, Angebotskarte, Kauf-Button, Vergleichskasten, `product:price:amount`, JSON-LD Offer,
`PRICE_VALUE` im Script. `apply-price-sales-webinar.mjs` passt NICHT mehr zur neuen Seite (sucht alte Strings).
Bonus (Schulung + Setup-Call) steht als Kasten in der Angebotskarte und als FAQ: **„Nur 20 pro Monat“ + „noch N verfügbar“**
(seit 2026-10-07 statt „Nur am Webinar-Tag“). Seit 2026-10-08 auch prominent oben: Hero-Kasten, eigener Abschnitt `#schulung`,
Handy-Leiste „vorflows + 1:1-Schulung“. Fakten nur aus FAQ: 2 bis 3 Std. Live-Schulung + Setup-Call, beides 1:1, eine Person
im Call, Einsteiger bekommen Basics inkl. Claude Code. Avatar `assets/images/sales/alex-call-{96,192,320}.webp` = Facecam-Kreis
aus dem VSL-Poster. Die Zahl steht in jedem Element mit `data-bonus-left` (sales.html: Kasten + FAQ + `#schulung`;
sales-alt.html: Kasten + FAQ als Text). Von Hand pflegen, im JSON-LD steht bewusst keine Zahl. danke.html: „Einer von nur 20 Plätzen pro Monat“.

## Video

**Übergangsfassung seit 2026-10-05 (Alex: „zum Übergang drauf“):** Motion-VSL v1b (5:05, Look „Die Mappe“ mit
Papier, wird durch eine v2 im AdsFlow-Material ersetzt). `vorflows-vsl-v1b-{1080,720,480}.mp4` auf Vercel Blob
(`video/…`, Store `vorflows-media`, 1 Jahr immutable), Quelle `~/Adolution/motion-system/vsl/projects/vorflows-sales/out/web-v1/`
(Build 5, feiner Papiergrain). Poster `assets/images/sales/vsl-v1b-poster*.webp`, Untertitel
`assets/video/vorflows-vsl-v1b.vtt`. Laden erst beim Klick, Auflösung per `pickRes()` wie auf /adsflow,
Clarity-Tag `hero_video_res`. Name `v1b`, weil die alten `v1`-Dateien schon einmal live waren (Cache).
**Neuer Schnitt = neuer Dateiname** (`…-v2-…`), dann `VSL_BASE` + `VSL_VTT` + `VSL_POSTER` + VideoObject im JSON-LD tauschen.
Fallback: bisheriges Demo-Video `assets/video/ki-im-shop-1080.mp4` + `assets/images/sales/demo-poster*.webp` (im Repo).

## Tracking (unverändert zur alten Seite)

Meta Pixel `2002118703756086` + CAPI (`/api/capi`, Event-ID-Dedup), Clarity `wnn5d5ehwn`, Google Ads `AW-18158480775`.
Consent: Ohne Wahl läuft Tracking wie bisher („A/B-Test-Modus“), der Hinweis sitzt unten links ohne Sperr-Overlay.
**Seit 2026-10-05 wird „Nur notwendige“ respektiert:** dann kein Laden, keine Events; bei Ablehnung mitten in der Sitzung
`clarity('stop')`, `fbq('consent','revoke')`, gtag consent denied. Volles Opt-in vor dem ersten Laden wäre der nächste Schritt.
Lokal (localhost) wird nichts geladen, nur `console.info`.

| Event | Wann |
|---|---|
| `PageView` | Laden |
| `ViewContent` `{landing-20-percent}` | Sentinel bei 20 % Seitentiefe |
| `pricing_view` + `AddToCart` (1499 EUR) | Preisblock `#offerTop` zu 60 % sichtbar |
| `digistore_redirect`, `InitiateCheckout` (Pixel), gAds `begin_checkout` (1499) | Klick auf Digistore-Link (+ `custom=<gclid>`) |
| `cta_click_hero` / `_sticky` / `_final` / `_inline` | Klick auf `#bundle`-Anker |
| `faq_open` | FAQ aufgeklappt |
| `video_play`, `hero_video_pct_25…100`, `hero_video_watch_<bucket>`, `HeroVideoWatch` | VSL |
| Clarity-only: `sales_unplug`, `sales_ship_plus`, `sales_deadclick_fix`, `sales_scratch_open`, `sales_folder_<id>`, `sales_lock_try` | Interaktionen |
| Clarity-only seit 2026-10-06: `sales_vsl_jump` (+ Tag `sales_vsl_jump_loc` = Section-ID), `sales_float_close`, `sales_float_up`, `sales_vault`, `sales_system_1..3`, `sales_golive`, `sales_kitchen`, `sales_compare`, `sales_legend`, `sales_change_hand`, `sales_change_ki`, `sales_calc`, `sales_calc_agency` | Sprungmarken, Mini-Player, neue Visuals |
| `cta_click_inline` | Kauf-Zwischenstopps (Anker `#bundle` außerhalb von Hero/Dock/Schluss, auch der Knopf in `#schulung`) |
| Clarity-only seit 2026-10-08: `sales_schulung_hero` / `sales_schulung_offer` (Klick auf Hinweis → `#schulung`), `sales_zoom` (Screenshot-Großansicht) | Schulung, Großansicht |

## Handy-Optimierung (2026-10-08)

Alex: „nicht gut mobile-optimiert“. Geprüft bei 320/360/390/430 px, kein seitliches Überlaufen. Alle Regeln stehen gesammelt
am Ende des `<style>` („Handy-Feinschliff“), damit sie gewinnen: `--section` 3.75rem am Handy, „10 h → 1 h“ gestapelt,
Änderungs-Demo mit zwei Knöpfen nebeneinander und Meldungsfläche erst nach dem Tippen, Münzen unter dem Text, Drei-Wege-Tabs
und Dateiliste bei ≤ 420 px, Hover-Texte über `.hov`/`.tap` (`@media (hover: none)`). Terminal-Screenshots (`.shot`,
`.shot-xl`) öffnen per Tippen eine Großansicht `#zoom` (am Handy 1.250 px breit, seitlich wischen, × oder Esc).
Hilfsskripte (Scratchpad, nicht im Repo): Seite Bildschirm für Bildschirm abfotografieren + Overflow/Mini-Schrift messen.

## Feste Leisten

Desktop: nur die Kopfzeile (sticky, deckend). Handy (≤ 760 px): Kopfzeile scrollt mit, nur die untere Kaufleiste `.dock`
(sichtbar außer bei Hero, Angebot, Schluss). Beide deckend, ohne `backdrop-filter` (Safari 26).
