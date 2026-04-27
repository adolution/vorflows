# forflow – Design Idee 3 (Terminal / Workflow)

> Visuelles Briefing für die Claude Code Instanz, die die Landing Page baut.
> Liest sich am besten zusammen mit der `product.md`.

---

## Design-Philosophie

Die Page sieht aus wie das Tool, das sie verkauft. Dunkler Hintergrund, Mono-Font, File-Trees, Diff-Views, Terminal-Output. Jede Section ist visuell ein Beweis, dass forflow ein technisches Produkt für technische Founder ist – kein abstraktes "AI-Versprechen", sondern *sichtbare Mechanik*.

Das ist die mutigste der drei Optionen. Sie schließt eine Zielgruppe ein (technische Founder, die Claude Code bereits respektieren) und schließt eine andere aus (Marketing-getriebene Founder, die hübsche Pages erwarten). Wenn deine Zielgruppe Hand am Code anlegt, ist das ein Feature.

**Referenzen:** Claude Code's eigene CLI-Optik, Warp Terminal Marketing, Raycast, Resend Docs, Linear Changelog, Geist-UI. Schau dir auch an, wie Vercel oder Anthropic ihre Developer-Tool-Pages bauen.

**Vermeide jeden Anschein von:** Cyberpunk-Hacker-Ästhetik (grünes Matrix-Schrift), Gaming-RGB-Looks, "Hacker News in dunkel". Das hier ist nicht aggressiv-tech, sondern *kompetent-tech*.

---

## Farbpalette

```
Background Primary:    #0A0A0A   (fast schwarz, warm-getönt – nicht reines #000)
Background Elevated:   #141414   (für Code-Blöcke, leicht abgehoben)
Background Section:    #0F0F0F   (für Section-Wechsel, sehr dezent)
Text Primary:          #EAEAE5   (off-white, warmer Unterton)
Text Secondary:        #8A8A85   (Caption, Meta)
Text Tertiary:         #5A5A55   (sehr dezente Inline-Hints)
Border / Divider:      #2A2A2A   (1px, dezent)
Accent:                #E8B85C   (warmes Amber – Terminal-klassisch ohne Klischee)
Accent Hover:          #D4A348
Diff Added:            #4A6B4A   (gedämpftes Grün, nicht knallig)
Diff Removed:          #6B4A4A   (gedämpftes Rot)
```

**Regel:** Ein Akzent (Amber). Wird eingesetzt für: primärer CTA, Cursor-Blink, Step-Nummern, der eine wichtige Highlight in Code-Blöcken. Niemals als Background, niemals großflächig. Das Diff-Grün/Rot wird *ausschließlich* in tatsächlichen Diff-Views verwendet, nirgendwo sonst.

---

## Typografie

```
Display (H1, H2):     Geist Mono           (Mono-Display, weight 500–600)
Body / Long-form:     Geist                (Sans, für Lesbarkeit längerer Texte)
Mono (UI/Code):       Geist Mono / JetBrains Mono
```

**Hierarchie:**
- H1: Geist Mono 500, ~48–56px desktop, ~32px mobile, line-height 1.1, letter-spacing -0.02em
- H2: Geist Mono 500, ~32–36px, line-height 1.15
- H3: Geist Mono 600, ~18px (oft uppercase mit Letter-Spacing)
- Body: Geist 400, 16–17px, line-height 1.6
- Caption: Geist Mono 500, 12px, uppercase, letter-spacing 0.1em
- Code: Geist Mono 400, 14px

**Wichtig:** Mono-Headlines sind ungewöhnlich – das ist beabsichtigt. Sie kommunizieren sofort "Software, nicht Marketing". Long-form Body-Text bleibt aber Sans, damit die Page lesbar ist. Reine Mono-Pages werden ab 2 Absätzen anstrengend.

---

## Layout-Prinzipien

- **Single Column** für Text, max-width ~700px
- **Sektion-Abstände:** ~140px desktop, ~88px mobile
- **Borders:** 1px Hairlines (#2A2A2A) statt Card-Shadows
- **Border-Radius:** 4px für Buttons, 6px für Code-Blöcke, 0px für Section-Container
- **Container max-width:** 1100px für Pricing/Workflow, 700px für Prosa
- **Grid-Linien sichtbar erlaubt:** Eine sehr dezente vertikale Linie auf großen Screens (links und rechts vom Container) – wie ein File-Editor-Lineal. Aber wirklich nur dezent, #1A1A1A.

---

## Section-by-Section Guidance

### Hero
- Schwarzer Background
- Oben links: kleine Mono-Caption mit `~/forflow` oder ähnlichem File-Pfad-Hint, Text Tertiary
- H1 in Geist Mono 500, links-bündig, kann einen Zeilenumbruch enthalten
- Direkt darunter: ein blinkender Cursor (Amber, 800ms blink) – signalisiert "Terminal-Welt"
- Sub-Headline in Geist Sans, Text Secondary, max 2 Zeilen
- **Ein** Primary CTA: Amber-Background, schwarzer Text, scharfe Ecken (4px)
- Daneben ein Ghost-Button: Border 1px #2A2A2A, Text in Off-white, Mono-Pfeil `→`
- **Optional, sehr empfohlen:** rechts vom Hero-Text ein kleiner File-Tree, der bei Hover/Scroll dezent expandiert:
  ```
  ~/your-shop
  ├── theme/
  │   ├── sections/
  │   ├── snippets/
  │   └── templates/
  └── .claude/
      └── workflows/
  ```

### Workflow-Section
- Drei Steps, vertikal gestapelt, jeder Step ist eine Code-Block-artige Sequenz
- Pro Step:
  - Mono-Nummer in Amber (`01`, `02`, `03`)
  - Step-Titel in Geist Mono 600, uppercase
  - Code-/File-Beispiel in einem #141414-Block mit 1px Border
  - Optional: ein realistischer Diff-View für Step 2 (Claude bearbeitet) – mit `+` und `-` Zeilen in gedämpftem Rot/Grün
- Zwischen den Steps: ein vertikaler Mono-Pfeil oder gestrichelte Linie

### Module-Übersicht
- Drei Module, jedes als eigener "File" dargestellt
- Header pro Modul wie eine File-Tab: `base.module` / `seo.module` / `clarityflow.module` in Mono
- Body in Sans (Geist) für Lesbarkeit
- Kein Card-Shadow. Stattdessen 1px Border (#2A2A2A) und 6px Radius.
- Hover: Border wechselt zu Amber (sehr dezent), keine Skalierung, keine Bewegung

### Pricing
- Vier-spaltige Tabelle
- Sieht aus wie eine Config-Tabelle, nicht wie SaaS-Pricing-Cards
- Jede Spalte: Header in Mono uppercase, Preis groß in Mono 500 (~32px)
- Bundle-Spalte: 1px Amber Border (statt #2A2A2A), eine Mono-Caption oben rechts: `// recommended`
- Feature-Liste:
  - `[x]` für enthalten (in Off-white)
  - `[ ]` für nicht enthalten (in Text Tertiary)
  - Das ist der Move, der Pricing zur Konfig-Datei macht
- Pro Spalte ein CTA-Button am unteren Ende
- Hinweis-Block darunter, in einem #141414-Container mit Mono-Comment-Syntax:
  ```
  // Du kannst mit Base starten und Module später nachkaufen.
  // Add-Ons nach Erstkauf: ohne Bundle-Rabatt.
  ```

### FAQ / Footer-Übergang
- FAQ als ausklappbare Mono-Liste (`+` / `-` zum öffnen)
- Footer sehr reduziert: Mono-Wordmark links, 2–3 Mono-Links rechts, kleiner Build-Stamp unten (`v1.0.0` oder ähnlich – das ist der Tool-Vibe)

---

## Motion

- **Sehr selektiv. Jede Animation muss einen Tool-Charakter unterstreichen.**
- Erlaubt: Cursor-Blink im Hero (800ms, Amber)
- Erlaubt: typing-Animation in einem File-Tree-Demo (einmalig, on view, dann statisch)
- Erlaubt: Hover-Color auf Buttons (150ms)
- Erlaubt: Akkordion-Open im FAQ (200ms ease-out)
- Verboten: Parallax. Floating Elements. Mouse-Trails. Animierte Gradients. Glow-Pulses. "AI-thinking"-Spinner als Deko.

---

## Bildsprache

- **Keine Stock-Visuals. Keine Illustrationen. Keine 3D-Renders.**
- Erlaubt und erwünscht:
  - File-Trees als ASCII-Mono-Text
  - Diff-Views (echt aussehend, mit + / - Zeilen)
  - Terminal-Output-Mockups in Mono-Container
  - Echte Screenshots vom Claude Code Workflow oder Shopify Theme Editor (in dezenter Border, leicht entsättigt um sich einzufügen)
- Wenn ein Diagramm nötig ist: ASCII-Art (`├── ──→`) statt SVG-Zoo

---

## Do & Don't – Schnell-Check

**Do:**
- Mono-Headlines, Sans-Body. Das ist die Mischung.
- Echte Mechanik zeigen: File-Trees, Diffs, Terminal-Output.
- Eine Akzentfarbe (Amber), sehr sparsam.
- Hairlines (#2A2A2A) statt Shadows.
- Pricing als Config-Tabelle mit `[x]` / `[ ]`.

**Don't:**
- Matrix-Grün, Cyberpunk-Pink, RGB-Gaming-Vibes.
- Mono überall – Long-form Text in Mono ist anstrengend.
- Card-Shadow, Glow, Gradient.
- Stock-Visuals jeder Art.
- Animation, die nicht aus dem Tool-Charakter heraus motiviert ist.
- Emojis. Niemals.

---

## Risiko-Hinweis

Diese Idee ist die polarisierendste der drei. Sie wirkt auf technische Founder *sehr* überzeugend und auf Marketing-Founder eher abweisend. Das ist gewollt – aber wenn die Zielgruppe breiter sein soll als "Founder, die selbst coden", ist Idee 1 (Hybrid) die sicherere Wahl.
