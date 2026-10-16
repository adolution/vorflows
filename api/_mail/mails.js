// Alle Mails der Replay-, Bundle- und AdsFlow-Strecke. Doku: .agents/mail-engine.md
// Regeln: keine Gedankenstriche, keine Preise/Beträge im Text (Gmail-Werbetab, Alex 2026-10-13), ein Link-Ziel pro Mail,
// nur vorflows.com, Fußzeile nur mit Abmelde-Link (keine Impressum-/Datenschutz-Links),
// Betreff ohne Ausrufezeichen/€/%. Personalisierung über Brevo-Liquid ({{ contact.X }}).
// Zeitlos schreiben: Mails, die auch Anforderer der Aufzeichnung bekommen (RW, P1-P3, KB, Q*, C1, A2-A4, U1, KA),
// dürfen kein Datum, kein „neu“ und keinen Sale fest im Text haben. Sale-Hinweise nur über %%SALE%% (Alex 2026-10-13).

// ── Sale-Einstellung ─────────────────────────────────────────────────────
// Solange ein AdsFlow-Sale läuft, ersetzt mailFor() %%SALE%% durch `satz`, sonst bleibt der Absatz leer.
// Neuer Sale: `bis` und `satz` ändern. Die Deadline-Mails D0/D1/D2 (mail-engine) hängen an demselben `bis`.
export const AF_SALE = { bis: '2026-11-02', satz: 'Der Launch-Preis für AdsFlow gilt noch bis Montag, 2. November.' };

const link = (path, campaign, hash = '') =>
  `https://vorflows.com${path}?vt={{ contact.VF_TOKEN }}&utm_source=brevo&utm_medium=email&utm_campaign=${campaign}${hash}`;

const a = (href, text) =>
  `<a href="${href}" style="color:#1a1a1a;font-weight:600;text-decoration:underline;">${text}</a>`;

const HI = 'Hey{% if contact.VORNAME %} {{ contact.VORNAME }}{% endif %},';

const WHY_WORKSHOP = 'Du bekommst diese Mail, weil du dich für den Workshop „KI + Shopify“ von vorflows angemeldet hast.';
const WHY_REPLAY = 'Du bekommst diese Mail, weil du auf vorflows.com die Aufzeichnung vom Workshop „KI + Shopify“ angefordert hast.';
const WHY_BUYER = 'Du bekommst diese Mail, weil du vorflows gekauft hast.';
// Anforderer der Aufzeichnung (RP_OPTIN_OK) bekommen den passenden Grund, alle anderen den Workshop
const WHY_LEAD = '{% if contact.RP_OPTIN_OK %}' + WHY_REPLAY + '{% else %}' + WHY_WORKSHOP + '{% endif %}';
const WHY_AUTO = '{% if contact.GEKAUFT %}' + WHY_BUYER + '{% else %}' + WHY_LEAD + '{% endif %}';

export function render({ subject, preview, body, why = WHY_AUTO, unsub = true }) {
  const paras = body.trim().split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean).map((p) => {
    if (p.startsWith('<')) return p;
    return `<p style="margin:0 0 16px;">${p.replace(/\n/g, '<br>')}</p>`;
  }).join('\n');
  const off = unsub ? ` <a href="{{ unsubscribe }}" style="color:#777777;">Abmelden</a>` : '';
  return `<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${subject}</title>
</head>
<body style="margin:0;padding:0;background:#ffffff;">
<div style="display:none;max-height:0;overflow:hidden;">${preview}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#ffffff;">
<tr><td align="center" style="padding:24px 16px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:16px;line-height:1.6;color:#1a1a1a;">
<tr><td>
${paras}
<p style="margin:16px 0 0;padding-top:16px;border-top:1px solid #e5e5e5;font-size:12px;line-height:1.5;color:#777777;">${why}${off}<br>AMD Media GmbH, c/o Pioneers Club, Ritterstraße 8, 33602 Bielefeld</p>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}

// ── Bausteine ────────────────────────────────────────────────────────────

const SCARCITY_REPLAY = `Zum Angebot am Ende gehört eine 1:1-Schulung mit mir an deinem Shop. Die mache ich selbst, deshalb gibt es davon nur 20 im Monat, und wer zuerst zugreift, bekommt den Platz. Wie viele gerade noch frei sind, siehst du auf der Seite, sobald im Video das Angebot kommt.`;

// Für Mails, die auf /sales (Kurzfassung, 5 Minuten) verlinken: dort stehen Angebot und freie Plätze sofort
const SCARCITY_SALES = `Zum Angebot gehört eine 1:1-Schulung mit mir an deinem Shop. Die mache ich selbst, deshalb gibt es davon nur 20 im Monat, und wer zuerst zugreift, bekommt den Platz. Wie viele gerade noch frei sind, steht auf der Seite direkt beim Angebot.`;

const ADSFLOW_CORE = (c) => `Ich weiß nicht, wie das bei dir ist, aber in den meisten Shops, die ich mir anschaue, laufen seit Wochen dieselben drei Anzeigen. An Ideen fehlt es da selten. Jede neue Anzeige kostet im Ads Manager eben eine halbe Stunde, und Meta schaltet dabei jedes Mal Extras an, die keiner bestellt hat, von Musik unter dem Bild bis zu abgeschnittenen Produkten.

AdsFlow ist ein Ordner, den du in Claude öffnest. Du schreibst „Neue Ads“, Claude schreibt die Texte, holt sich dein Okay und legt die Anzeigen fertig in deinem Werbekonto an: im Feed quadratisch, in der Story hochkant, mit UTM-Parametern und mit allen Meta-Extras auf aus. Eingeschaltet wird dabei nichts. Live schaltest du selbst, dafür hat Claude gar keine Berechtigung.

Im Video zeige ich dir das in meinem eigenen Werbekonto. Nach fünf Minuten siehst du die fertigen Anzeigen, danach kommen die Details: ${a(link('/adsflow', c), 'AdsFlow im Video ansehen')}`;

const MICHAEL = `<p style="margin:0 0 16px;padding-left:14px;border-left:3px solid #e5e5e5;">„Als ich das im Workshop gesehen habe, war ich skeptisch, ob das wirklich so klappt. Aber jetzt kann ich nur sagen: wow, wow, wow. Ich hatte bisher Agenturen und Freelancer, irgendwie zehn unterschiedliche Entwickler und Berater, und ich muss sagen: die sind alle schlechter. Dein Tool ist gnadenlos gut.“<br><span style="color:#555555;">Michael Bodeske, Massagesesselwelt.de</span></p>`;

const STIMMEN = `${MICHAEL}
<p style="margin:0 0 16px;padding-left:14px;border-left:3px solid #e5e5e5;">„Wir hatten schon mit KI gearbeitet. Aber erst seit dem Setup von Alex merken wir, wie ineffizient wir vorher waren und wie viel schneller und vor allem zuverlässiger es geht.“<br><span style="color:#555555;">Leo, Pure U</span></p>
<p style="margin:0 0 16px;padding-left:14px;border-left:3px solid #e5e5e5;">„Alles schnell eingerichtet und sofort SEO- und Conversion-Optimierungen erkannt und umgesetzt. Genau, was ich mir vorgestellt hab.“<br><span style="color:#555555;">Stefan Kisker, Prometheus GmbH</span></p>`;

// ── Mails ────────────────────────────────────────────────────────────────

export const MAILS = {
  // ── Replay-Strecke für Liste 7 (angemeldet, live nicht dabei). Nur Liste 7, Texte beziehen sich auf die Anmeldung. ──
  R1: {
    subject: 'Shopify + KI: Die Aufzeichnung ist online',
    preview: 'Mit Kapiteln zum Springen. Wenn du wenig Zeit hast, fang bei Minute 8 an.',
    why: WHY_WORKSHOP,
    body: `${HI}

du hattest dich für meinen Workshop „KI + Shopify“ angemeldet, und danach haben mich einige nach der Aufzeichnung gefragt. Das hat länger gedauert, als ich dachte, sorry dafür. Ich habe sie noch mal geschnitten und Kapitel eingebaut, damit du nicht 52 Minuten am Stück schauen musst.

Hier ist sie: ${a(link('/replay', 'replay-1'), 'Aufzeichnung ansehen')}

Wenn du wenig Zeit hast, fang bei Minute 8 an. Ab da arbeite ich mit Claude Code an einem echten Shopify-Shop. Claude baut eine Section, für die du sonst eine App bezahlen würdest, und sucht in den Suchdaten nach Seiten, die knapp vor Seite 1 stehen. Am Live-Shop ändert sich dabei nichts, weil Claude an einer Kopie des Themes arbeitet.

Am Ende stelle ich vorflows vor, das System, mit dem ich selbst arbeite. ${SCARCITY_REPLAY}

Falls nach dem Video Fragen offen sind, antworte einfach auf diese Mail. Die lese ich selbst.

Viele Grüße
Alex

PS: Wenn Automatisierungen und Dinge mit KI bauen gerade nicht dein Thema sind, kannst du dich ganz unten austragen. Nehm ich dir nicht übel.`,
  },

  // Nur im Sheet (Liste 17): Workshop-Status unbekannt, evtl. nie etwas bekommen. Neutral formuliert.
  R1S: {
    subject: 'Shopify + KI: Die Aufzeichnung ist online',
    preview: 'Falls du live nicht dabei sein konntest oder es dir noch mal ansehen willst, hier ist sie, mit Kapiteln.',
    why: WHY_WORKSHOP,
    body: `${HI}

du hattest dich für meinen Workshop „KI + Shopify“ angemeldet. Falls du live nicht dabei sein konntest oder dir das Ganze noch mal in Ruhe ansehen willst: Die Aufzeichnung ist online. Ich habe sie geschnitten und Kapitel eingebaut, damit du direkt zu den Stellen springen kannst, die dich interessieren.

${a(link('/replay', 'replay-1-sheet'), 'Aufzeichnung ansehen')}

Kurz, worum es geht: Ich arbeite mit Claude Code an einem echten Shopify-Shop. Claude baut eine Section, für die du sonst jeden Monat eine App bezahlen würdest, und sucht in den Suchdaten nach Seiten, die knapp vor Seite 1 stehen. Am Live-Shop ändert sich dabei nichts, weil Claude an einer Kopie des Themes arbeitet. Wenn du wenig Zeit hast, fang bei Minute 8 an.

Am Ende stelle ich vorflows vor, das System, mit dem ich selbst arbeite. ${SCARCITY_REPLAY}

Falls bei deiner Anmeldung damals etwas schiefgelaufen ist und du gar keinen Zugang bekommen hattest, tut mir das leid. Antworte einfach auf diese Mail, wenn du Fragen hast. Ich lese alles selbst.

Viele Grüße
Alex

PS: Wenn Automatisierungen und Dinge mit KI bauen gerade nicht dein Thema sind, kannst du dich ganz unten austragen. Nehm ich dir nicht übel.`,
  },

  // R2 seit 2026-10-15 auf /sales: wer die 52 Minuten nicht anfängt, bekommt die Kurzfassung (5 Minuten, Angebot sofort sichtbar)
  R2: {
    subject: 'Der Workshop in fünf Minuten',
    preview: 'Falls 52 Minuten gerade nicht drin sind, hier ist das Wichtigste als kurzes Video.',
    why: WHY_WORKSHOP,
    body: `${HI}

du hattest dich für meinen Workshop „KI + Shopify“ angemeldet, und vor ein paar Tagen habe ich dir die Aufzeichnung geschickt. Ich kann gut verstehen, wenn 52 Minuten neben dem Shop gerade nicht drin sind. Deshalb hier die kurze Fassung, ein Video von fünf Minuten mit den Stellen, auf die es ankommt.

${a(link('/sales', 'replay-2-kurz'), 'Kurzfassung ansehen')}

Du siehst darin, wie Claude in einem echten Shopify-Shop eine App ersetzt, eine Versandleiste baut und aus Klick- und Suchdaten ableitet, was im Shop als Nächstes verbessert werden sollte. Am Live-Shop ändert sich dabei nichts, bevor du es freigibst, weil Claude an einer Kopie des Themes arbeitet. Unter dem Video steht, was alles in vorflows steckt und wie die Einrichtung abläuft.

${SCARCITY_SALES}

Wenn dir beim Schauen eine Frage kommt, antworte einfach auf diese Mail. Ich lese alles selbst.

Viele Grüße
Alex`,
  },

  R3: {
    subject: 'Was Michael nach dem Workshop geschrieben hat',
    preview: 'Er verkauft Massagesessel und hatte vorher zehn verschiedene Entwickler und Berater.',
    why: WHY_WORKSHOP,
    body: `${HI}

nach dem Workshop hat mir Michael geschrieben. Er verkauft Massagesessel und hatte vorher, wie er sagt, zehn verschiedene Entwickler und Berater.

${MICHAEL}

Falls du die Aufzeichnung noch nicht angefangen hast, hier ist sie: ${a(link('/replay', 'replay-3'), 'Aufzeichnung ansehen')}

Ab Minute 8 arbeite ich live mit Claude Code an einem echten Shop. Am Ende kommt das Angebot, und weil die 1:1-Schulung dazugehört, gibt es dafür nur wenige Plätze im Monat. Wie viele gerade frei sind, siehst du auf der Seite, sobald das Angebot im Video kommt.

Und falls Automatisierungen und Dinge mit KI bauen gerade nicht dein Thema sind, ist das völlig okay. Dann kannst du dich unten austragen.

Viele Grüße
Alex`,
  },

  // ── Anforderer der Aufzeichnung (/live-workshop, Liste 21/22). Zeitlos, ohne Datum. ──
  // Q0: einmalige Erinnerung an Unbestätigte. Geht als Einzelmail mit eigenem Bestätigungslink (%%OPTIN%%),
  // ohne Liquid und ohne Abmeldelink (es ist die letzte Mail, danach wird die Adresse nie wieder angeschrieben).
  Q0: {
    subject: 'Deine Aufzeichnung vom Shopify-Workshop',
    preview: 'Du hattest sie angefordert, aber den Link noch nicht geöffnet. Das ist meine letzte Mail dazu.',
    why: 'Du bekommst diese Mail, weil auf vorflows.com mit deiner Adresse die Aufzeichnung angefordert wurde. Warst du das nicht, ignoriere sie einfach.',
    unsub: false,
    body: `%%HI%%

du hast vor Kurzem auf vorflows.com die Aufzeichnung von meinem Shopify-Workshop angefordert. Den Link dazu habe ich dir direkt danach geschickt, aber er ist noch nicht geöffnet worden. Vielleicht ist die Mail zwischen anderen untergegangen oder im Spam gelandet, das passiert schnell.

Solange du nicht bestätigt hast, dass die Adresse dir gehört, kann ich dir die Aufzeichnung nicht schicken. Mit diesem Link machst du beides, du bestätigst und landest direkt beim Video:

${a('%%OPTIN%%', 'Aufzeichnung ansehen')}

Das ist meine letzte Mail an dich. Wenn du den Link nicht öffnest, hörst du nichts mehr von mir.

Viele Grüße
Alex`,
  },

  // Q1: bestätigt, Aufzeichnung noch nicht gestartet, 1 Tag nach der Bestätigung
  Q1: {
    subject: 'Wo du in der Aufzeichnung am besten einsteigst',
    preview: 'Du musst nicht alle 52 Minuten schauen. Ab Minute 8 wird es praktisch.',
    why: WHY_REPLAY,
    body: `${HI}

du hast dir die Aufzeichnung von meinem Shopify-Workshop geholt. Falls du noch nicht dazu gekommen bist: Du musst nicht alle 52 Minuten am Stück schauen. Unter dem Video stehen Kapitel, mit denen du direkt zu einer Stelle springst.

Die meisten fangen bei Minute 8 an. Ab da arbeite ich mit Claude Code an einem echten Shopify-Shop und lasse eine Section bauen, für die du sonst jeden Monat eine App bezahlen würdest. Danach sucht Claude in den Suchdaten nach Seiten, die knapp vor Seite 1 stehen. Am Live-Shop ändert sich dabei nichts, weil Claude nur an einer Kopie des Themes arbeitet.

${a(link('/replay', 'replay-q1'), 'Zur Aufzeichnung')}

Wenn dir beim Schauen eine Frage kommt, antworte einfach auf diese Mail. Ich lese alles selbst.

Viele Grüße
Alex`,
  },

  // Q3: immer noch nicht gestartet, 3 Tage nach Q1. Letzte Mail zur Aufzeichnung.
  Q3: {
    subject: 'Was Michael nach dem Workshop geschrieben hat',
    preview: 'Er verkauft Massagesessel und hatte vorher zehn verschiedene Entwickler und Berater.',
    why: WHY_REPLAY,
    body: `${HI}

du hattest dir die Aufzeichnung von meinem Shopify-Workshop geholt, bist aber wohl noch nicht dazu gekommen. Das ist meine letzte Mail dazu, danach erinnere ich dich nicht mehr an das Video.

Damit du einschätzen kannst, ob sich die Zeit für dich lohnt, hier ist, was Michael mir geschrieben hat. Er verkauft Massagesessel und hatte vorher zehn verschiedene Entwickler und Berater:

${MICHAEL}

${a(link('/replay', 'replay-q3'), 'Aufzeichnung ansehen')}

Ab Minute 8 arbeite ich mit Claude Code an einem echten Shop, am Ende stelle ich vorflows vor, das System, mit dem ich selbst arbeite.

Und falls KI für deinen Shop gerade kein Thema ist, ist das völlig okay. Dann kannst du dich unten austragen.

Viele Grüße
Alex`,
  },

  // RW: Liste 7 und Anforderer, Aufzeichnung gestartet, Angebot nicht erreicht.
  // Seit 2026-10-15 auf /sales statt zurück ins lange Video: am 15.10. kamen nur 2 von 9 Startern bis zum Angebot (37:23).
  RW: {
    subject: 'Das Wichtigste aus dem Workshop in fünf Minuten',
    preview: 'Falls dir die ganze Aufzeichnung zu lang war, hier ist alles Wichtige auf einer Seite.',
    why: WHY_LEAD,
    body: `${HI}

du hast in die Aufzeichnung vom Workshop reingeschaut, danke dafür. Das Video ist lang, und ich weiß, dass neben dem Shop selten Zeit für eine knappe Stunde am Stück bleibt. Deshalb habe ich dir hier noch einmal alles in Kürze zusammengestellt.

${a(link('/sales', 'replay-kurz'), 'Kurzfassung ansehen')}

Oben auf der Seite läuft ein Video von fünf Minuten mit den Stellen aus dem Workshop, auf die es ankommt. Darunter steht, wonach ich danach am häufigsten gefragt wurde: was genau im Ordner mit den 119 Fähigkeiten steckt, wie die Einrichtung abläuft und was das im Vergleich zu deinen Apps im Jahr kostet.

${SCARCITY_SALES}

Falls du lieber die ganze Aufzeichnung zu Ende schauen willst, öffne einfach den Link aus meiner ersten Mail noch einmal. Das Video läuft dann da weiter, wo du aufgehört hast.

Viele Grüße
Alex`,
  },

  P1: {
    subject: 'Was in deiner ersten Woche mit vorflows passiert',
    preview: 'Vom Setup-Call bis zur ersten App, die rausfliegt. So läuft das bei den meisten.',
    why: WHY_LEAD,
    body: `${HI}

{% if contact.RP_PITCH %}du hast dir die Aufzeichnung bis zum Angebot angesehen.{% else %}du hast dir vorflows angesehen.{% endif %} Damit du dir besser vorstellen kannst, wie das bei dir aussehen würde, beschreibe ich dir die erste Woche, so wie sie bei den meisten läuft.

Am Anfang steht der Setup-Call mit mir. Wir richten Claude Code zusammen ein und verbinden deinen Shop so, dass die KI nur an einer Kopie deines Themes arbeitet. Danach suchst du dir die erste App aus, die rausfliegen soll. Adrian, einer der ersten Nutzer, hat mir dazu geschrieben: „Hab innerhalb der ersten Stunde schon eine App ersetzt, für die ich monatlich zahle.“

In den Tagen danach schaut SEOFlow in deine Suchdaten und zeigt dir die Seiten, die knapp vor Seite 1 stehen, und ClarityFlow zeigt dir, wo Besucher ins Leere klicken oder abspringen. Du sagst Claude in normalen Worten, was passieren soll, und gibst das Ergebnis frei, wenn es dir gefällt.

Alles zum Angebot und wie viele Schulungsplätze noch frei sind, steht hier: ${a(link('/sales', 'bundle-p1', '#schulung'), 'vorflows ansehen')}

Wenn du wissen willst, ob das für deinen Shop passt, schreib mir einfach zwei Sätze zu deinem Shop zurück.

Viele Grüße
Alex`,
  },

  P2: {
    subject: 'Drei Shop-Betreiber über vorflows',
    preview: 'Und meine Antwort auf den Satz, den ich nach dem Workshop am häufigsten gelesen habe.',
    why: WHY_LEAD,
    body: `${HI}

heute lasse ich andere erzählen, die vorflows schon nutzen:

${STIMMEN}

Der Satz, den ich nach dem Workshop am häufigsten gelesen habe, ist übrigens: „Sieht stark aus, aber ich kann nicht coden.“ Musst du auch nicht. Du sagst der KI in normalen Worten, was du willst, zum Beispiel „Bau mir eine Free-Shipping-Bar“, und schreibst dabei keine Zeile Code. Weil Claude nur an einer Kopie deines Themes arbeitet, ändert sich an deinem Live-Shop erst etwas, wenn du selbst auf Veröffentlichen klickst.

${a(link('/sales', 'bundle-p2'), 'Zu vorflows')}

Viele Grüße
Alex`,
  },

  P3: {
    subject: 'Wie die 1:1-Schulung abläuft',
    preview: 'Du bist mit mir allein im Call. Zuerst schauen wir auf dein Setup, dann auf deinen Shop.',
    why: WHY_LEAD,
    body: `${HI}

zum Schluss noch zu dem Teil des Angebots, nach dem ich am häufigsten gefragt werde, der 1:1-Schulung.

Da bist du mit mir allein im Call, oder eine Person aus deinem Team. Zuerst prüfen wir, ob dein Setup sauber läuft. Danach gehen wir die Ideen durch, die in deinem Shop am meisten bringen. Rechne mit zwei bis drei Stunden, dazu kommt der Setup-Call am Anfang.

Weil ich das selbst mache, gibt es pro Monat nur 20 dieser Plätze. Wie viele davon gerade noch frei sind, siehst du auf der Seite. Dort steht auch der Preis, und wenn dir das auf einmal zu viel ist, kannst du beim Bezahlen Raten wählen.

${a(link('/sales', 'bundle-p3', '#schulung'), 'Freie Plätze ansehen')}

Wenn du unsicher bist, ob sich das für deinen Shop lohnt, schreib mir kurz zurück. Ich sag dir ehrlich, wenn es nicht passt.

Viele Grüße
Alex`,
  },

  KB: {
    subject: 'Hat beim Bezahlen etwas nicht geklappt',
    preview: 'Du warst schon auf der Bestellseite. Falls etwas gehakt hat, sag mir kurz Bescheid.',
    why: WHY_LEAD,
    body: `${HI}

du warst gestern schon auf der Bestellseite von vorflows, und dann ist die Bestellung nicht durchgegangen. Manchmal hakt da etwas, die Zahlart passt nicht oder es ist noch eine Frage offen.

Falls es am Preis lag: Beim Bezahlen kannst du auch Raten wählen. Und wenn dir noch etwas unklar ist, antworte einfach auf diese Mail. Ich lese das selbst und melde mich heute noch.

Wenn du es noch mal versuchen willst, geht es hier weiter: ${a(link('/sales', 'bundle-checkout'), 'Zu vorflows')}

Viele Grüße
Alex`,
  },

  KA: {
    subject: 'Hat bei AdsFlow etwas nicht geklappt',
    preview: 'Du warst schon auf der Bestellseite. Falls eine Frage offen ist, antworte einfach.',
    body: `${HI}

du warst gestern schon auf der Bestellseite von AdsFlow, und dann ist die Bestellung nicht durchgegangen. Falls dir noch etwas unklar ist, hier die Antworten auf das, was ich am häufigsten gefragt werde.

Du brauchst ein Claude-Konto mit Bezahl-Tarif, die kostenlose Claude-Desktop-App und dein Meta-Werbekonto. Die Einrichtung machst du zusammen mit Claude, du schreibst nur „Lies SETUP.md“. Und Claude legt jede Anzeige ausgeschaltet an, einschalten kannst nur du.

Wenn noch etwas offen ist, antworte einfach auf diese Mail. Sonst geht es hier weiter: ${a(link('/adsflow', 'adsflow-checkout'), 'Zu AdsFlow')}

Viele Grüße
Alex`,
  },

  // ── AdsFlow Welle 1: Käufer (Liste 5), nur Launch 2026 ──
  A1K: {
    subject: 'Was ich die letzten Wochen gebaut habe',
    preview: 'Es arbeitet wie vorflows, nur für deine Meta-Anzeigen. Weil du schon mit Claude arbeitest, zeige ich es dir zuerst.',
    why: WHY_BUYER,
    body: `${HI}

ich war ein paar Wochen ziemlich ruhig, und das hatte einen Grund. Ich habe etwas gebaut, das genauso arbeitet wie vorflows, nur für deine Meta-Anzeigen. Es heißt AdsFlow, und weil du schon mit Claude Code arbeitest, gehörst du zu den Ersten, denen ich es zeige.

${ADSFLOW_CORE('adsflow-a1-kunde')}

Da du Claude schon eingerichtet hast, bist du schneller startklar als die meisten.

%%SALE%%

Wenn du Fragen hast oder wissen willst, ob das für deinen Shop passt, antworte einfach auf diese Mail.

Viele Grüße
Alex`,
  },

  // ── AdsFlow Welle 1: live dabei, nicht gekauft (Liste 6), nur Launch 2026 ──
  A1G: {
    subject: 'Claude baut jetzt auch deine Meta-Anzeigen',
    preview: 'Du warst live dabei, als Claude den Shop umgebaut hat. Das hier ist das Gleiche für deine Anzeigen.',
    why: WHY_WORKSHOP,
    body: `${HI}

du warst im Workshop live dabei, als Claude einen Shopify-Shop umgebaut hat. Seitdem habe ich mich nicht mehr gemeldet, weil ich an etwas Neuem gesessen habe, das genauso funktioniert, nur für deine Meta-Anzeigen. Es heißt AdsFlow.

${ADSFLOW_CORE('adsflow-a1-live')}

%%SALE%%

Wenn du Fragen hast, antworte einfach auf diese Mail. Ich lese alles selbst.

Viele Grüße
Alex`,
  },

  A2: {
    subject: 'Warum seit Wochen dieselben Anzeigen laufen',
    preview: 'An den Ideen liegt es selten. Meistens kostet jede neue Anzeige einfach zu viel Zeit.',
    body: `${HI}

{% if contact.AF_VSL_START %}du hast dir das AdsFlow-Video schon angesehen, danke dafür. Eine Sache will ich dir noch zeigen, weil sie im Video schnell vorbeigeht.{% else %}eine Sache sehe ich in neun Jahren mit Meta-Anzeigen immer wieder: Es laufen viel zu wenige Anzeigen gleichzeitig.{% endif %}

Meta findet die Gewinner-Anzeige nur, wenn genug Anzeigen im Rennen sind. Die meisten Shops testen aber drei oder vier, weil jede neue im Ads Manager Arbeit macht. Bei jeder neuen Anzeige schaltet Meta außerdem Extras an, Musik unter dem Bild, Overlays, beschnittene Bilder, und bei mir waren sogar schon Sitelinks dabei, die aufs Impressum gezeigt haben. Bei 40 Anzeigen sitzt du eine Stunde nur am Ausschalten.

AdsFlow schaltet diese Extras bei jeder Anzeige ab, ohne dass du daran denken musst, und legt jede Anzeige im richtigen Format für Feed und Story an. Damit reicht ein Satz an Claude für eine ganze Testrunde. Mit diesem System sind schon über 1.200 Anzeigen entstanden.

${a(link('/adsflow', 'adsflow-a2'), '{% if contact.AF_VSL_START %}Zur AdsFlow-Seite{% else %}Die ersten fünf Minuten im Video ansehen{% endif %}')}

Viele Grüße
Alex`,
  },

  A3: {
    subject: 'Darf eine KI an dein Werbekonto',
    preview: 'Die Frage habe ich mir auch gestellt, bevor ich AdsFlow gebaut habe.',
    body: `${HI}

„Ich lasse doch keine KI an mein Werbekonto.“ Den Satz verstehe ich gut, ich hätte ihn vor einem Jahr auch gesagt. Deshalb habe ich AdsFlow so gebaut, dass du die Kontrolle nie abgibst.

Claude legt jede Anzeige ausgeschaltet an. Die Werkzeuge zum Einschalten und Ändern sind gesperrt, live schaltest also immer du selbst im Ads Manager. Die Verbindung läuft über einen sicheren Connector. Wenn du fragst „Wie laufen meine Ads?“, liest Claude die Zahlen nur und ändert nichts am Konto.

Was du brauchst, ist ein Claude-Konto mit Bezahl-Tarif, die kostenlose Claude-Desktop-App und dein Meta-Werbekonto. Die Einrichtung machst du zusammen mit Claude. Du öffnest den Ordner, schreibst „Lies SETUP.md“, und Claude führt dich Schritt für Schritt durch.

${a(link('/adsflow', 'adsflow-a3', '#faq'), 'Alle Fragen und Antworten zu AdsFlow')}

Wenn deine Frage da nicht dabei ist, schreib mir einfach zurück.

Viele Grüße
Alex`,
  },

  // K1: Bundle-Käufer (vor dem Launch), ersetzt A3 bzw. einmaliger letzter Versuch für Nicht-Öffner (Alex 2026-10-16).
  // Die Kunden-Käufe sind echt (16.10. Digistore + ein Kauf direkt bei Alex), ohne Namen. Nichts über sie erfinden.
  K1: {
    subject: 'AdsFlow für alle, die schon mit vorflows arbeiten',
    preview: 'Dein Claude-Konto ist schon eingerichtet. Damit fällt der größte Teil der Einrichtung weg.',
    why: WHY_BUYER,
    body: `${HI}

du arbeitest schon mit vorflows, deshalb schreibe ich dir zu AdsFlow noch einmal gesondert. Die ersten vorflows-Kunden haben sich AdsFlow schon dazugeholt, und ich glaube, dass es für viele von euch genauso gut passt.

Du kennst die Arbeitsweise ja schon. Du sagst Claude in normalen Worten, was passieren soll, und gibst das Ergebnis frei. Bei AdsFlow ist das genauso, nur für deine Meta-Anzeigen: Du schreibst „Neue Ads“, Claude schreibt die Texte, holt sich dein Okay und legt die Anzeigen im richtigen Format für Feed und Story in deinem Werbekonto an. Das Claude-Konto hast du schon, für die Einrichtung öffnest du den Ordner und schreibst „Lies SETUP.md“. Neu ist eigentlich nur die Verbindung zu deinem Werbekonto.

Falls du dich fragst, ob die KI dann an dein Werbekonto darf: Claude legt jede Anzeige ausgeschaltet an, live schaltest immer du selbst.

${a(link('/adsflow', 'adsflow-k1'), 'AdsFlow im Video ansehen')}

%%SALE%%

Wenn du wissen willst, ob sich das für deinen Shop lohnt, schreib mir kurz, wie du deine Anzeigen gerade baust. Ich sag dir ehrlich, ob AdsFlow dir Zeit spart.

Viele Grüße
Alex`,
  },

  A4: {
    subject: 'Was in dem AdsFlow-Ordner steckt',
    preview: 'Was ich in neun Jahren über Anzeigen gelernt habe, so aufgeschrieben, dass Claude danach arbeitet.',
    body: `${HI}

ich werde oft gefragt, was eigentlich in AdsFlow drin ist. Kurz gesagt steckt da alles drin, was ich in neun Jahren Online-Marketing über Anzeigen gelernt habe, so aufgeschrieben, dass Claude danach arbeitet.

Die Texte stützen sich auf Werbetexter wie Eugene Schwartz und David Ogilvy und gehen danach durch einen Filter, der die typischen KI-Formulierungen rauswirft. Claude prüft jede Anzeige, auch deine eigenen aus Canva oder vom Handy. Es liest die laufenden Anzeigen deiner Wettbewerber aus der Werbebibliothek und sammelt Kundenstimmen, weil die Worte deiner Kundschaft meistens die besten Einstiege sind. Läuft eine Anzeige gut, baut es Varianten, bei denen sich jeweils genau eine Sache ändert.

Und was dir nicht gefällt, sagst du einmal. Das landet als feste Regel im Ordner, und Claude macht denselben Fehler kein zweites Mal.

%%SALE%%

${a(link('/adsflow', 'adsflow-a4'), 'Den Ordner auf der Seite durchklicken')}

Viele Grüße
Alex`,
  },

  // ── AdsFlow Welle 2: Workshop-Anmeldungen ohne Kauf (Liste 7), nur Launch 2026 ──
  B1: {
    subject: 'Etwas Neues für deine Meta-Anzeigen',
    preview: 'Claude schreibt deine Meta-Anzeigen und legt sie fertig in deinem Werbekonto an. Live schaltest du selbst.',
    why: WHY_WORKSHOP,
    body: `${HI}

{% if contact.RP_PITCH %}du hast dir die Aufzeichnung vom Workshop bis zum Angebot angesehen, danke dafür. Ich habe in den letzten Wochen etwas Neues gebaut, das einen der wichtigsten Teile in jedem Onlineshop automatisiert, nämlich deine Meta-Anzeigen.{% elif contact.RP_START %}du hast in die Aufzeichnung vom Workshop reingeschaut. Heute geht es um etwas anderes, das ich in den letzten Wochen gebaut habe. Es arbeitet genauso mit Claude, nur für deine Meta-Anzeigen.{% else %}du hattest dich für meinen Workshop „KI + Shopify“ angemeldet. Heute habe ich etwas Neues für dich, an dem ich die letzten Wochen gesessen habe. Es arbeitet genauso mit Claude und nimmt dir einen der aufwendigsten Teile im Onlineshop ab, deine Meta-Anzeigen.{% endif %} Es heißt AdsFlow.

${ADSFLOW_CORE('adsflow-b1')}

%%SALE%%

Wenn du Fragen hast, antworte einfach auf diese Mail.

Viele Grüße
Alex`,
  },

  // ── AdsFlow für Anforderer der Aufzeichnung: zeitlos, ohne „neu“, ohne Datum ──
  C1: {
    subject: 'Ein zweites System, diesmal für deine Meta-Anzeigen',
    preview: 'Es arbeitet genauso mit Claude wie vorflows. Claude legt die Anzeigen an, live schaltest du selbst.',
    why: WHY_REPLAY,
    body: `${HI}

{% if contact.RP_PITCH %}du hast dir die Aufzeichnung vom Workshop bis zum Angebot angesehen, danke dafür. Neben{% else %}du hattest dir die Aufzeichnung von meinem Shopify-Workshop geholt. Neben{% endif %} vorflows habe ich noch ein zweites System gebaut, das genauso mit Claude arbeitet, nur für deine Meta-Anzeigen. Es heißt AdsFlow.

${ADSFLOW_CORE('adsflow-c1')}

%%SALE%%

Wenn du Fragen hast, antworte einfach auf diese Mail.

Viele Grüße
Alex`,
  },

  // Zweiter Versuch für Nicht-Öffner: gleicher Text, neuer Betreff. Text muss für sich stehen, nie auf die erste Mail
  // Bezug nehmen oder so tun, als kenne man AdsFlow schon (Alex 2026-10-13)
  A1KX: { from: 'A1K', subject: 'Ein Satz an Claude, 40 fertige Anzeigen', preview: 'So sieht das in meinem eigenen Werbekonto aus. Einschalten tust am Ende du.' },
  A1GX: { from: 'A1G', subject: 'Ein Satz an Claude, 40 fertige Anzeigen', preview: 'So sieht das in meinem eigenen Werbekonto aus. Einschalten tust am Ende du.' },
  B1X: { from: 'B1', subject: 'Ein Satz an Claude, 40 fertige Anzeigen', preview: 'So sieht das in meinem eigenen Werbekonto aus. Einschalten tust am Ende du.' },
  C1X: { from: 'C1', subject: 'Ein Satz an Claude, 40 fertige Anzeigen', preview: 'So sieht das in meinem eigenen Werbekonto aus. Einschalten tust am Ende du.' },

  // Upsell: Tag nach dem Bundle-Kauf (Alex 2026-10-11: frische Käufer sind am wärmsten)
  U1: {
    subject: 'Wenn du deine Anzeigen auch automatisieren willst',
    preview: 'Es arbeitet genauso mit Claude wie vorflows, nur für deine Meta-Anzeigen.',
    why: WHY_BUYER,
    body: `${HI}

danke, dass du dich für vorflows entschieden hast. Ich freue mich schon darauf, deinen Shop mit dir einzurichten.

Eine Sache wollte ich dir gleich zeigen, weil sie gut dazu passt: Wenn du deine Anzeigen auch automatisieren willst, gibt es AdsFlow. Es arbeitet genauso mit Claude wie vorflows, nur für deine Meta-Anzeigen. Du schreibst „Neue Ads“, Claude schreibt die Texte, holt sich dein Okay und legt die Anzeigen fertig in deinem Werbekonto an, im Feed quadratisch und in der Story hochkant, mit allen Meta-Extras auf aus. Eingeschaltet wird dabei nichts, live schaltest du selbst.

Weil du Claude Code für vorflows sowieso einrichtest, bist du damit schnell startklar. Im Video zeige ich dir das in meinem eigenen Werbekonto: ${a(link('/adsflow', 'adsflow-upsell'), 'AdsFlow im Video ansehen')}

%%SALE%%

Wenn du Fragen hast, zu vorflows oder zu AdsFlow, antworte einfach auf diese Mail.

Viele Grüße
Alex`,
  },

  // ── Deadline-Mails: nur am Ende eines Sales (AF_SALE.bis), Steuerung in mail-engine ──
  D0: {
    subject: 'Morgen endet der Launch-Preis für AdsFlow',
    preview: 'Bis Montag um Mitternacht gilt noch der Launch-Preis, danach der reguläre.',
    body: `${HI}

kurzer Hinweis, damit es dich nicht überrascht: Morgen, Montag um Mitternacht, endet der Launch-Preis für AdsFlow. Danach gilt der reguläre Preis, und ich verlängere das nicht noch einmal.

Falls du noch überlegst, ob sich das für dich lohnt, eine einfache Rechnung: Wenn dich eine neue Anzeige im Ads Manager eine halbe Stunde kostet, sind 40 Anzeigen zwanzig Stunden Arbeit. Mit AdsFlow schreibst du Claude einen Satz, gibst die Texte frei und schaltest die fertigen Anzeigen selbst live. Mit diesem System sind schon über 1.200 Anzeigen entstanden.

${a(link('/adsflow', 'adsflow-d0'), 'AdsFlow ansehen')}

Wenn noch eine Frage offen ist, antworte einfach auf diese Mail. Ich antworte dir vor Montagabend.

Viele Grüße
Alex`,
  },

  D1: {
    subject: 'Heute endet der Launch-Preis für AdsFlow',
    preview: 'Ab Mitternacht gilt der reguläre Preis. Hier noch mal kurz, worum es geht.',
    body: `${HI}

kurz zur Info: Heute um Mitternacht endet der Launch-Preis für AdsFlow. Danach gilt der reguläre Preis, der Launch ist dann vorbei, und ich verlängere ihn nicht noch einmal.

Falls du noch überlegst, hier noch mal kurz, wie es funktioniert. Du schreibst Claude einen Satz, und die fertigen Anzeigen liegen in deinem Werbekonto, mit Texten, den Formaten für Feed und Story und allen Meta-Extras auf aus. Claude legt alles ausgeschaltet an, live schaltest du selbst. Und was dir nicht gefällt, sagst du einmal, dann merkt Claude sich das.

${a(link('/adsflow', 'adsflow-d1'), 'Zu AdsFlow')}

Viele Grüße
Alex`,
  },

  D2: {
    subject: 'Noch ein paar Stunden',
    preview: 'Um Mitternacht endet der Launch-Preis für AdsFlow.',
    body: `${HI}

du hattest dir AdsFlow schon angesehen, deshalb nur eine kurze Erinnerung: Um Mitternacht endet der Launch-Preis.

${a(link('/adsflow', 'adsflow-d2'), 'Zu AdsFlow')}

Wenn dich noch eine Frage davon abhält, antworte einfach. Ich schaue heute Abend noch ins Postfach.

Viele Grüße
Alex`,
  },
};

const berlinDay = () => new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Berlin' }).format(new Date());
const escHtml = (s) => String(s).replace(/[&<>"]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));

// opts.T = Versandtag (für %%SALE%%). Für Einzelmails ohne Liquid (Q0): opts.vorname, opts.optin.
export function mailFor(key, opts = {}) {
  const m = MAILS[key];
  if (!m) throw new Error('unknown mail ' + key);
  const base = m.from ? { ...MAILS[m.from], subject: m.subject, preview: m.preview } : m;
  const T = opts.T || berlinDay();
  let body = base.body.replace(/%%SALE%%/g, T <= AF_SALE.bis ? AF_SALE.satz : '');
  if (body.includes('%%HI%%')) body = body.replace('%%HI%%', opts.vorname ? `Hey ${escHtml(opts.vorname)},` : 'Hey,');
  if (body.includes('%%OPTIN%%')) {
    if (!opts.optin) throw new Error('mail ' + key + ' braucht opts.optin');
    body = body.replace(/%%OPTIN%%/g, opts.optin);
  }
  const html = render({ ...base, body });
  return { key, subject: base.subject, preview: base.preview, html };
}
