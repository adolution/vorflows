# Brevo-Verhaltens-Tagging (Stand 2026-10-11)

Wer aus einer Brevo-Mail auf /replay, /sales oder /adsflow kommt, wird in Brevo mit Feldern und Listen markiert.
Grundlage für Segmente und Automationen (Replay, Bundle-Nachfass, AdsFlow-Launch).

## So funktioniert es

1. Jeder Brevo-Kontakt hat im Feld **`VF_TOKEN`** einen Token `<contact-id>.<hmac12>` (HMAC-SHA256 mit `VF_TRACK_SECRET`,
   base64url, 12 Zeichen). Gesetzt für alle 676 Kontakte am 2026-10-11 per Skript (siehe unten).
2. Jeder Link in einer Mail bekommt **`?vt={{ contact.VF_TOKEN }}`** (plus UTM), z. B.
   `https://vorflows.com/replay?vt={{ contact.VF_TOKEN }}&utm_source=brevo&utm_medium=email&utm_campaign=replay-1`
3. `assets/vf-id.js` (im `<head>` von replay.html, sales.html, adsflow.html, **vor** Clarity/Pixel) liest `vt`, speichert
   ihn in `localStorage.vf_vt`, entfernt ihn per `replaceState` aus der URL und stellt `window.vfTag(ev, d)` bereit.
   Ohne Token sendet `vfTag` nichts. Bei `vf_consent = denied` auch nicht. Lokal nur `console.info`.
4. Die Seiten-Helfer rufen `vfTag` mit: `lwTrack` (replay), `afTrack` (adsflow), `cEvent` (sales: nur
   `digistore_redirect` und `hero_video_pct_*` → `sales_video_pct`). Dazu 1× pro Sitzung und Seite `page`.
5. `/api/brevo-track` prüft den Token, mappt das Ereignis (Whitelist in `plan()`), liest den Kontakt und schreibt nur,
   was sich ändert. Env: **`BREVO_API_KEY`**, **`VF_TRACK_SECRET`** (Production). Log-Präfix `brevo-track`.

Der Token verrät nur die Brevo-Kontakt-ID, keine Mail-Adresse. Fälschen geht ohne Secret nicht.

## Felder (Datum = Berliner Tag, erstes Auftreten)

| Feld | Typ | Wann |
|---|---|---|
| `RP_VISIT` | Datum | /replay geöffnet |
| `RP_START` | Datum | Replay gestartet (`LW_Replay_Play` oder erster Fortschritt) |
| `RP_PCT` | Zahl | höchster Fortschritt 25/50/75/95 |
| `RP_PITCH` | Datum | Pitch gesehen (`LW_Replay_Offer`, 15 s ab 37:23 oder Ende) |
| `RP_CHECKOUT` | Datum | Kauf-Klick Bundle auf /replay |
| `SALES_VISIT` / `SALES_VSL_PCT` / `SALES_CHECKOUT` | Datum / Zahl / Datum | /sales besucht, VSL-Fortschritt, Kauf-Klick |
| `AF_VISIT` / `AF_LAST` / `AF_VISITS` | Datum / Datum / Zahl | /adsflow erster und letzter Besuch, Anzahl Sitzungen |
| `AF_VSL_START` / `AF_VSL_PCT` | Datum / Zahl | AdsFlow-Video gestartet, höchster Fortschritt |
| `AF_CHECKOUT` | Datum | Kauf-Klick AdsFlow |
| `AF_AGENCY` | Datum | Agentur-Formular abgeschickt |
| `LAST_SEEN` | Datum | letzter Besuch auf einer der drei Seiten |

## Listen (Ordner „vorflows“, id 3) = Automations-Auslöser

| ID | Name | Wann |
|---|---|---|
| 9 | Replay gestartet | `RP_START` |
| 10 | Replay Pitch gesehen | `RP_PITCH` |
| 11 | Bundle Kauf-Klick | Kauf-Klick auf /replay oder /sales |
| 12 | AdsFlow Seite besucht | /adsflow aufgerufen |
| 13 | AdsFlow Video gestartet | VSL gestartet |
| 14 | AdsFlow Kauf-Klick | Digistore-Klick auf /adsflow |
| 15 | Käufer AdsFlow | **nicht vom Tracking**: per Digistore→Brevo-Anbindung oder von Hand |

Bestehende Listen: 4 alle, 5 Käufer Bundle, 6 gesehen/nicht gekauft, 7 nicht gesehen/nicht gekauft, 8 abgemeldet.
Brevo-Öffnungen und Klicks auf Kampagnen kommen zusätzlich aus Brevo selbst.

## Neue Ereignisse andocken

Event im Seiten-Helfer feuern (geht automatisch an `vfTag`), dann in `api/brevo-track.js` → `plan()` einen `case`
ergänzen. Neue Felder per `POST /contacts/attributes/normal/<NAME>`, neue Listen per `POST /contacts/lists` (folderId 3),
IDs oben in `LIST` und hier eintragen. Neue Seite: Skript-Tag in den `<head>` und `page`-Name in `vf-id.js` und
`brevo-track.js` (Whitelist) ergänzen.

## Neue Kontakte

Neue Kontakte haben keinen `VF_TOKEN`, bis das Token-Skript wieder läuft (setzt nur fehlende/falsche):
Token = `id + '.' + sign(id, secret)` aus `api/brevo-track.js`, Secret liegt lokal in `~/.vf_track_secret`.
Vor jedem Versand an neue Kontakte einmal laufen lassen.

## Tests

- `node test-vf-id.mjs` (Server :3001): Token wird gespeichert und aus der URL entfernt, auf allen drei Seiten.
- Handler direkt: mit Testkontakt ID 1 (alex@adolution.de, Token `1.ft7Bt1ikeCf8`), danach Felder/Listen dort zurücksetzen.

## Datenschutz

Das ist personenbezogenes Tracking (Seitenbesuch und Video-Fortschritt hängen an der Mail-Adresse). Muss in der
Datenschutzerklärung stehen, bevor Mails mit `vt`-Links rausgehen.
