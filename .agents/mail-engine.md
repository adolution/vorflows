# Versand-Steuerung (Mail-Engine), Stand 2026-10-11

Eigene Automation statt Brevo-Workflows: `api/mail-engine.js` läuft per Vercel-Cron täglich
08:00 UTC (morgens) und 16:00 UTC (abends, nur D2 und KA), lädt alle Brevo-Kontakte, entscheidet pro Kontakt
die fällige Mail und verschickt jede Gruppe als normale Brevo-Kampagne (Liste im Ordner 16
„vorflows Versand (automatisch)“, Kampagnen „Auto <Schritt> <Mail> <Datum>“). Texte: `api/_mail/mails.js`.
Tracking-Grundlage: `.agents/brevo-tracking.md`.

## Sicherungen

- Versand nur mit Env **`MAIL_ENGINE=on`** und nur, wenn `adolution.de` in Brevo **authentifiziert** ist (sonst Trockenlauf, Log `gate`).
- Pro Kontakt höchstens 1 Mail pro Tag (`MAIL_LAST`), höchstens 3 in 7 Tagen. KA/KB ignorieren die Wochengrenze, D0/D1/D2 (Deadline) ignorieren alle Grenzen und stehen in der Rangfolge vorn (Alex 2026-10-11).
- Ausgeschlossen: Liste 8, Brevo-Sperre. Käufer (Liste 5/15 oder `PRODUKTE`) fallen aus den Verkaufsmails.
- Zustand pro Kontakt in `MAILS_SENT` (`Schritt:Datum,…`), `MAIL_LAST`, `MAIL_OPEN` (Webhook).
- Auth: `Authorization: Bearer $CRON_SECRET` (Vercel-Cron) oder `?key=`. Trockenlauf: `?dry=1&today=YYYY-MM-DD`.
  Secret lokal `~/.vf_cron_secret`.

## Uhrzeit

Standard: sofort beim Morgenlauf (~10 Uhr Berlin). `SEND_LATER` plant A1G (Live-Zuschauer) und R1S (nur Sheet) als Brevo-Kampagne auf 14 Uhr desselben Tages, damit zuerst die engagiertesten Empfänger Signale senden. Bis dahin kann die Kampagne in Brevo noch gestoppt werden.

## Segmente

| Segment | Woher |
|---|---|
| Welle 1 | Liste 5 (Kauf vor 11.10.) + Liste 6 (live dabei) |
| Welle 2 | Liste 7 (nicht gesehen, nicht gekauft) |
| Nur im Sheet | Liste 17 (88 Kontakte, Quelle „sheet“, WebinarJam unbekannt) → neutrale Replay-Mail R1S, sonst wie Liste 7 |

## Ablauf (Start Di 2026-10-13, AdsFlow-Launch bis 2026-11-02 23:59)

| Schritt | Mail | Wer / wann |
|---|---|---|
| A1 | A1K / A1G | Welle 1, ab Di 13.10. (Puffer bis 19.10.) |
| A1X | A1KX / A1GX | Welle 1, A1 nicht geöffnet, kein Besuch, 3 bis 5 Tage nach A1 (neuer Betreff) |
| A2, A3, A4 | A2, A3, A4 | Welle 1 mit Öffnung/Besuch, ab 16.10. / 20.10. / 27.10., je ≥ 3 Tage Abstand |
| R1 | R1 / R1S | Liste 7 ohne Replay-Start, ab Mi 14.10. (Puffer bis 20.10.) |
| R2 | R2 | Replay nicht gestartet, 2 bis 5 Tage nach R1 |
| R3 | R3 | Replay nicht gestartet, ≥ 4 Tage nach R2, bis 24.10. |
| RW | RW | Replay gestartet, Pitch nicht erreicht, 2 Tage nach Start, bis 29.10. |
| P1, P2, P3 | P1 bis P3 | Pitch gesehen (Liste 10), +1 / +3 / +5 Tage, bis Bundle-Kauf |
| KB / KA | KB / KA | Kauf-Klick Bundle / AdsFlow ohne Kauf, +1 Tag |
| B1 | B1 | Welle 2 ab Mo 26.10.; wer den Pitch sah: erst 2 Tage nach P3 |
| B1X | B1X | B1 nicht geöffnet, +2 Tage |
| B2, B3 | A2, A3 | Welle 2 mit Öffnung/Besuch, je +2 Tage, bis 1.11. |
| U1 | U1 | Bundle-Kauf ab 11.10. (per Digistore-IPN), Tag nach dem Kauf: Upsell „Wenn du deine Anzeigen auch automatisieren willst“. Neue Käufer verlassen Welle 1/2. |
| U2 | A3 | Upsell-Käufer mit Öffnung/Besuch, 3 Tage nach U1 |
| D0 | D0 | So 1.11. morgens, alle mit A1/B1/U1/P1 ohne AdsFlow-Kauf (Vortag) |
| D1 | D1 | Mo 2.11. morgens, alle mit A1/B1/U1/P1 ohne AdsFlow-Kauf |
| D2 | D2 | 2.11. abends, AdsFlow-Seite besucht, ohne Kauf |

Simulation mit echten Kontakten: ~3.700 bis 4.300 Mails, max. 10 pro Person in 3 Wochen (Brevo Starter: 5.000/Monat).
Brevo-Kampagne 1 (alte Replay-Mail, 15.10.) muss **pausiert** sein, R1 kommt jetzt aus der Steuerung.

## Anforderer der Aufzeichnung (/live-workshop, seit 2026-10-13)

Wer: Liste 22 (bestätigt) bzw. 21 (unbestätigt), **ohne Liste 4**. Alte Workshop-Leads, die nochmal anfordern,
bleiben in ihrer bisherigen Strecke (R/A/B). Zeitlos, ohne Enddatum, Start jeweils ab `RP_OPTIN` / `RP_OPTIN_OK`.
R1 bis R3 bleiben nur Liste 7 (Texte beziehen sich auf die Anmeldung zum Live-Termin).

| Schritt | Mail | Wann |
|---|---|---|
| Q0 | Q0 | unbestätigt, 1 bis 5 Tage nach Anforderung, einmalig. **Einzelmail** (`/smtp/email`) mit eigenem Bestätigungslink, ohne Abmeldelink, sagt „letzte Mail“. Danach nie wieder. |
| Q1 | Q1 | bestätigt, Video nicht gestartet, +1 Tag |
| Q3 | Q3 | weiter nicht gestartet, +3 Tage nach Q1, letzte Mail zum Video |
| RW | RW | gestartet, Angebot nicht erreicht, +2 Tage nach Start (für Liste 7 nur bis 29.10.) |
| P1 bis P3, KB | wie oben | Angebot gesehen / Kauf-Klick |
| C1 | C1 | AdsFlow-Einstieg: 2 Tage nach P3, sonst 2 Tage nach Q3, sonst 4 Tage nach RW |
| C1X | C1 neuer Betreff | C1 nicht geöffnet, 3 bis 5 Tage danach |
| C2, C3, C4 | A2, A3, A4 | C1 geöffnet/besucht, je +3 Tage |

## Sale-Logik (zeitlos)

`AF_SALE = { bis, satz }` in `mails.js`. `mailFor(key, { T })` ersetzt `%%SALE%%` nur, solange `T <= bis`, sonst
fällt der Absatz weg. D0/D1/D2 hängen an `AF_SALE.bis`. Neuer Sale: nur `AF_SALE` ändern (und D-Texte prüfen).
Texte für Anforderer dürfen kein Datum, kein „neu“, kein „ich war still“ fest enthalten. U1 geht jetzt bis 7 Tage
nach dem Kauf (statt bis 1.11.), U2 ohne Enddatum.

## Kauf-Abgleich und Öffnungen

- `api/ds24-ipn.js`: Digistore-IPN (URL mit `?k=hookKey('ds24')`, in `~/.vf_hook_urls`). `on_payment` 688983 → Liste 5,
  690701 → Liste 15, `GEKAUFT`, `PRODUKTE`, `KAUF_DATUM`. `on_refund`/`on_chargeback` → `ERSTATTET`.
- `api/brevo-hook.js`: Brevo-Webhook 2243173 (marketing, opened + click) → `MAIL_OPEN` = heute.

## Ändern

Texte nur in `mails.js` (Regeln oben in der Datei). Neue Schritte in `rules()` in Prioritätsreihenfolge.
Vor jedem Deploy: Simulation über alle Tage laufen lassen (`planDay` mit echten Kontakten, Zustand fortschreiben),
Testmails mit `[Test …]`-Betreff an alex@adolution.de. Neue Kontakte brauchen `VF_TOKEN` (siehe brevo-tracking.md).
