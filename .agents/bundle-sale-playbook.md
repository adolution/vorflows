# Bundle-Sale — Set & Revert Playbook

Single source of truth dafür, **wie man einen befristeten Bundle-Sale anschaltet und wieder
zurückstellt.** Damit der nächste Sale in Minuten statt Stunden läuft.

Letzter Stand: **2026-06-29 — Sale AUS, Regulärpreis 897 € netto** (Webinar-Sale
25.–28.06.2026 wieder zurückgestellt). Voriger Sale: 397 € netto statt 897 €, Voucher
`launchsale`, Countdown bis 28.06.

> ⚠️ **Geld + Kundenseite.** Der angezeigte Preis MUSS exakt dem entsprechen, was
> Digistore24 (Produkt `688983`) **ohne Voucher** abbucht. Der Voucher `launchsale`
> rabattiert vom Regulärpreis auf den Sale-Preis. Stimmen Seite und Digistore nicht
> überein → Kunde zahlt falschen Betrag.

---

## Begriffe / Werte

| Platzhalter | Bedeutung | letzter Sale | regulär |
|---|---|---|---|
| `SALE` | Sale-Preis (netto) | `397` | — |
| `REG` | Regulär-/Listenpreis (netto), = Digistore-Basis ohne Voucher | — | `897` |
| `SPAR` | `REG − SALE` (Ersparnis-Label) | `500` | — |
| `VOUCHER` | Digistore-Gutscheincode | `launchsale` | — |
| `END` | Aktionsende (Europe/Berlin) | `2026-06-28T23:59:00+02:00` | — |

Netto-Framing über die ganze Seite (`… netto`, JSON-LD `valueAddedTaxIncluded:false`).
Beibehalten.

## Betroffene Dateien (immer ALLE anfassen)

`index.html` (A) · `index-b.html` (B) · `baseflow.html` · `seoflow.html` ·
`clarityflow.html` · `danke.html` · `vercel.json`.

> **A + B sind ein Mobile-50/50-Split** (`middleware.js`, Cookie `vf_ab`). Jede
> Preis-/Voucher-Änderung MUSS in **beide** index-Files, sonst zahlt die B-Hälfte
> falsch.

---

## Sale ANSCHALTEN

### 1. `index.html` (A)
- **JSON-LD `offers`** (im `<head>`):
  - `name`: `… ClarityFlow)` → `… ClarityFlow) — Launch-Preis`
  - `description`: `"Einmalkauf SALE € netto statt REG € · befristete Aktion bis <DD.MM.JJJJ> · Ratenzahlung möglich via Digistore24."`
  - `"price": "SALE"`, `"priceValidUntil": "<JJJJ-MM-TT von END>"`
  - `priceSpecification` von **einzelnem Objekt → Array**:
    ```json
    "priceSpecification": [
      { "@type":"UnitPriceSpecification","priceType":"https://schema.org/SalePrice","price":"SALE","priceCurrency":"EUR","valueAddedTaxIncluded":false,"validThrough":"<JJJJ-MM-TT>" },
      { "@type":"UnitPriceSpecification","priceType":"https://schema.org/ListPrice","price":"REG","priceCurrency":"EUR","valueAddedTaxIncluded":false }
    ],
    ```
- `<meta property="product:price:amount" content="SALE.00" />`
- **Launch-Strip** (Markup) direkt nach `<article class="bundle-hero" id="bundle" …>`, hinter dem `<!-- Launch-Sale window -->`-Kommentar einfügen — CSS `.bundle-hero-launch*` liegt bereits dormant im File:
  ```html
  <header class="bundle-hero-launch" data-launch-active>
    <div class="bundle-hero-launch-row">
      <span class="bundle-hero-launch-tag">Launch-Preis · spar SPAR&nbsp;€</span>
      <span class="bundle-hero-launch-count">Aktion bis <span data-launch-until>—</span><span data-launch-days-wrap hidden> · noch <strong data-launch-days>—</strong> Tage</span></span>
    </div>
    <div class="bundle-hero-launch-track" aria-hidden="true"><div class="bundle-hero-launch-fill" data-launch-bar style="width: 100%"></div></div>
  </header>
  <header class="bundle-hero-launch bundle-hero-launch--soldout" data-launch-expired hidden>
    <span class="bundle-hero-launch-tag">Launch-Preis abgelaufen</span>
    <span class="bundle-hero-launch-count">Bundle wieder zum regulären Preis</span>
  </header>
  ```
- **Preisblock**: `<span class="bundle-hero-strike">REG&nbsp;€</span>` zwischen `bundle-hero-price` (= `SALE €`) und `bundle-hero-suffix` einfügen.
- **Checkout-Link** (`.bundle-hero-cta`): `?ds24tr=vf_ab_A` → `?voucher=VOUCHER&ds24tr=vf_ab_A` (ds24tr-Param BLEIBT immer).
- **Hero-CTA** (oben): `Bundle sichern · SALE € statt REG €`.
- **Sticky-Bar**: Label-Zeile `<span class="sticky-cta-label">Launch-Preis · spar SPAR&nbsp;€</span>` über die Preiszeile; Preis `SALE €`.
- **Countdown-JS** (`// Launch sale window`): `LAUNCH_START`/`LAUNCH_END` setzen. Die `applyLaunchCountdown`-IIFE liegt bereits im File und befüllt die `data-launch-*`-Felder automatisch.
- **Tracking-Werte** auf `SALE`: `PLAN_VALUE['pricing-bundle']`, der `planValue`-Fallback, `trackFb('AddToCart', { value: SALE.0 })`, `gAdsConvert('begin_checkout', { value: SALE.0 })`.
- Alle übrigen Preis-Erwähnungen (`inline-cta-meta`, Bottom-CTA) auf `SALE`.

### 2. `index-b.html` (B) — analog, aber andere Klassennamen
- JSON-LD + `product:price` + Tracking: **identisch zu A**.
- `<span class="offer-price-now">SALE&nbsp;€</span>` + darunter `<span class="offer-price-was">REG&nbsp;€</span>`.
- `offer-pricing-note`: `<strong>Launch-Preis</strong> · netto · Aktion bis <span data-launch-until>—</span><span data-launch-days-wrap hidden> · noch <strong data-launch-days>—</strong> Tage</span> · <strong>Ratenzahlung möglich</strong> über Digistore24.`
- `.offer-cta`-Link: `?voucher=VOUCHER&ds24tr=vf_ab_B`.
- Sticky-Label-Zeile wie A.
- `transform-to`-Zeile: `Einmal SALE € netto statt REG €.`
- Countdown-JS: nur `LAUNCH_END` (B ist die schlanke Variante).

### 3. Module (`baseflow/seoflow/clarityflow.html`)
- JSON-LD `price` → `SALE`; Beschreibung/FAQ `… für SALE € netto (statt REG €) …`.
- Buttons: `Im Bundle für SALE €`, `Bundle sichern · SALE €`.
- `mod-cta-body`: `Einmalkauf SALE € netto statt REG €.`
- (Module verlinken auf `/#bundle`, **kein** eigener Digistore-Link → kein Voucher nötig.)

### 4. `danke.html`
- gAds-Purchase-Conversion `value: SALE.0`.

### 5. `vercel.json` — Homepage zeigt den Sale
Die zwei Homepage-Redirects **entfernen**, damit `vorflows.com` wieder die Sale-Seite (`index.html`) zeigt statt auf `/live-workshop` zu leiten:
```json
{ "source": "/", "destination": "/live-workshop", "permanent": false },
{ "source": "/index.html", "destination": "/live-workshop", "permanent": false }
```
`{ "source": "/webinar", … "permanent": true }` bleibt immer.

---

## Sale ZURÜCKSTELLEN (revert)

**Wichtig:** Preise reverten NICHT automatisch nach `END`. Der Countdown blendet nur den
Strip auf „abgelaufen" — Preis/CTAs/JSON-LD bleiben auf Sale, bis man manuell zurückstellt.

Genau die Schritte oben rückwärts, Ziel = Regulärpreis `REG` netto:
1. **JSON-LD**: `name` ohne `— Launch-Preis`; `description` = `"Einmalkauf REG € netto · Ratenzahlung möglich via Digistore24."`; `"price":"REG"`; `priceValidUntil` auf fernes Datum (z. B. `2026-12-31`); `priceSpecification` **Array → einzelnes** `ListPrice REG`-Objekt.
2. `product:price:amount` = `REG.00`.
3. **Launch-Strip-Markup raus** (beide `<header class="bundle-hero-launch …">`). Den `<!-- Launch-Sale window -->`-Kommentar + die CSS-Regeln **stehen lassen** (dormant scaffolding fürs nächste Mal).
4. **Strike raus** (`bundle-hero-strike` / `offer-price-was`), Preis = `REG €`. Suffix `… netto …` bleibt.
5. **Voucher raus** aus beiden Checkout-Links — `?voucher=VOUCHER&ds24tr=vf_ab_X` → `?ds24tr=vf_ab_X` (ds24tr bleibt!).
6. **Launch-Labels** raus (Sticky `sticky-cta-label`, Hero-CTA „statt REG", B `offer-pricing-note` → `Netto · Ratenzahlung möglich über Digistore24.`, B `transform-to` → `Einmal REG € netto.`).
7. **Countdown-JS**: `LAUNCH_*`-IIFE darf als dead-no-op stehen bleiben (Selektoren finden nichts mehr) — oder sauber raus. CSS bleibt.
8. **Alle Preiszahlen** `SALE → REG` (Module, inline-cta-meta, Tracking `PLAN_VALUE`/Fallback/FB/gAds, danke).
9. **`vercel.json`**: die zwei Homepage-Redirects **wieder einfügen** (307, `permanent:false`!), damit `/` + `/index.html` zurück auf `/live-workshop` leiten.

### Schnellster Weg
Der letzte Revert lief per **`apply-price-regular.mjs`** (exaktes find/replace, mit
NOT-FOUND-Guards). Ein solches One-Shot-Skript ist pro Sale spezifisch (hardcodierte
`SALE`/`REG`/`VOUCHER`/`END`) → für den nächsten Sale eine neue Kopie mit den neuen Werten
bauen, `node apply-price-regular.mjs` laufen lassen, dann verifizieren.
(`apply-price-597.mjs` ist der **veraltete** Revert vom Mai-Sale 297→597 — nicht mehr benutzen.)

### Verifikation (immer nach Set/Revert)
```bash
grep -rnE "SALE|voucher|launchsale|statt REG|bundle-hero-strike\"|offer-price-was\"" \
  index.html index-b.html baseflow.html seoflow.html clarityflow.html danke.html   # leer = sauber
node -e 'const fs=require("fs");for(const f of["index.html","index-b.html","baseflow.html","seoflow.html","clarityflow.html"]){const c=fs.readFileSync(f,"utf8");const re=/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g;let m;while((m=re.exec(c))){JSON.parse(m[1]);}console.log("ok",f);}'  # JSON-LD parst
node serve.mjs &  # dann localhost:3001 (A) + /index-b.html (B) screenshoten, Preisblock prüfen
```

---

## Stolperfallen
- **Voucher auf A UND B** — sonst zahlt die Mobile-B-Hälfte voll.
- **`ds24tr=vf_ab_A|B` immer behalten** — Umsatz-Attribution pro Variante.
- **Netto durchziehen** (`… netto`, `valueAddedTaxIncluded:false`).
- **Redirect = 307 (`permanent:false`)** — niemals `permanent:true` für `/`, sonst cachen Browser/Google die Umleitung hart und der nächste Sale kommt nicht mehr durch.
- **Redirect liegt in `vercel.json`, nicht im Vercel-Dashboard.** Läuft vor `middleware.js` → Homepage-A/B (`vf_ab`) pausiert automatisch, LW-A/B (`vf_ab_lw`) greift am Ziel.
- **Gilt nur in Produktion**: `serve.mjs` (localhost) wendet `vercel.json`-Redirects nicht an → lokal zeigt `/` immer `index.html`.
- **Deploy nötig**: lokale Änderungen gehen erst nach `git push` (Vercel) live.
