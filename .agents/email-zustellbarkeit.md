# E-Mail-Zustellbarkeit: Checkliste für jede Mail

Gilt für jede Mail, die über Brevo (oder ein anderes Tool) rausgeht. Vor jedem Versand Abschnitt 4 durchgehen.
Stand: 2026-10-10.

## 1. Absender-Reputation (wichtiger als jedes Wort)

Spam-Wörter sind nur ein kleiner Faktor. Gmail, Outlook, GMX und Web.de entscheiden vor allem nach Authentifizierung, Beschwerderate und Engagement.

- **Absender:** `alex@adolution.de` („Alex von vorflows“). vorflows.com hat kein MX, kann also keine Antworten empfangen, deshalb nicht als Absender nutzen, solange das so ist.
- **Domain-Authentifizierung in Brevo:** adolution.de ist seit 2026-10-10 in Brevo angelegt, DNS liegt bei Cloudflare. Nötige Einträge (Cloudflare: Proxy AUS, „DNS only“):
  - `CNAME brevo1._domainkey` → `b1.adolution-de.dkim.brevo.com`
  - `CNAME brevo2._domainkey` → `b2.adolution-de.dkim.brevo.com`
  - `TXT @` → `brevo-code:48974d7815e790dabf7a462449d4aab1`
  - DMARC existiert schon (`p=none`), reicht für Gmail/Yahoo. Optional `rua=mailto:rua@dmarc.brevo.com` an den bestehenden Eintrag anhängen, keinen zweiten anlegen.
  - Prüfen: `GET /senders/domains` muss `authenticated: true` zeigen. Ohne DKIM-Alignment landen Mails deutlich öfter im Spam.
- **Gmail/Yahoo-Regeln (seit 02/2024):** SPF oder DKIM aligned, DMARC vorhanden, One-Click-Unsubscribe im Header (macht Brevo), Abmeldung binnen 2 Tagen, Spam-Beschwerderate unter 0,3 % (Ziel unter 0,1 %).
- **Liste sauber halten:** Abgemeldete (Liste 8) immer ausschließen. Hard Bounces sperrt Brevo selbst. Kontakte, die 6 Monate nichts öffnen, nicht weiter anschreiben.
- **Volumen langsam steigern:** neue Domain/neues Tool nicht direkt mit Tausenden starten. Erst die engagiertesten Segmente.
- **Monitoring:** Google Postmaster Tools für adolution.de einrichten (braucht DNS-Verifizierung).

## 2. Primary statt Werbung-Tab (Gmail)

Gmail sortiert per Machine Learning nach Inhalt, Formatierung, Absender-Historie und Engagement. Gesichert ist nur: Engagement (Antworten, Öffnen, „In Hauptpostfach verschieben“) wirkt am stärksten. Der Rest sind Erfahrungswerte:

- Mail wie eine persönliche Mail bauen: kein Logo-Header, keine Bilder, kein bunter Button, ein einspaltiger Text.
- Wenige Links, alle auf eine Domain (vorflows.com). Keine Link-Kürzer.
- Zur Antwort auffordern („antworte einfach auf diese Mail“). Antworten sind das stärkste Signal.
- Preis und Rabatt höchstens einmal, nicht im Betreff, nicht fett.
- Kein „Angebot“, „Sale“, „Rabatt“, „%“ im Betreff.

### Seed-Test 2026-10-13 (Gmail liebelebenspiel@gmail.com, Brevo-Liste 20 „Seed-Test Postfach-Tabs“)

| Variante | Tab |
|---|---|
| Brevo-Kampagne wie verschickt (A1K, A1G) | Werbung |
| Kampagne ohne Preis, nur 2 Links (Seite + Abmelden) | Werbung |
| Brevo-Einzelversand, gleiches HTML | Werbung |
| Einzelversand, schlichtes HTML | Benachrichtigungen |
| Einzelversand, nur Text, ohne Fußzeile/Abmeldung | Hauptpostfach (nicht vergleichbar, rechtlich so nicht versendbar) |

Fazit: Bei Brevo-Kampagnen entscheiden Infrastruktur und Tracking (umgeschriebene sendibt-Links, Pixel, List-Id/Feedback-ID), nicht der Wortlaut. Tracking lässt sich bei Kampagnen nicht abschalten (Support lehnt ab). Einzelversand für Werbung ist bei Brevo nicht vorgesehen, deshalb verworfen. Hebel bleiben Engagement (Antworten) und Reputation. Seit 2026-10-13: keine Preise im Text, Fußzeile nur Abmelde-Link + Anschrift (Alex, bewusst ohne Impressum-Link).

## 3. Kritische Wörter

Nicht verboten, aber gehäuft und vor allem im Betreff riskant. GMX, Web.de und Outlook filtern im DACH-Raum besonders streng.

**Betreff-Formalien:** keine GROSSBUCHSTABEN-Wörter, keine Ausrufezeichen (schon eins ist riskant), kein „€“, „%“, „$“, keine langen Zahlenketten, kein „Re:“/„Fwd:“ als Trick, keine Emojis-Kette.

**Gratis:** kostenlos, gratis, umsonst, geschenkt, Geschenk, Gratis-Probe, kostenlose Testversion, kostenlose Beratung, 0 €

**Geld:** Geld verdienen, Geld zurück, Einkommen, Nebeneinkommen, Bargeld, Kredit, Schulden, Millionen, reich, billig, günstigster Preis, niedrigster Preis, sparen, Rabatt, Sonderangebot, Schnäppchen, Prozent, Bestpreis

**Druck/Dringlichkeit:** jetzt, sofort, dringend, letzte Chance, nur heute, nur noch, läuft ab, zeitlich begrenzt, solange der Vorrat reicht, handeln Sie jetzt, nicht verpassen, letzte Erinnerung

**Versprechen:** garantiert, Garantie, risikofrei, ohne Risiko, 100 %, unverbindlich, kein Haken, versprochen, Wunder, unglaublich, sensationell, Geheimnis

**Klick/Kauf:** hier klicken, klicke hier, jetzt kaufen, jetzt bestellen, jetzt anmelden, bestellen Sie heute, Zugang sichern, Platz sichern

**Gewinn:** Gewinner, gewinnen, Glückwunsch, du wurdest ausgewählt, Preis (im Sinne von Gewinn), exklusiv für dich

**Marketing/Meta:** Werbung, Anzeige, Newsletter (im Betreff), Massenmail, kein Spam, Spam, Marketing, Umsatz steigern, mehr Traffic, MLM

**Englisch (auch in deutschen Mails relevant):** free, bonus, act now, limited time, click here, buy now, order now, guarantee, winner, cash, $$$

Im Fließtext ist ein einzelnes „jetzt“ oder „Abmelden“ im Footer unkritisch. Problem ist Häufung plus schwache Reputation.

## 4. Check vor jedem Versand

1. Brevo-Domain authentifiziert? (`GET /senders/domains`)
2. Betreff: Wortliste oben, keine Ausrufezeichen/Großbuchstaben/€/%. Unter ~50 Zeichen, sagt klar, worum es geht.
3. Vorschautext gesetzt (sonst zeigt Gmail den ersten Text, oft „Hey,“).
4. Text: Wortliste, Preis max. einmal, keine Gedankenstriche, Humanizer drüber.
5. Links: alle auf vorflows.com, alle liefern 200, UTM gesetzt.
6. Footer: Abmeldelink `{{ unsubscribe }}`, Impressum-Adresse (AMD Media GmbH), Datenschutz.
7. Empfänger: Zielliste + Ausschluss Liste 8 (abgemeldet) + ggf. Liste 5 (Käufer).
8. Testmail an alex@adolution.de und an ein GMX/Web.de- und ein Outlook-Postfach, Tab/Ordner prüfen.
9. Optional: mail-tester.com (Score ≥ 9/10).
10. Zahlen im Text (z. B. „noch N frei“) am Versandtag aktuell?

## Quellen

- HubSpot DE, Spam-Wörter: https://blog.hubspot.de/marketing/e-mail-spam-woerter
- Overloop, Spam-Auslösewörter: https://overloop.com/de/blog/spam-ausloeseworter-e-mail-liste
- MailReach, Spam-Wörter 2026: https://www.mailreach.co/de/blog/spam-words
- Litmus, Gmail Promotions Tab: https://www.litmus.com/blog/gmails-promotions-tab-is-not-the-spam-folder/
- Data Axle, Promotions Tab: https://data-axle.com/resources/blog/gmails-updated-promotions-tab-empowers-brands-with-exciting-tools-to-stand-out-in-the-inbox
- Bird, Gmail/Yahoo Sender Requirements: https://bird.com/docs/knowledge-base/deliverability/gmail-yahoo-requirements
