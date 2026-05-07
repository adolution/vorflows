# Digistore24 Compliance — Änderungen an der Verkaufsseite

**Datum:** 2026-05-07
**Anlass:** Digistore24 hat das Produkt zunächst abgelehnt. Zwei Mängel wurden vom Payment-Processor genannt:

1. Inhalt + Lieferform müssen vor dem Kauf auf Verkaufsseite **und** Bestellformular sichtbar sein.
2. Rückgabemöglichkeit muss klar kommuniziert werden — **ohne** Bedingungen. Konditionierte Refund-Angebote werden von Digistore24 abgelehnt (Verwaltungsaufwand). Kommunizierte Rückgabedauer muss mit der Einstellung im Digistore24-Backend übereinstimmen.

Dieses Dokument hält fest, was wegen Digistore24 entfernt/abgeschwächt wurde, damit es bei einem späteren Wechsel des Payment-Processors **wieder eingebaut werden kann**.

---

## Was hinzugefügt wurde (sollte bleiben — gute UX)

### 1. „Inhalt + Lieferung" Karte im Pricing-Block
Neue zweispaltige Karte (`.delivery-card`) im Pricing-Section direkt über dem Trust-Strip.
- Linke Spalte `[ INHALT ]` Was du bekommst — Setup-Datei, Skill-Stack, Base/SEO/ClarityFlow, Videos, Updates
- Rechte Spalte `[ LIEFERUNG ]` Wie du es erhältst — digital, sofort per E-Mail von Digistore24, Download-Link, kein Versand, Voraussetzungen
- CSS: neue `.delivery-card` / `.delivery-col` / `.delivery-mark` / `.delivery-title` / `.delivery-list` Klassen

### 2. Product JSON-LD `description` erweitert
Vorher: `"BaseFlow + SEOFlow + ClarityFlow. Shopify-Optimierungssystem für Founder. Einmalkauf statt Subscription."`
Nachher: ergänzt um Inhalt, Lieferform „100 % digital", „kein Versand", „sofort per E-Mail über Digistore24".

### 3. Zwei neue FAQ-Einträge (HTML + FAQPage-Schema)
- „Wie wird das Produkt geliefert?"
- „Wie funktioniert die Rückgabe?"

---

## Was entfernt/umformuliert wurde (für späteren Re-Import nach Provider-Wechsel)

### A) Trust-Tile [ MONEY-BACK ]

**Original (entfernt):**
```html
<div class="trust-tile" data-reveal="up">
  <span class="trust-tile-mark" aria-hidden="true">[ MONEY-BACK ]</span>
  <h3 class="trust-tile-title">14 Tage Geld-zurück</h3>
  <p class="trust-tile-body">Funktioniert das System nicht für dich, schreibst du eine Mail. Refund kommt zurück.</p>
</div>
```

**Aktuell:** `[ RÜCKGABE ] · 14 Tage Rückgaberecht · ohne Angabe von Gründen` (regelkonform)

**Warum entfernt:** „Funktioniert das System nicht für dich" ist eine Bedingung. Digistore24 lehnt konditionierte Rückgabeangebote ab.

---

### B) Bundle-Hero CTA Garantie-Zeile

**Original (entfernt):**
```html
<p class="bundle-hero-guarantee">14 Tage Geld-zurück, wenn es für dich nicht funktioniert.</p>
```

**Aktuell:** `14 Tage Rückgaberecht — ohne Angabe von Gründen.`

**Warum entfernt:** „wenn es für dich nicht funktioniert" = Bedingung.

---

### C) Bundle-Features-Liste — „Setup-Garantie"-Zeile

**Original (entfernt):**
```html
<li><span class="check" aria-hidden="true">✓</span><div><strong>Setup-Garantie</strong><span>Funktioniert nicht am selben Tag? Refund.</span></div></li>
```

**Aktuell:** ersetzt durch
```html
<li><span class="check" aria-hidden="true">✓</span><div><strong>Sofortige digitale Lieferung</strong><span>E-Mail mit Download-Link direkt nach Zahlung über Digistore24</span></div></li>
```

**Warum entfernt:** Aggressive Setup-Garantie („selben Tag? Refund.") ist Verkaufs-Trumpf, aber bei Digistore24 nicht erlaubt. **Rückbau-Option:** beide Lis behalten — die Lieferungs-Zeile ist generell sinnvoll, die Setup-Garantie kann zusätzlich rein.

---

### D) Inline-CTA Meta

**Original (entfernt):**
```html
<span class="inline-cta-meta">297 € · 14 Tage Refund</span>
```

**Aktuell:** `297 € · 14 Tage Rückgabe`

**Warum:** rein semantischer Tausch — „Refund" klingt unbürokratischer, „Rückgabe" passt zur regelkonformen Sprache.

---

### E) FAQ-Eintrag „Geld-zurück-Garantie"

**Original (entfernt):**
```html
<details class="faq-item" data-animate data-reveal="up">
  <summary>Gibt es eine Geld-zurück-Garantie?</summary>
  <div class="faq-body">Das ist zwar bisher nie passiert, aber: Wenn du das Setup nach Anleitung durchführst und das System nicht für dich funktioniert, bekommst du dein Geld zurück.</div>
</details>
```

Entsprechender FAQPage-Schema-Eintrag:
```json
{ "@type": "Question", "name": "Gibt es eine Geld-zurück-Garantie?", "acceptedAnswer": { "@type": "Answer", "text": "Wenn du das Setup nach Anleitung durchführst und das System nicht für dich funktioniert, bekommst du dein Geld zurück." } }
```

**Aktuell:** umgeschrieben als „Wie funktioniert die Rückgabe?" mit unkonditionierten 14 Tagen.

**Warum entfernt:** Antwort enthielt zwei Bedingungen („Setup nach Anleitung", „nicht für dich funktioniert").

---

## Was sonst noch betroffen ist

### Bestellformulartext (Digistore24-Backend, nicht im Repo)
Auch dort wurden die konditionierten Refund-Sätze entfernt und durch unkonditionierte 14-Tage-Rückgabe ersetzt sowie ein Liefer-Absatz ergänzt. Beim Provider-Wechsel ggf. ebenfalls anpassen.

### Digistore24-Setting
Im Digistore24-Backend ist die Rückgabedauer auf **14 Tage** gesetzt. Das muss mit dem Text auf der Seite übereinstimmen, sonst Diskrepanz und erneute Ablehnung.

---

## Re-Import-Checkliste (nach Provider-Wechsel)

Wenn der neue Payment-Processor konditionierte Garantien zulässt, in folgender Reihenfolge wiederherstellen:

- [ ] Trust-Tile A: zurück auf `[ MONEY-BACK ]` + ursprünglicher Text — oder beide Varianten kombinieren („Funktioniert nicht für dich? Mail genügt — plus 14 Tage gesetzliches Rückgaberecht")
- [ ] Bundle-Hero-Guarantee B: stärkere Garantie-Sprache („Funktioniert nicht? Geld zurück.") wieder einbauen
- [ ] Bundle-Feature-Li C: „Setup-Garantie" + „Sofortige digitale Lieferung" beide drin lassen
- [ ] FAQ-Eintrag E: Original-Q&A wieder als zusätzliche FAQ ergänzen, neue „Wie funktioniert die Rückgabe?" beibehalten
- [ ] Digistore24-Bestellformulartext: aggressivere Refund-Sätze wieder rein (falls Provider erlaubt)

Die neuen Inhalt-/Lieferungs-Elemente (Karte, Schema, FAQ) bleiben unabhängig vom Provider — die sind generell konversionsfördernd.
