# forflow – Design Idee 2 (Editorial / Operator)

> Visuelles Briefing für die Claude Code Instanz, die die Landing Page baut.
> Liest sich am besten zusammen mit der `product.md`.

---

## Design-Philosophie

Komplett heller Editorial-Look. Die Page sieht aus wie ein durchdachtes Software-Magazin oder die Doku eines seriösen Dev-Tools – nicht wie eine Marketing-Page. Whitespace, Serif-Akzente und eine ruhige Farbpalette signalisieren: *Hier arbeitet jemand, der Software ernst nimmt.* Maximale Differenzierung von der typischen AI-Landing-Page durch Reduktion.

**Referenzen, die du dir vor dem Bauen anschauen solltest:** Stripe Press, Linear Marketing-Pages, Pirsch Analytics, Anthropic.com, Posthog Handbook, Basecamp's "Shape Up"-Buchwebsite.

**Vermeide jeden Anschein von:** AI-Hype, dunkle Gradients, neon-glowing UI, generische SaaS-Templates. Diese Page sollte sich anfühlen wie etwas, das jemand mit Geschmack gebaut hat – nicht wie ein Framer-Template.

---

## Farbpalette

```
Background Primary:    #FAFAF7   (off-white, warmer Unterton)
Background Secondary:  #F2F0EA   (für leichte Section-Trennung)
Text Primary:          #1A1A1A   (anthrazit)
Text Secondary:        #5C5C5C   (Sekundärtext, Captions)
Text Tertiary:         #8A8A85   (sehr dezente Meta-Infos)
Border / Divider:      #E5E3DD   (1px Hairlines)
Accent:                #2C5F4F   (Forest Green – die einzige Farbe)
Accent Hover:          #234C3F
```

**Regel:** Ein Akzent. Forest Green ist bewusst gewählt – kein Tech-Blau, kein AI-Lila, keine Terracotta-Wärme. Es signalisiert Reife, Substanz, langfristig. Wird *nur* eingesetzt für: primärer CTA, ein Underline auf Hover, das "Recommended"-Label im Pricing.

---

## Typografie

```
Display (H1, H2):    Tiempos Headline / GT Sectra / Fraunces  (Serif)
UI / Body:           Geist  (oder Inter als Fallback)
Mono (selten):       Geist Mono
```

**Hierarchie:**
- H1: Serif 500, ~72–84px desktop, ~44px mobile, line-height 1.02, letter-spacing -0.025em
- H2: Serif 500, ~44–52px, line-height 1.1
- H3: Geist 600, ~24px
- Body: Geist 400, 18–19px, line-height 1.65 (großzügig)
- Lead-Paragraph (direkt nach H1): Geist 400, 22px, Text Secondary
- Caption: Geist 500, 13px, uppercase, letter-spacing 0.1em
- Mono: nur für File-Pfade, Code, technische Terms

**Wichtig:** Die Serif macht die Page. Sie muss gut gewählt sein – ein billiges Google-Serif (Playfair, Lora) zerstört die Wirkung. Wenn nur Open Source: Fraunces. Wenn Lizenz möglich: Tiempos Headline.

---

## Layout-Prinzipien

- **Single Column** für fast alles, max-width 680px für Prosa, 1100px für Tabellen
- **Sektion-Abstände:** ~180px desktop, ~112px mobile (mehr als bei Idee 1 – die Ruhe ist der Punkt)
- **Asymmetrie erlaubt:** Headlines können links-bündig sein, Body kann eingerückt sein – wie in einem Editorial-Layout
- **Border-Radius:** 4px für Buttons, sonst 0px. Hairlines (1px) statt Cards.
- **Grid:** 12-spaltig, aber meist werden nur 8 davon genutzt
- **Optional:** dezente Marginalien-Notizen in Mono am rechten Rand (wie in Stripe Press) – zeigt Tiefe ohne Lärm

---

## Section-by-Section Guidance

### Hero
- Sehr viel Luft oben (~25vh Padding-Top auf desktop)
- Eine Serif-Headline, links-bündig, kann über 2–3 Zeilen brechen, max 9 Wörter
- Lead-Paragraph in 22px Text Secondary, max 2 Zeilen
- **Ein** Primary CTA (Forest Green Background), daneben ein Text-Link mit Pfeil "Read the workflow →"
- **Kein** Hero-Bild. Stattdessen: dezente Caption oben in Mono uppercase ("FOR SHOPIFY FOUNDERS"), Headline darunter
- Fließender Übergang zur nächsten Section ohne harte Trennung

### Manifest / Intro-Section (optional, sehr empfohlen)
- Ein 3-Absatz-Manifest, warum forflow existiert
- Liest sich wie eine Editorial-Eröffnung, nicht wie Marketing-Copy
- Zwischen den Absätzen: eine handgesetzte Einrückung oder ein kleiner Drop-Cap am Anfang (Serif, Forest Green)
- Das ist der Moment, in dem du dich vom AI-Tool-Pulk absetzt

### Workflow-Section
- Drei Schritte als horizontaler Flow auf desktop, vertikal mobile
- Jeder Schritt: Mono-Nummer (01, 02, 03) in Forest Green, Serif-Headline klein, Body in Geist
- Zwischen den Schritten: ein dünner Pfeil (1px Linie + Spitze), kein 3D, kein Glow
- Dezente Hairline darunter, dann die nächste Section

### Module-Übersicht
- Drei Module untereinander, jedes als eigene Mini-Section mit ~120px Abstand
- Pro Modul: links die Mono-Caption ("MODULE 01 — BASE"), rechts (oder darunter) Serif-H3 und Body
- Asymmetrisches Layout: Caption nimmt 3 Spalten, Content nimmt 7 – fühlt sich wie ein gesetzter Artikel an
- Keine Cards. Keine Icons. Nur Text und Hairlines.

### Pricing
- Vier-spaltige Tabelle, ehrlich und nüchtern
- Spalten getrennt durch 1px Hairlines, keine Backgrounds
- Bundle-Spalte: einziger visueller Unterschied ist eine Forest-Green Caption oben ("RECOMMENDED") und der Forest-Green CTA-Button
- Preise in Serif 500, ~36px – nicht riesig, nicht klein, gesetzt
- Feature-Liste mit `—` für nicht enthalten und `✓` für enthalten (kein farbiger Check-Zoo)
- Hinweis-Text ("Erst Base, später nachkaufen ohne Rabatt") darunter, klein, Text Secondary, kursiv

### FAQ (falls vorhanden)
- Akkordion-Style, aber sehr reduziert: nur eine 1px Hairline, ein dünner Pfeil rechts, Body fließt darunter aus
- Keine Background-Color, keine Shadow, kein Hover-Highlight (nur Text-Color-Change)

### Footer
- Sehr dezent. Drei Spalten, klein, Text Tertiary
- Wordmark links in Serif. Keine Social-Icons-Wand – maximal 2 Links (z.B. Twitter, Email)
- Border-Top: 1px Hairline

---

## Motion

- **Praktisch keine.** Statisches Editorial-Feeling.
- Erlaubt: subtle fade-in der Hero-Headline beim Page-Load (200ms)
- Erlaubt: Hover-Underline auf Links (animiert von 0→100% Width)
- Erlaubt: leichter Color-Shift auf Buttons (150ms)
- Verboten: scroll-triggered Animationen, parallax, magnetic Cursors, animated SVG, alles was sich bewegt ohne Grund

---

## Bildsprache

- **Keine Bilder im klassischen Sinn.** Keine Hero-Visuals, keine Module-Illustrationen.
- Wenn etwas Visuelles gezeigt werden muss: ein File-Tree als gesetzter Mono-Text, eingerückt wie ein Code-Sample in einem Buch
- Optional: ein einziges, sehr dezentes Linien-Diagramm pro Page (z.B. der Workflow als Strichgrafik, schwarz auf weiß, 1px Strichstärke)
- Kein Foto. Kein 3D. Keine Illustration im Cartoon- oder Memphis-Stil.

---

## Do & Don't – Schnell-Check

**Do:**
- Whitespace, Whitespace, Whitespace. Wenn es zu leer aussieht, ist es vermutlich richtig.
- Serif-Headlines, sparsam und gut gesetzt.
- Eine Farbe (Forest Green), sehr sparsam.
- Hairlines statt Cards, Boxes oder Shadows.
- Mono nur dort, wo es technisch korrekt ist (File-Pfade, Code, Captions).

**Don't:**
- Cards mit Shadow. Niemals.
- Mehr als eine Akzentfarbe.
- Hero-Bilder, Stock-Visuals, AI-Illustrationen.
- Animation, die nicht funktional ist.
- Pricing als Karussell oder mit "Save XX%"-Stickern.
- Emojis. Sparkle-Icons. "Built with AI"-Badges.
- Italic für ganze Sätze. Kursiv ist eine Würze, kein Saft.
