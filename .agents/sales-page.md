# Kaufseite `/sales`

Stand 2026-10-05. Datei `sales.html` → Route `https://vorflows.com/sales` (`cleanUrls`), indexiert, in der Sitemap.
Neu gebaut im Stil von `/adsflow`: Materialsprache AdsFlow (fast schwarz, Spotlicht, dunkle Glasflächen, Orange,
Fraunces + Inter). Kein Papier/Karton/Korn-Look (Alex 2026-10-04: wirkt billig). Objekte aus dem VSL als Interaktionen. Die alte Fassung liegt in der Git-Historie (Commit vor dem Neubau).

## Farbregel

- **Claude-Orange `#D97757`** = Claude, vorflows, deine Aktion (alle CTAs).
- **Shopify-Grün `#95BF47`** (Logo-Grün, dunkel `#5E8E3E`) = alles aus dem Shop: Theme, Daten, Kunden, live.
  Grün nie als CTA. In Überschriften: `<em>` = Orange, `<em class="s">` = Grün.
- Keine Shopify- oder Claude-Logos, nur die Farben. Markenhinweis steht im Footer.

## Aufbau

Hero (VSL) → Stimmen → Laufband „Du schreibst Claude ganz normal“ → App-Miete (Stromzähler) → Ablauf (Schiene,
Brücke Claude ⇄ Ordner ⇄ Shop) → Beweis (echter Shop + Chat + Versandleiste zum Ausprobieren) → große Stimme →
Daten (tote Klicks zum Antippen, Clarity-Beleg, Glas zum Freiwischen, Search-Console-Beleg) → Ordner mit 7 Registern →
Sicher (Live-Theme vs. Kopie, gesperrter Schalter) → Alex → Setup → Angebot `#bundle` → FAQ → Schluss → Footer.

Belege (`assets/images/sales/beleg-*.webp`) sind Standbilder aus `assets/video/ki-im-shop.mp4` (Rohmaster,
untracked): Shop 2:08, Versandleiste-Chat 2:48, Clarity-Auswertung 3:20, Suchdaten 4:10. Ringe/Labels sind
Prozent-Positionen im Markup (`--l` Desktop, `--lm` Handy).

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
Webinar-Bonus (Schulung + Setup-Call) steht als Kasten in der Angebotskarte und als FAQ.

## Video

Aktuell das bisherige Demo-Video `assets/video/ki-im-shop-1080.mp4` (Screen-Aufnahme 5:23, im Repo), Poster
`assets/images/sales/demo-poster*.webp` (Videobild 2:10 als Screen auf dunklem Grund). Lädt erst beim Klick.
Der Motion-VSL (`vsl/projects/vorflows-sales`) ist **noch nicht fertig** (Alex 2026-10-05) und deshalb nicht eingebunden.
v1-Encodes liegen ungenutzt auf Vercel Blob (`video/vorflows-vsl-v1-*.mp4`, dürfen gelöscht werden).
Wenn der VSL fertig ist: Encodes mit neuem Namen auf Blob, im Script `VIDEO_SRC`/`VIDEO_POSTER` tauschen
(bei mehreren Stufen `pickRes()` aus adsflow.html übernehmen), Untertitel als `<track>`, VideoObject im JSON-LD anpassen.

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

## Feste Leisten

Desktop: nur die Kopfzeile (sticky, deckend). Handy (≤ 760 px): Kopfzeile scrollt mit, nur die untere Kaufleiste `.dock`
(sichtbar außer bei Hero, Angebot, Schluss). Beide deckend, ohne `backdrop-filter` (Safari 26).
