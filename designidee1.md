# forflow – Design Idee 1 (Hybrid)

> Visuelles Briefing für die Claude Code Instanz, die die Landing Page baut.
> Liest sich am besten zusammen mit der `product.md`.

---

## Design-Philosophie

Heller Editorial-Look als Basis, mit einem dunklen Terminal-Block in der "Wie funktioniert's"-Section. Die helle Basis signalisiert Premium-Seriosität, der dunkle Block zeigt technische Glaubwürdigkeit. Der visuelle Bruch hält die Page interessant und kommuniziert in einem Bild, *was* forflow eigentlich tut.

**Referenzen, die du dir vor dem Bauen anschauen solltest:** Linear (Editorial-Klarheit), Stripe Press (Premium-Typo), Vercel Dokumentation (Hell/Dunkel-Wechsel), Anthropic.com (Ruhe, Whitespace, Serif-Akzente).

**Vermeide jeden Anschein von:** Linear-Klon, "AI-Startup vom Stange", lila/blaue Gradients, Glow-Effekte, floating 3D-Cubes.

---

## Farbpalette

```
Background (Light):       #FAFAF7   (off-white, warmer Unterton)
Background (Dark Block):  #0F0F0F   (fast schwarz, nicht rein)
Text Primary:             #1A1A1A   (anthrazit auf hell)
Text Inverse:             #EAEAE5   (off-white auf dunkel)
Text Secondary:           #5C5C5C   (Sekundärtext, Captions)
Border / Divider:         #E5E3DD   (sehr dezent auf hell)
Border (Dark):            #2A2A2A   (auf dunkel)
Accent:                   #C8633E   (Terracotta – die einzige Farbe)
Accent Hover:             #B05530
```

**Regel:** Kein Gradient. Kein zweiter Akzent. Terracotta wird sparsam eingesetzt – CTAs, ein bewusster Hover, ein Underline. Nicht für Headlines, nicht für Backgrounds.

---

## Typografie

```
Display (H1, H2):    Fraunces        (Serif, Variable, weight 400–600)
UI / Body:           Inter           (Sans, weight 400, 500, 600)
Mono (Code, Files):  Geist Mono      (oder JetBrains Mono als Fallback)
```

**Hierarchie:**
- H1: Fraunces 600, ~64–72px desktop, ~40px mobile, line-height 1.05, letter-spacing -0.02em
- H2: Fraunces 500, ~40–48px, line-height 1.1
- H3: Inter 600, ~22–24px
- Body: Inter 400, 17–18px, line-height 1.6
- Caption / Meta: Inter 500, 13–14px, uppercase, letter-spacing 0.08em
- Mono: Geist Mono 400, 14–15px

**Wichtig:** Die Fraunces-Headlines sind der Premium-Hebel. Keine Gradient-Texte, kein Italic-Dauerfeuer – Italic nur für ein einzelnes Wort pro Headline, wenn überhaupt.

---

## Layout-Prinzipien

- **Single Column** für Text-Sections, max-width ~720px
- **Großzügige vertikale Sektion-Abstände:** ~160px desktop, ~96px mobile zwischen Hauptsections
- **Whitespace ist nicht leer, sondern Inhalt.** Lieber zu viel als zu wenig.
- **Container max-width:** 1200px für Pricing/Tabellen, 720px für Prosa
- **Grid:** 12-spaltig nur bei Pricing und Module-Übersicht, sonst Flow-Layout
- **Border-Radius:** 6px für Buttons, 12px für Cards (sparsam einsetzen), 0px für den Terminal-Block

---

## Section-by-Section Guidance

### Hero (Light)
- Off-white Background
- Eine Headline in Fraunces, max 8 Wörter, ein Wort kann italic sein
- Sub-Headline in Inter 400, 20–22px, max 2 Zeilen, in Text Secondary
- **Ein** Primary CTA (Terracotta-Background, Off-white Text), daneben ein Ghost-Link ("Wie es funktioniert →")
- Kein Hero-Bild, keine 3D-Renders. Stattdessen: ein dezenter File-Tree als visueller Anker, rechts der Headline oder darunter zentriert.
- Beispiel-Filetree-Inhalt:
  ```
  theme/
  ├── sections/
  │   ├── hero.liquid          (modified)
  │   └── product-card.liquid  (modified)
  ├── snippets/
  └── templates/
  ```

### Workflow-Section (Dark – das ist der Bruch)
- Vollbreiter dunkler Block (#0F0F0F), bricht das helle Layout
- Innen: Mono-Font dominiert
- Zeig den Workflow als sequentielle Steps, jeder Step mit:
  - Step-Nummer in Terracotta
  - Kurzer Titel in Inter 600 (Off-white)
  - Code/File-Beispiel in Geist Mono
- Drei Steps reichen: "Theme exportieren → Claude bearbeitet → Duplicate Theme published"
- Optional: ein Diff-View mit `+` / `-` Zeilen (rot/grün dezent, nicht knallig)

### Module-Übersicht (Light)
- Drei Module nebeneinander (desktop) bzw. gestapelt (mobile)
- Keine Cards mit Shadow. Stattdessen: nur eine 1px-Trennlinie zwischen den Modulen.
- Pro Modul: kleines Mono-Label oben ("BASE" / "SEO" / "CLARITYFLOW") in Terracotta, dann H3 in Inter 600, dann 3–4 Zeilen Body
- Kein Icon-Zoo. Wenn Icons, dann minimal-line, schwarz, 24px (Lucide oder Phosphor Light).

### Pricing (Light, ehrliche Tabelle)
- Vier Spalten als Tabelle, nicht als Card-Karussell
- Bundle-Spalte hat Terracotta-Border (1px), kein Background-Glow
- "Recommended"-Label oben rechts, klein, Mono, Terracotta
- Preis groß in Fraunces 500, Disclaimer in Inter 13px Text Secondary
- Feature-Liste mit einfachen Checks (–/✓), kein Icon-Karneval
- Unterhalb der Tabelle in einer Box mit dezentem Border: der "Erst Base, später nachkaufen ohne Rabatt"-Hinweis

### Footer
- Drei-spaltig auf Desktop, gestapelt mobile
- Hellgrauer Border-Top (1px)
- Mono-Font für alle Links, klein, Text Secondary
- Logo Wordmark links, kein Symbol nötig

---

## Motion

- **Sehr sparsam.** Kein parallax-everything.
- Erlaubt: dezente fade-in-on-scroll (opacity 0 → 1, max 200ms, ease-out)
- Erlaubt: Hover-States auf CTAs (background-color transition 150ms)
- Erlaubt: ein einziger Cursor-Blink im Terminal-Block
- Verboten: Floating elements, infinite loops, magnetic-Cursors, animated Gradients

---

## Bildsprache

- **Keine Stock-3D-Renders.** Niemals.
- **Keine generischen AI-Illustrationen** (Roboterhände, Gehirne, Sterne, Sparkles).
- Erlaubt sind: echte Screenshots vom Workflow (Claude Code, Shopify Theme Editor), File-Trees als ASCII-Art, Diff-Views, Terminal-Output.
- Wenn ein dekoratives Element nötig ist: eine sehr feine, monochrome Linien-Illustration, max 1px Strichstärke.

---

## Do & Don't – Schnell-Check

**Do:**
- Lange weiße Strecken, dann ein dunkler Block – das ist der Move.
- Serif-Headline, Sans-Body, Mono für alles Technische.
- Eine Akzentfarbe, sparsam.
- File-Trees und Diffs als visuelle Sprache.

**Don't:**
- Mehr als eine Akzentfarbe.
- Gradients (an keiner Stelle).
- Card-Layout für Pricing (das ist 2021-SaaS).
- Emojis im UI (Mono-Pfeile `→` ja, Emojis nein).
- "Built with AI"-Badges oder Sparkle-Icons.

---

## Page-Flow – Komplette Section-Reihenfolge

Reihenfolge folgt Conversion-Logik: Hook → Problem → Mechanik → Beweis → Module → Vergleich → Qualifier → Pricing → letzter Push.

```
01  Nav (sticky, minimal)
02  Hero (Light)
03  Subscription-Killer Hook (Light, Trust-Strip)        ← neu
04  Problem (Light, scharf)                              ← neu
05  Solution Reveal (Light, Mechanik in einem Satz)      ← neu
06  Workflow-Section (Dark, der Bruch)
07  Module-Übersicht (Light)
08  App-vs-Custom-Code Vergleichstabelle (Light)         ← neu
09  Outcome – "Tag 1 mit vorflows" (Light)               ← neu
10  Skill-Stack (Light, Mono-dominant)                   ← neu
11  Qualifier – Für wen / nicht für wen (Light)          ← neu
12  Pricing (Light, ehrliche Tabelle)
13  FAQ (Light, Accordion)                               ← neu
14  Final CTA (Dark, kurz, ein Button)                   ← neu
15  Footer
```

Sections mit `← neu` sind Ergänzungen über die `product.md` hinaus, die für Conversion und Glaubwürdigkeit der Zielgruppe gebraucht werden.

---

## Section-Inhalte – Copy-Richtung

> Alle Headline-Vorschläge sind **Richtung**, nicht final. Final-Copy in einem zweiten Pass kalibrieren.

### 02 — Hero

**Job:** In 3 Sekunden klar machen, was vorflows ist und für wen.

**Headline (Vorschläge zur Auswahl):**
- *Bau deinen Shopify-Store wie ein Senior Dev. Ohne Senior-Dev-Salär.*
- *Schluss mit 47 Apps, drei Agenturen und einem Theme, das nichts kann.*
- *Dein Shop, mit Claude Code als technischem Co-Founder.*

**Sub-Headline:**
> vorflows ist das System, mit dem Shopify-Founder ihren Store über Claude Code umbauen, ranken und optimieren — ohne Agentur, ohne App-Stack, ohne Dev-Team.

**CTA-Pair:**
- Primary: `Start mit Base →` (Terracotta-Fill)
- Ghost: `Wie es funktioniert ↓`

**File-Tree-Anker (rechts der Headline, dezent):**
```
theme/
├── sections/
│   ├── hero.liquid          (modified)
│   └── product-card.liquid  (modified)
├── snippets/
│   └── bundle-builder.liquid (new)
└── templates/
```

### 03 — Subscription-Killer Hook (Trust-Strip)

**Job:** Sofort den Cashflow-Hebel zeigen. Bevor der Leser scrollt, sitzt das Kernargument.

**Layout:** Drei-Spalten-Strip, schmal, nur Zahlen + ein Mono-Label.

**Inhalt:**
- `47 € / Monat` — *Klaviyo-Add-On, das du selbst bauen kannst*
- `129 € / Monat` — *Wishlist-App, ersetzbar mit drei Snippets*
- `89 € / Monat` — *Bundle-Builder, der in einer Section lebt*

**Schluss-Zeile, kleiner, zentriert:**
> Apps zahlst du jeden Monat. Custom Code besitzt du.

### 04 — Problem

**Job:** Den Schmerz benennen ohne zu jammern. Self-aware, nicht weinerlich.

**Headline:**
> *Du sitzt in einem Shop, der dir nicht gehört.*

**Drei Pain-Blöcke (Single Column, untereinander, je 2–3 Zeilen):**

1. **Theme-Limits.** Du willst eine Section, die dein Theme nicht hat. Also lebst du mit Workarounds, die du eigentlich nie wolltest.
2. **App-Stack.** Jede Funktion ist ein Abo. Jeden Monat zieht jemand Geld von deinem Konto, das du längst selbst hosten könntest.
3. **Agentur-Loop.** Du beschreibst, was du willst. Sie bauen, was sie verstanden haben. Drei Loops später bist du genervt — und ärmer.

### 05 — Solution Reveal

**Job:** Mechanik in einem Satz. Nicht Versprechen, sondern Prozess.

**Headline:**
> *Claude Code wird der technische Co-Founder, den dein Shop nie hatte.*

**Sub-Line (Mono, kleiner):**
```
theme.zip → claude project → file edits → duplicate theme → review → publish
```

**Body (max 2 Zeilen):**
> Reproduzierbar. Nichts in der CLI. Kein Magic. Du bleibst in Kontrolle, Claude liefert die Datei-Änderungen.

### 06 — Workflow-Section (Dark)

**Job:** Den Mechanismus zeigen, nicht behaupten. Glaubwürdigkeit bei technischer Zielgruppe aufbauen.

**Drei Steps (visuelle Anker im Terminal-Block):**

**Step 01 — Theme exportieren**
```
$ Shopify Admin → Themes → Actions → Download theme file
  theme.zip ✓
```

**Step 02 — Claude bearbeitet**
```diff
  sections/hero.liquid
- {% if section.settings.show_button %}
+ {% if section.settings.show_button and product.available %}
+   <button class="cta cta--primary">
+     {{ section.settings.button_text }}
+   </button>
- {% endif %}
+ {% endif %}
```

**Step 03 — Duplicate Theme published**
```
$ Theme: vorflows-edit-2026-04-27
  → Preview ✓
  → Review ✓
  → Publish ✓ (live theme unangetastet bis hier)
```

**Schluss-Zeile (klein, Mono, unter dem Block):**
> Live-Theme bleibt unberührt. Du publishst, wenn du soweit bist. Niemals automatisch.

### 07 — Module-Übersicht

**Job:** Base, SEO, ClarityFlow je in 3–4 Zeilen erklären. Tonalität: Berater, nicht Verkäufer.

**Inhalt pro Modul:**

**01 / BASE** *(Pflicht-Modul)*
> *Theme umbauen, ohne dass dein Live-Shop wackelt.*
>
> File-Export aus Shopify, Claude Project laden, Sections und Snippets bearbeiten. Änderungen landen in einem Duplicate Theme — erst nach Review wird published. Skill-Stack inklusive.

**02 / SEO** *(Add-On)*
> *SEO-Maschine, die in 10 Minuten steht und ohne dich läuft.*
>
> Geführter Setup-Flow, kein Doku-Marathon. Search Console mit Claude Code verknüpft. Echte Suchdaten, Rankings, CTRs als Input. Output: Handlungsempfehlungen oder direkte Code-Änderungen am Theme.

**03 / CLARITYFLOW** *(Add-On)*
> *Dein Shop verrät, was nicht funktioniert. Claude hört zu — und handelt.*
>
> Verbindet Claude Code mit Verhaltensdaten — Klicks, Scroll, Heatmaps. Erkennt Drop-offs, ignorierte CTAs, tote Sections. Schließt den Loop: Daten → Hypothese → Code → neue Daten.

### 08 — App-vs-Custom-Code Vergleich

**Job:** Den Cashflow-Hebel quantifizieren. Härtester Conversion-Punkt für die Zielgruppe.

**Layout:** Zwei-Spalten-Tabelle, schmal, max-width 720px. Mono für Zahlen, Inter für Beschreibung.

| App-Stack (typisch) | Monatlich | vorflows-Lösung |
|---|---|---|
| Klaviyo Pro | 150 € | E-Mail-Capture als Custom Section |
| Bundle Builder | 89 € | Liquid-Section mit Variant-Logic |
| Wishlist | 49 € | LocalStorage + drei Snippets |
| Reviews-App | 79 € | Theme-native Review-Section |
| Upsell-App | 99 € | Cart-Drawer-Section |
| **Summe** | **466 € / Monat** | **Einmalig gebaut. Du besitzt es.** |

**Schluss-Zeile (groß, Fraunces, zentriert):**
> *5.592 € pro Jahr in Apps. Oder einmal vorflows.*

> Hinweis: Zahlen illustrativ. Vor Launch mit echten App-Preisen kalibrieren.

### 09 — Outcome – "Tag 1 mit vorflows"

**Job:** Konkretes Bild vom Ergebnis. Kein abstraktes Versprechen, sondern Zeitlinie.

**Headline:**
> *Tag 1 mit vorflows.*

**Drei Zeilen (vertikal, Mono-Datums-Badge links, Body rechts):**

- `TAG 1` — Du hast eine Section gebaut, die vorher nur als App existierte.
- `TAG 7` — Du hast einen App-Vertrag gekündigt und den Custom-Code im Live-Theme.
- `TAG 30` — Du hast einen Workflow, den du jeden Monat wieder anwenden kannst.

### 10 — Skill-Stack

**Job:** Zeigen, dass Base nicht nur „Workflow" ist, sondern strukturiertes Skill-Pack. Glaubwürdigkeit für Käufer, die wissen wollen, *was* sie bekommen.

**Layout:** Mono-Liste, ein-spaltig, max-width 720px. Skill-Name in Mono links, Ein-Satz-Beschreibung rechts.

```
theme-architecture        Wie Shopify-Themes intern aufgebaut sind, was wo lebt.
liquid-fundamentals       Was du wissen musst, um Sections selbst zu lesen.
claude-project-setup      Wie du dein Theme so lädst, dass Claude konsistent arbeitet.
duplicate-publish-flow    Der sichere Weg vom Edit zum Live-Theme.
app-replacement-patterns  Welche App-Typen sich gut, welche schlecht ersetzen lassen.
seo-data-loop             Wie Search-Console-Daten zu Code-Änderungen werden.
behavioral-data-reading   Heatmap-Patterns lesen, ohne sich was einzubilden.
prompt-discipline         Wie du Claude Aufgaben gibst, die er zuverlässig löst.
```

**Sub-Line darunter:**
> Inkludiert in jedem Paket. Keine Upsell-Stufen.

### 11 — Qualifier – Für wen / nicht für wen

**Job:** Self-aware Selektion. Wer richtig ist, fühlt sich gesehen. Wer falsch ist, geht freiwillig.

**Layout:** Zwei-Spalten, gleiche Höhe, mit 1px-Trennlinie zentral.

**Linke Spalte — *vorflows ist für dich, wenn —***
- Dein Shop läuft, aber du gegen Theme- und App-Limits stößt.
- Du selbst Hand anlegst, statt zu delegieren.
- KI für dich Werkzeug ist, nicht Spielzeug.
- Du verstehst, was ein Liquid-File ist (oder bereit bist, es in 20 Minuten zu lernen).

**Rechte Spalte — *vorflows ist nicht für dich, wenn —***
- Du noch nie ein Shopify-Backend von innen gesehen hast.
- Du eine fertige Lösung suchst, die du nur installierst.
- Du jemanden willst, dem du das Problem delegieren kannst.
- Du nach „Ein-Klick-AI-Magic" suchst.

**Tonalität:** Sachlich, kein Bashing der Anfänger. Berater, nicht Bouncer.

### 12 — Pricing

**Job:** Vier Pakete klar zeigen, Bundle als Hauptempfehlung. Keine Pricing-Toggles, keine Decoy-Effekte über Marketing-Sprache.

**Tabelle (vier Spalten, Bundle mit Terracotta-Border):**

| | Base only | Base + SEO | Base + ClarityFlow | **Bundle** *(Recommended)* |
|---|---|---|---|---|
| Base System | ✓ | ✓ | ✓ | ✓ |
| SEO Module | – | ✓ | – | ✓ |
| ClarityFlow | – | – | ✓ | ✓ |
| Skill-Stack | ✓ | ✓ | ✓ | ✓ |
| Positionierung | *Einstieg* | *Traffic-Fokus* | *Conversion-Fokus* | *Beste Preis-Leistung* |
| | `Start mit Base` | `Base + SEO` | `Base + ClarityFlow` | **`Bundle holen`** |

**Hinweis-Box unter der Tabelle (dezent, 1px-Border, kein Lime-Hintergrund):**
> Du kannst mit Base einsteigen, das System testen und Module später nachkaufen.
> Add-Ons nach Erstkauf sind ohne Bundle-Rabatt — wer das Bundle gleich nimmt, spart.

### 13 — FAQ

**Job:** Die offenen Fragen vor dem Klick auf „Buy" abräumen. Nur die echten Einwände, keine Filler-Fragen.

**Layout:** Accordion, max-width 720px, single column. Jede Frage öffnet auf Klick, eine offen bei Page-Load (die wichtigste).

**Fragen-Set (Vorschlag, 8 Fragen — wenn zu viel, auf 6 reduzieren):**

1. **Brauche ich Programmier-Erfahrung?**
   Nein, aber Lese-Verständnis für Liquid hilft. Der Skill-Stack zieht dich da in 30–60 Minuten durch.

2. **Was, wenn ich mein Theme zerschieße?**
   Du arbeitest immer auf einem Duplicate. Live-Theme bleibt unangetastet, bis *du* publishst. Kein Auto-Deploy.

3. **Funktioniert das mit jedem Theme — Dawn, Custom, Premium?**
   Ja. Solange es ein Shopify-Theme mit Liquid ist, funktioniert der Workflow. Bei stark custom-gebauten Themes wirst du tiefer einsteigen, aber die Mechanik bleibt.

4. **Brauche ich Claude Pro / Claude Code?**
   Ja, einen Claude-Account mit Code-Zugang. Setup zeigt dir der Workflow.

5. **Kann ich später Add-Ons dazukaufen?**
   Ja. Aber: Add-Ons nach Erstkauf gibt's ohne Bundle-Rabatt. Wer alles will, fährt mit dem Bundle besser.

6. **Wie lange dauert das Onboarding?**
   Base: 30 Minuten Setup, erste Section am selben Tag. SEO: 10 Minuten Setup. ClarityFlow: 15 Minuten Setup.

7. **Was passiert mit meinen Daten?**
   Search Console und Verhaltensdaten bleiben in deinen Accounts. vorflows hostet keine Shop-Daten, alles läuft über deine eigenen Verbindungen zu Shopify, Search Console, etc.

8. **Gibt es eine Geld-zurück-Garantie?**
   *(noch zu entscheiden — Vorschlag: 14 Tage, ohne Wenn und Aber.)*

### 14 — Final CTA (Dark)

**Job:** Wer bis hier gelesen hat und nicht geklickt hat, braucht einen letzten Push. Kurz, ein Argument, ein Button.

**Layout:** Vollbreiter dunkler Block (#0F0F0F), wie der Workflow-Block. Schließt die Page visuell ab.

**Headline (Fraunces, Off-white):**
> *Du hast schon einen Shop. Mach ihn dir zurück.*

**Sub-Line (Inter, Text Inverse Secondary):**
> Start mit Base. 30 Minuten Setup. Erste Section noch heute.

**CTA:**
`Start mit Base →` (Terracotta-Fill, einziger Button auf der Section)

### 15 — Footer

- Drei Spalten (Desktop), gestapelt (Mobile)
- **Produkt:** Module · Workflow · Pricing
- **Resources:** FAQ · Changelog · Status
- **Legal:** Impressum · Datenschutz · AGB
- Mono-Schrift, 13px, Text Secondary
- Wordmark `vorflows` in Fraunces oben links
- Copyright-Zeile unten, klein, Mono
- **Kein Newsletter-Hijack.** Kein Social-Icon-Karneval.

---

## Sections, die explizit NICHT auf der Page sind

- **Testimonials.** Erst, wenn echte da sind. Bis dahin: leer.
- **Logo-Strip „as featured in".** Nicht für Pre-Launch.
- **Bildpipeline / Future-Module.** Scope = Base + SEO + ClarityFlow.
- **Endless-Feature-Liste.** Mechanik schlägt Features.
- **Stockfoto-Hero-Person mit Laptop.**
- **AI-Magic-Glitter, Sparkle-Icons, animierte Sterne.**
- **Newsletter-Popup oder Exit-Intent-Modal.**

---

## Offene Entscheidungen (vor Build klären)

1. **Hero-Headline:** *„Bau wie ein Senior Dev"* (positiv, Outcome-fokussiert) oder *„Schluss mit 47 Apps"* (negativ, Schmerz-fokussiert)?
2. **Subscription-Killer-Zahlen:** Mit echten App-Preisen kalibrieren oder bewusst illustrativ („typische Shop-Stack-Kosten") lassen?
3. **Skill-Stack:** Voll auf der Landing Page (wie oben), oder als Teaser mit Link zu separater `/skills`-Seite?
4. **FAQ-Tiefe:** 6 Fragen (Conversion-fokussiert) oder 8 (Trust-fokussiert)?
5. **Geld-zurück-Garantie:** 14 Tage anbieten oder weglassen?
6. **Pricing-Zahlen:** Konkrete Beträge auf der Page oder „from X €" mit Reveal beim CTA?
7. **Final-CTA-Section:** Dark-Block (zweiter Bruch nach Workflow) oder hell-konsistent?

---

## Build-Reihenfolge (für Implementation)

1. **Hero + Nav** — gibt Tonalität vor, erste Validierung mit User
2. **Workflow-Section (Dark)** — der visuelle Bruch, definiert Look-and-Feel
3. **Module + Pricing** — Kern-Wert + Conversion-Punkt
4. **Subscription-Killer Hook + Vergleichstabelle** — Argumentations-Schicht
5. **Problem + Solution Reveal + Qualifier** — Conversion-Story
6. **Outcome + Skill-Stack + FAQ** — Vertrauens-Schicht
7. **Final CTA + Footer** — Schließen

Nach Schritt 3 (Hero, Workflow, Module, Pricing) kann schon getestet werden, ob die Tonalität sitzt — bevor die ganze Page steht.
