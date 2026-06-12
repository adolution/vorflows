# Design-Critique: Live-Workshop LP, Variante A + B (2026-06-12)

Scope: `live-workshop.html` (A) + `live-workshop-b.html` (B). Design per Test-Setup identisch — einzige Variable ist Hero-Copy (H1 + Lead). Eine Bewertung für beide, Hero-Vergleich separat.

Screenshots: `temporary screenshots/screenshot-946…952` (Desktop/Mobile, Heroes A+B).

---

## Anti-Patterns-Verdict: **PASS**

Sieht nicht AI-generiert aus. Fraunces/Inter-Pairing, ein Akzent (Terracotta), warm getönte Neutrals (kein #fff/#000), editoriale Step-Nummern statt Icon-Card-Grids, kein Gradient-Text, kein Glow, kein Glassmorphism als Deko. Einziger Template-Moment: das 3-Spalten-Einwände-Grid — als segmentiertes Panel gestylt, vertretbar.

## Design Health Score

| # | Heuristik | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Scroll-Progress, "Schritt 1 von 2", `aria-live` reg-note — gut. Aber Endzustand des Funnels ist "Anmeldung wird scharfgeschaltet" |
| 2 | Match System / Real World | 4 | Founder-Sprache, echte Zahlen, kein Jargon |
| 3 | User Control and Freedom | 2 | Cookie-Modal blockt Einstieg; Reject-Step im Modal ohne Schließen-CTA; kein Fokus-Management |
| 4 | Consistency and Standards | 3 | Tokens 1:1 Homepage. CTA-Labels variieren ("Platz sichern" / "Kostenlos anmelden" / "… · Gratis") |
| 5 | Error Prevention | 3 | Shopify-Qualifier verhindert falsche Anmeldungen — gut |
| 6 | Recognition Rather Than Recall | 4 | Single-Purpose-Page, nichts zu merken |
| 7 | Flexibility and Efficiency | 2 | Drei CTA-Wege (Nav/Hero/Sticky) gut — aber alle enden ohne echtes Formular |
| 8 | Aesthetic and Minimalist Design | 4 | Restraint sitzt. Whitespace, ein Akzent, klare Hierarchie |
| 9 | Error Recovery | 3 | Mailto-Fallback ehrlich formuliert, aber er IST der Fehlerzustand |
| 10 | Help and Documentation | 3 | FAQ gut, Aufzeichnungs-Antwort weicht aus |
| **Total** | | **31/40** | **Good — solide Basis, Schwachstellen gezielt fixen** |

Cognitive-Load-Checkliste: **1 von 8 Fails** (Cookie-Modal unterbricht Single Focus beim Einstieg) → low.

## Gesamteindruck

Handwerklich eine der besseren Webinar-LPs: editorial, ruhig, markentreu, klare Eine-Aktion-Architektur. Das Problem liegt nicht im Design — es liegt am Ende des Funnels: **der primäre CTA führt ins Leere.** Zweitgrößtes Problem: das erste, was jeder Besucher sieht, ist ein zentriertes Cookie-Modal, das die getestete Headline verdeckt.

## Was funktioniert

1. **Hero-Hierarchie:** H1 → Lead → Datebar (pulsierender Live-Dot) → ein einziger CTA. 2-Sekunden-Test bestanden, Desktop und Mobile.
2. **Mechanik statt Marketing:** Kosten-Section mit konkreten 9 Apps, 436 €/Monat, 5.232 €/Jahr neben echter App-Liste.
3. **Qualifier-Section** ("Nicht für dich, wenn…") — selbstbewusst, selektiert vor, on-brand direkt.

## Priority Issues

### [P0] CTA endet in Sackgasse
Jeder "Kostenlos anmelden"-Klick → Commitment-Modal (2 Steps) → bei "Ja, Shopify" → Scroll zur Notiz *"Die Anmeldung wird gerade scharfgeschaltet, schreib mir an alex@…"* (`live-workshop.html:569-573`, `openWebinarForm` Z. 685-688). User investiert zwei Commitment-Klicks, Belohnung ist eine E-Mail-Bitte. Peak-End-Regel maximal verletzt. Termin 25. Juni — bei laufendem Traffic kostet jeder Tag Anmeldungen.
**Fix:** WebinarJam-Embed/Formular live schalten. Übergangsweise: mailto als gestylten Primär-Button mit vorbefülltem Body.
**Command:** keiner — Funnel-Arbeit.

### [P1] Cookie-Modal verdeckt Hero — und damit die Testvariable
Zentriertes Modal + Backdrop-Blur beim Erstbesuch (Z. 321), liegt über H1. 100 % des Traffics interagiert mit Consent-Dialog, bevor die getestete Headline wirkt. Trifft beide Varianten gleich (Test bleibt valide), drückt aber absolute Conversion und verfälscht Dwell-/Scroll-Metriken.
**Fix:** Bottom-Sheet oder Ecke, ohne Backdrop. (Nebenbefund, bewusste Entscheidung lt. Tracking-Doku: Clarity lädt unabhängig von Consent-Wahl — beide Buttons schließen nur.)
**Command:** `/quieter` bzw. manuell.

### [P1] Commitment-Modal ohne Fokus-Management — ✅ BEHOBEN 2026-06-12
`lwqModal` öffnet, Fokus bleibt auf Button dahinter; kein Fokus-Trap, kein Restore beim Schließen (Z. 691-710). Esc funktioniert. Reject-Step hat keinen Button — Ausstieg nur über X oder Esc.
**Umgesetzt (A+B identisch):** Fokus auf Step-Button beim Öffnen/Step-Wechsel, Tab-Trap im Dialog, Fokus-Restore mit `preventScroll` beim Schließen, Reject-Step hat "Alles klar"-Button (`data-lwq-done`). Per Puppeteer auf A+B verifiziert (Open/Trap/Step2/Reject/Close/Esc).

### [P2] Credibility-Section trägt nicht für Kalt-Traffic
"404, Atlas und Quiver (8,3 Mio. € Funding)", "Programm mit Paddy" (Z. 503-508) — Insider-Namen ohne Kontext, nicht verifizierbar. Skeptische Persona reagiert auf unverifizierbare Claims gegenteilig. Einziger echter Kundenbeleg (Kisker-Quote) sitzt weit unten.
**Fix:** Claims konkretisieren oder kürzen; Quote ggf. höher.
**Command:** `/clarify`.

### [P2] "Warum jetzt"-Section kippt tonal
Zweiter Lead ("KI massiv unterbewertet… nie günstiger… Vorsprung sichern", Z. 549) ist FOMO — `.impeccable.md` verbietet Urgency-Tricks. Häufung: Closed Beta + keine Aufzeichnung + FOMO in einer Section.
**Entscheidung 2026-06-12: bleibt bewusst so — Webinar-Funnel darf härter verkaufen als Homepage.**

## Hero A vs. B (Testvariable)

- **A** akzentuiert Produkt-Substantiv ("Shopify-Shop" terracotta-italic) — Demonstrations-Versprechen, 2 Zeilen Desktop.
- **B** akzentuiert Schmerz-Wörter ("gratis ersetzt") — Verlust-Frame, Loss Aversion. 3 Zeilen Desktop, 5 Zeilen mobil; CTA bleibt auf 390×844 über der Falz, aber knapper. B-Lead konkreter ("echten Shopify-Shop", "5.232 €").
- Beide sauber. B trägt mehr psychologisches Risiko und mehr Upside — gutes Testdesign, saubere einzelne Variable.

## Persona Red Flags

**Jordan (First-Timer):** Erstkontakt = Cookie-Modal. CTA → Modal verlangt Termin-Commitment vor jedem Formular → bestätigt zweimal → "schreib mir eine E-Mail". ⚠️ Abbruch am letzten Schritt nach maximalem Invest. Versteht "404, Atlas, Quiver" nicht.

**Casey (Mobile, abgelenkt):** Sticky-CTA unten in Daumenzone, 50px — gut. Nach Qualify-Yes scrollt Seite zur reg-note mitten in dunkler Final-Section — desorientierend; mailto-Link kleines Inline-Ziel. B-Hero: 5 Zeilen H1 schieben CTA Richtung Falz.

**Skeptischer Founder (Projekt-Persona):** Riecht Scarcity sofort. Closed Beta + keine Aufzeichnung + "nie günstiger" zusammen = Cheap-Course-Energie (Anti-Referenz). Einzeln tragbar, Häufung nicht. *(Bewusst akzeptiert, s.o.)*

## Minor Observations

- ~~Sticky-CTA "Kostenlos anmelden · Gratis" — redundant (Z. 609).~~ ✅ Behoben 2026-06-12: Label = "Kostenlos anmelden" (A+B).
- ~~FAQ "Gibt es eine Aufzeichnung?" antwortet nicht mit Nein.~~ ✅ Behoben 2026-06-12: "Nein, es gibt keine Aufzeichnung. …" (A+B).
- Datebar-Rot `#E5484D` = zweiter Akzent; semantisch als Live-Signal ok, aber Label 11px auf Dunkel ≈ 4,3:1 Kontrast — knapp unter WCAG AA.
- `.reveal{opacity:0}` ohne `<noscript>`-Fallback: ohne JS ganze Sections unsichtbar. Hat auch `screenshot.mjs` ausgehebelt (Scroll-Walk zu schnell für IntersectionObserver) — bei normaler Scrollgeschwindigkeit verifiziert: 15/15 Reveals feuern.

## Empfohlene Reihenfolge (wenn Umsetzung gewünscht)

1. **Funnel-Ende (P0, manuell)** — echtes Formular vor 25. Juni.
2. **`/quieter`** — Cookie-Modal → nicht-blockierendes Bottom-Sheet.
3. **`/harden`** — Modal-Fokus, Reject-Button, noscript-Fallback.
4. **`/clarify`** — Credibility-Bullets, FAQ-Antwort, "· Gratis".
5. **`/polish`** — Datebar-Kontrast, CTA-Label-Konsistenz.

User-Entscheidung 2026-06-12: erstmal nur Report, keine Änderungen. Scarcity-Section bleibt bewusst.
