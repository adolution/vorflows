// Alle Mails der Replay-, Bundle- und AdsFlow-Strecke. Doku: .agents/mail-engine.md
// Regeln: keine Gedankenstriche, keine Preise/Beträge im Text (Gmail-Werbetab, Alex 2026-10-13), ein Link-Ziel pro Mail,
// nur vorflows.com, Fußzeile nur mit Abmelde-Link (keine Impressum-/Datenschutz-Links),
// Betreff ohne Ausrufezeichen/€/%. Personalisierung über Brevo-Liquid ({{ contact.X }}).

const link = (path, campaign, hash = '') =>
  `https://vorflows.com${path}?vt={{ contact.VF_TOKEN }}&utm_source=brevo&utm_medium=email&utm_campaign=${campaign}${hash}`;

const a = (href, text) =>
  `<a href="${href}" style="color:#1a1a1a;font-weight:600;text-decoration:underline;">${text}</a>`;

const HI = 'Hey{% if contact.VORNAME %} {{ contact.VORNAME }}{% endif %},';

const WHY_WORKSHOP = 'Du bekommst diese Mail, weil du dich für den Workshop „KI + Shopify“ von vorflows angemeldet hast.';
const WHY_BUYER = 'Du bekommst diese Mail, weil du vorflows gekauft hast.';
const WHY_AUTO = '{% if contact.GEKAUFT %}' + WHY_BUYER + '{% else %}' + WHY_WORKSHOP + '{% endif %}';

export function render({ subject, preview, body, why = WHY_AUTO }) {
  const paras = body.trim().split(/\n\s*\n/).map((p) => {
    p = p.trim();
    if (p.startsWith('<')) return p;
    return `<p style="margin:0 0 16px;">${p.replace(/\n/g, '<br>')}</p>`;
  }).join('\n');
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
<p style="margin:16px 0 0;padding-top:16px;border-top:1px solid #e5e5e5;font-size:12px;line-height:1.5;color:#777777;">${why} <a href="{{ unsubscribe }}" style="color:#777777;">Abmelden</a><br>AMD Media GmbH, c/o Pioneers Club, Ritterstraße 8, 33602 Bielefeld</p>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}

// ── Bausteine ────────────────────────────────────────────────────────────

const SCARCITY_REPLAY = `Zum Angebot am Ende gehört eine 1:1-Schulung mit mir an deinem Shop, und davon kann ich nur wenige geben. Wer die Aufzeichnung zuerst schaut und zugreift, bekommt den Platz. Gerade ist noch etwas frei, das kann sich aber bald ändern. Wie viele Plätze es noch gibt, siehst du auf der Seite, sobald im Video das Angebot kommt.`;

const ADSFLOW_CORE = (c) => `Ich weiß ja nicht, wie es bei dir aussieht, aber bei den meisten Shops laufen seit Wochen dieselben drei Anzeigen. Nicht, weil die Ideen fehlen, sondern weil jede neue Anzeige im Ads Manager eine halbe Stunde kostet. Und Meta schaltet bei jeder neuen Anzeige Extras an, die keiner bestellt hat, von Musik unter dem Bild bis zu abgeschnittenen Produkten.

AdsFlow ist ein Ordner, den du in Claude öffnest. Du schreibst „Neue Ads“, Claude schreibt die Texte, holt sich dein Okay und legt die Anzeigen fertig in deinem Werbekonto an, im Feed quadratisch und in der Story hochkant, mit UTM-Parametern und mit allen Meta-Extras auf aus. Eingeschaltet wird dabei nichts. Live schaltest du selbst, Claude hat dafür keine Berechtigung.

Im Video zeige ich dir das in meinem eigenen Werbekonto. Nach fünf Minuten siehst du die fertigen Anzeigen, danach kommen die Details: ${a(link('/adsflow', c), 'AdsFlow im Video ansehen')}`;

const STIMMEN = `<p style="margin:0 0 16px;padding-left:14px;border-left:3px solid #e5e5e5;">„Als ich das im Workshop gesehen habe, war ich skeptisch, ob das wirklich so klappt. Aber jetzt kann ich nur sagen: wow, wow, wow. Ich hatte bisher Agenturen und Freelancer, irgendwie zehn unterschiedliche Entwickler und Berater, und ich muss sagen: die sind alle schlechter. Dein Tool ist gnadenlos gut.“<br><span style="color:#555555;">Michael Bodeske, Massagesesselwelt.de</span></p>
<p style="margin:0 0 16px;padding-left:14px;border-left:3px solid #e5e5e5;">„Wir hatten schon mit KI gearbeitet. Aber erst seit dem Setup von Alex merken wir, wie ineffizient wir vorher waren und wie viel schneller und vor allem zuverlässiger es geht.“<br><span style="color:#555555;">Leo, Pure U</span></p>
<p style="margin:0 0 16px;padding-left:14px;border-left:3px solid #e5e5e5;">„Alles schnell eingerichtet und sofort SEO- und Conversion-Optimierungen erkannt und umgesetzt. Genau, was ich mir vorgestellt hab.“<br><span style="color:#555555;">Stefan Kisker, Prometheus GmbH</span></p>`;

// ── Mails ────────────────────────────────────────────────────────────────

export const MAILS = {
  // Replay 1 an Liste 7 (ohne Liste 17), verschickt von der Versand-Steuerung ab 13.10.
  R1: {
    subject: 'Shopify + KI: Die Aufzeichnung ist online',
    preview: 'Hat länger gedauert als gedacht. Wenn du wenig Zeit hast, starte bei Minute 8.',
    why: WHY_WORKSHOP,
    body: `${HI}

du hattest dich für meinen Workshop „KI + Shopify“ angemeldet, und danach haben mich einige nach der Aufzeichnung gefragt. Das hat länger gedauert, als ich gedacht hatte, sorry dafür. Ich habe sie noch mal geschnitten und Kapitel eingebaut, damit du nicht 52 Minuten am Stück schauen musst.

Hier ist sie: ${a(link('/replay', 'replay-1'), 'Aufzeichnung ansehen')}

Wenn du wenig Zeit hast, starte bei Minute 8. Ab da arbeite ich mit Claude Code an einem echten Shopify-Shop. Die KI baut eine Section, für die du sonst eine App bezahlen würdest, und sucht in den Suchdaten nach Seiten, die knapp vor Seite 1 stehen. Der Live-Shop bleibt dabei unberührt, weil sie an einer Kopie des Themes arbeitet.

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

du hattest dich für meinen Workshop „KI + Shopify“ angemeldet. Falls du live nicht dabei sein konntest oder dir das Ganze noch mal in Ruhe ansehen willst: Die Aufzeichnung ist jetzt online. Ich habe sie geschnitten und Kapitel eingebaut, damit du direkt zu den Stellen springen kannst, die dich interessieren.

${a(link('/replay', 'replay-1-sheet'), 'Aufzeichnung ansehen')}

Kurz, worum es geht: Ich arbeite mit Claude Code an einem echten Shopify-Shop. Die KI baut eine Section, für die du sonst jeden Monat eine App bezahlen würdest, und sucht in den Suchdaten nach Seiten, die knapp vor Seite 1 stehen. Der Live-Shop bleibt dabei unberührt, weil sie an einer Kopie des Themes arbeitet. Wenn du wenig Zeit hast, starte bei Minute 8.

Am Ende stelle ich vorflows vor, das System, mit dem ich selbst arbeite. ${SCARCITY_REPLAY}

Falls bei deiner Anmeldung damals etwas schiefgelaufen ist und du gar keinen Zugang bekommen hattest, tut mir das leid. Antworte einfach auf diese Mail, wenn du Fragen hast. Ich lese alles selbst.

Viele Grüße
Alex

PS: Wenn Automatisierungen und Dinge mit KI bauen gerade nicht dein Thema sind, kannst du dich ganz unten austragen. Nehm ich dir nicht übel.`,
  },

  R2: {
    subject: 'Die Aufzeichnung ist noch online',
    preview: 'Mit Kapiteln zum Springen, damit du nicht 52 Minuten am Stück schauen musst.',
    why: WHY_WORKSHOP,
    body: `${HI}

du hattest dich für meinen Workshop „KI + Shopify“ angemeldet. Die Aufzeichnung ist online, und du kannst sie dir in Ruhe ansehen.

${a(link('/replay', 'replay-2'), 'Zur Aufzeichnung')}

Du musst nicht alles am Stück schauen. Unter dem Video springen die Kapitel direkt zu den Stellen, die dich interessieren: wie Claude eine Section baut, für die du sonst jeden Monat eine App bezahlst, wie es in den Suchdaten Seiten findet, die knapp vor Seite 1 stehen, und warum dein Live-Shop dabei nie angefasst wird.

Ein Hinweis noch, weil mich das ein paar Leute gefragt haben: Das Angebot gibt es am Ende des Videos, und die 1:1-Schulung, die dazugehört, kann ich nur wenigen geben. Wer zuerst schaut, hat die besseren Chancen auf einen Platz.

Viele Grüße
Alex`,
  },

  R3: {
    subject: 'Was Michael nach dem Workshop geschrieben hat',
    preview: 'Er war skeptisch, ob das wirklich so klappt. Hier ist, was er danach gesagt hat.',
    why: WHY_WORKSHOP,
    body: `${HI}

nach dem Workshop hat mir Michael geschrieben. Er verkauft Massagesessel und hatte vorher, wie er sagt, zehn verschiedene Entwickler und Berater.

${STIMMEN.split('\n')[0]}

Falls du die Aufzeichnung noch nicht angefangen hast, das ist der Workshop, um den es ging: ${a(link('/replay', 'replay-3'), 'Aufzeichnung ansehen')}

Ab Minute 8 arbeite ich live mit Claude Code an einem echten Shop. Am Ende kommt das Angebot, und weil die 1:1-Schulung dazugehört, gibt es dafür nur wenige Plätze. Gerade ist noch etwas frei. Wie viele es genau sind, siehst du auf der Seite, sobald das Angebot im Video kommt.

Und falls Automatisierungen und Dinge mit KI bauen gerade nicht dein Thema sind, ist das völlig okay. Dann kannst du dich unten austragen.

Viele Grüße
Alex`,
  },

  RW: {
    subject: 'Da, wo du aufgehört hast',
    preview: 'Die Aufzeichnung merkt sich deine Stelle. Danach kommt der Teil, nach dem die meisten fragen.',
    why: WHY_WORKSHOP,
    body: `${HI}

du hast in die Aufzeichnung vom Workshop reingeschaut, danke dafür. Wenn du die Seite im selben Browser wieder öffnest, geht es da weiter, wo du aufgehört hast.

${a(link('/replay', 'replay-weiter'), 'Weiterschauen')}

Im hinteren Teil kommt das, wonach mich nach dem Workshop die meisten gefragt haben: was genau im Ordner mit den 119 Fähigkeiten steckt, wie die Einrichtung abläuft und was das im Vergleich zu deinen Apps im Jahr kostet. Danach stelle ich das Angebot vor.

${SCARCITY_REPLAY}

Viele Grüße
Alex`,
  },

  P1: {
    subject: 'Was in deiner ersten Woche mit vorflows passiert',
    preview: 'Kein Kurs, den du dir irgendwann anschaust, sondern Änderungen, die in deinem Shop landen.',
    why: WHY_WORKSHOP,
    body: `${HI}

du hast dir die Aufzeichnung bis zum Angebot angesehen. Damit du dir besser vorstellen kannst, wie das bei dir aussehen würde, hier die erste Woche, so wie sie bei den meisten läuft.

Am Anfang steht der Setup-Call mit mir. Wir richten Claude Code zusammen ein und verbinden deinen Shop so, dass die KI nur an einer Kopie deines Themes arbeitet. Danach suchst du dir die erste App aus, die rausfliegen soll. Adrian, einer der ersten Nutzer, hat das so beschrieben: „Hab innerhalb der ersten Stunde schon eine App ersetzt, für die ich monatlich zahle.“

In den Tagen danach schaut SEOFlow in deine Suchdaten und zeigt dir die Seiten, die knapp vor Seite 1 stehen, und ClarityFlow zeigt dir, wo Besucher ins Leere klicken oder abspringen. Du sagst Claude in normalen Worten, was passieren soll, und gibst das Ergebnis frei, wenn es dir gefällt.

Alles zum Angebot und wie viele Schulungsplätze noch frei sind, steht hier: ${a(link('/sales', 'bundle-p1', '#schulung'), 'vorflows ansehen')}

Wenn du wissen willst, ob das für deinen Shop passt, antworte mir einfach mit zwei Sätzen zu deinem Shop.

Viele Grüße
Alex`,
  },

  P2: {
    subject: 'Drei Shop-Betreiber über vorflows',
    preview: 'Und die Antwort auf den Satz, den ich nach dem Workshop am häufigsten gelesen habe.',
    why: WHY_WORKSHOP,
    body: `${HI}

heute lasse ich andere sprechen, die vorflows schon nutzen:

${STIMMEN}

Der Satz, den ich nach dem Workshop am häufigsten gelesen habe, ist übrigens: „Sieht stark aus, aber ich kann nicht coden.“ Musst du auch nicht. Du schreibst keine Zeile Code, sondern sagst der KI in normalen Worten, was du willst, zum Beispiel „Bau mir eine Free-Shipping-Bar“. Und weil Claude nur an einer Kopie deines Themes arbeitet, ändert sich an deinem Live-Shop erst etwas, wenn du selbst auf Veröffentlichen klickst.

${a(link('/sales', 'bundle-p2'), 'Zu vorflows')}

Viele Grüße
Alex`,
  },

  P3: {
    subject: 'Wie die 1:1-Schulung abläuft',
    preview: 'Kein Gruppencall. Erst schauen wir auf dein Setup, dann auf die Ideen für deinen Shop.',
    why: WHY_WORKSHOP,
    body: `${HI}

zum Schluss noch zu dem Teil des Angebots, nach dem mich am meisten gefragt wird: die 1:1-Schulung.

Das ist kein Gruppencall. Du bist mit mir allein im Call, oder eine Person aus deinem Team. Zuerst prüfen wir, ob dein Setup sauber läuft. Danach gehen wir die Ideen durch, die in deinem Shop am meisten bringen. Rechne mit zwei bis drei Stunden, dazu kommt der Setup-Call am Anfang.

Weil ich das selbst mache, gibt es pro Monat nur 20 dieser Plätze, und für diesen Monat sind nur noch wenige frei. Wie viele genau, siehst du auf der Seite. Dort steht auch der Preis, und wenn dir das auf einmal zu viel ist, kannst du beim Bezahlen Raten wählen.

${a(link('/sales', 'bundle-p3', '#schulung'), 'Freie Plätze ansehen')}

Wenn du unsicher bist, ob sich das für deinen Shop lohnt, schreib mir kurz zurück. Ich sag dir ehrlich, wenn es nicht passt.

Viele Grüße
Alex`,
  },

  KB: {
    subject: 'Hat beim Bezahlen etwas nicht geklappt',
    preview: 'Du warst schon auf der Bestellseite. Falls etwas gehakt hat, sag mir kurz Bescheid.',
    why: WHY_WORKSHOP,
    body: `${HI}

du warst gestern schon auf der Bestellseite von vorflows, und dann ist die Bestellung nicht durchgegangen. Manchmal hakt da etwas, die Zahlart passt nicht oder es ist noch eine Frage offen.

Falls es am Preis lag: Beim Bezahlen kannst du auch Raten wählen. Und falls dir noch etwas unklar ist, antworte einfach auf diese Mail. Ich lese das selbst und melde mich heute noch.

Wenn du es noch mal versuchen willst, geht es hier weiter: ${a(link('/sales', 'bundle-checkout'), 'Zu vorflows')}

Viele Grüße
Alex`,
  },

  KA: {
    subject: 'Hat bei AdsFlow etwas nicht geklappt',
    preview: 'Du warst schon auf der Bestellseite. Falls eine Frage offen ist, antworte einfach.',
    body: `${HI}

du warst gestern schon auf der Bestellseite von AdsFlow, und dann ist die Bestellung nicht durchgegangen. Falls dir noch etwas unklar ist, hier die Fragen, die ich am häufigsten bekomme:

Du brauchst ein Claude-Konto mit Bezahl-Tarif, die kostenlose Claude-Desktop-App und dein Meta-Werbekonto. Die Einrichtung macht Claude mit dir zusammen, du schreibst nur „Lies SETUP.md“. Und Claude legt jede Anzeige ausgeschaltet an. Einschalten kannst nur du.

Wenn noch etwas offen ist, antworte einfach auf diese Mail. Sonst geht es hier weiter: ${a(link('/adsflow', 'adsflow-checkout'), 'Zu AdsFlow')}

Viele Grüße
Alex`,
  },

  // ── AdsFlow Welle 1: Käufer (Liste 5) ──
  A1K: {
    subject: 'Was ich die letzten Wochen gebaut habe',
    preview: 'Es arbeitet wie vorflows, nur für deine Meta-Anzeigen. Du bist einer der Ersten, die es sehen.',
    why: WHY_BUYER,
    body: `${HI}

ich war ein paar Wochen ziemlich ruhig, und das hatte einen Grund. Ich habe etwas gebaut, das genauso arbeitet wie vorflows, nur für deine Meta-Anzeigen. Es heißt AdsFlow, und weil du schon mit Claude Code arbeitest, bist du einer der Ersten, denen ich es zeige.

${ADSFLOW_CORE('adsflow-a1-kunde')}

Da du Claude schon eingerichtet hast, bist du schneller startklar als die meisten. Der Launch-Preis gilt noch bis Montag, 2. November.

Wenn du Fragen hast oder wissen willst, ob das für deinen Shop passt, antworte einfach auf diese Mail.

Viele Grüße
Alex`,
  },

  // ── AdsFlow Welle 1: live dabei, nicht gekauft (Liste 6) ──
  A1G: {
    subject: 'Claude baut jetzt auch deine Meta-Anzeigen',
    preview: 'Du warst live dabei, als Claude den Shop umgebaut hat. Das hier ist das Gleiche für deine Anzeigen.',
    why: WHY_WORKSHOP,
    body: `${HI}

du warst im Workshop live dabei, als Claude einen Shopify-Shop umgebaut hat. Seitdem habe ich mich nicht mehr gemeldet, weil ich an etwas Neuem gesessen habe, das genauso funktioniert, nur für deine Meta-Anzeigen. Es heißt AdsFlow.

${ADSFLOW_CORE('adsflow-a1-live')}

AdsFlow automatisiert einen der wichtigsten Teile jedes E-Commerce-Business: deine Werbeanzeigen. Der Launch-Preis gilt noch bis Montag, 2. November.

Wenn du Fragen hast, antworte einfach auf diese Mail. Ich lese alles selbst.

Viele Grüße
Alex`,
  },

  A2: {
    subject: 'Warum seit Wochen dieselben Anzeigen laufen',
    preview: 'Es liegt selten an den Ideen. Meistens liegt es am Ads Manager.',
    body: `${HI}

{% if contact.AF_VSL_START %}du hast dir das AdsFlow-Video schon angesehen, danke dafür. Ich will dir heute nur noch eine Sache zeigen, die im Video schnell vorbeigeht.{% else %}eine Sache, die ich in neun Jahren mit Meta-Anzeigen immer wieder sehe: Es laufen viel zu wenige Anzeigen gleichzeitig.{% endif %}

Meta findet die Gewinner-Anzeige nur, wenn genug Anzeigen im Rennen sind. Die meisten Shops testen aber drei oder vier, weil jede neue im Ads Manager Arbeit macht. Bei jeder neuen Anzeige schaltet Meta außerdem Extras an: Musik unter dem Bild, Overlays, beschnittene Bilder, und bei mir waren sogar schon Sitelinks dabei, die aufs Impressum gezeigt haben. Bei 40 Anzeigen sitzt du eine Stunde nur am Ausschalten.

AdsFlow schaltet diese Extras bei jeder Anzeige ab, ohne dass du daran denken musst, und legt jede Anzeige im richtigen Format für Feed und Story an. Damit wird aus einem Satz an Claude eine ganze Testrunde. Mit diesem System sind schon über 1.200 Anzeigen entstanden.

${a(link('/adsflow', 'adsflow-a2'), '{% if contact.AF_VSL_START %}Zur AdsFlow-Seite{% else %}Die ersten fünf Minuten im Video ansehen{% endif %}')}

Viele Grüße
Alex`,
  },

  A3: {
    subject: 'Darf eine KI an dein Werbekonto',
    preview: 'Die Frage habe ich mir auch gestellt. So habe ich AdsFlow deshalb gebaut.',
    body: `${HI}

„Ich lasse doch keine KI an mein Werbekonto.“ Diesen Satz verstehe ich gut, ich hätte ihn vor einem Jahr auch gesagt. Deshalb ist AdsFlow so gebaut, dass du die Kontrolle nie abgibst:

Claude legt jede Anzeige ausgeschaltet an. Die Werkzeuge zum Einschalten und Ändern sind gesperrt, live schaltest also immer du selbst im Ads Manager. Die Verbindung läuft über einen sicheren Connector. Wenn du fragst „Wie laufen meine Ads?“, liest Claude die Zahlen nur und ändert nichts am Konto.

Was du brauchst: ein Claude-Konto mit Bezahl-Tarif, die kostenlose Claude-Desktop-App und dein Meta-Werbekonto. Die Einrichtung macht Claude mit dir zusammen. Du öffnest den Ordner, schreibst „Lies SETUP.md“, und Claude führt dich Schritt für Schritt durch.

${a(link('/adsflow', 'adsflow-a3', '#faq'), 'Alle Fragen und Antworten zu AdsFlow')}

Wenn deine Frage da nicht beantwortet ist, schreib mir einfach zurück.

Viele Grüße
Alex`,
  },

  A4: {
    subject: 'Was in dem AdsFlow-Ordner steckt',
    preview: 'Alles, was ich in neun Jahren über Anzeigen gelernt habe, in einem Ordner für Claude.',
    body: `${HI}

ich werde oft gefragt, was eigentlich in AdsFlow drin ist. Kurz gesagt: alles, was ich in neun Jahren Online-Marketing über Anzeigen gelernt habe, so aufgeschrieben, dass Claude danach arbeitet.

Die Texte stützen sich auf Werbetexter wie Eugene Schwartz und David Ogilvy und gehen danach durch einen Filter, der die typischen KI-Muster rauswirft. Claude prüft jede Anzeige, auch deine eigenen aus Canva oder vom Handy. Es liest die laufenden Anzeigen deiner Wettbewerber aus der Werbebibliothek und sammelt Kundenstimmen, weil die Worte deiner Kundschaft meistens die besten Einstiege sind. Läuft eine Anzeige gut, baut es Varianten mit jeweils genau einer Änderung.

Und was dir nicht gefällt, sagst du einmal. Das landet als feste Regel im Ordner, und Claude macht denselben Fehler kein zweites Mal.

Der Launch-Preis gilt noch bis Montag, 2. November: ${a(link('/adsflow', 'adsflow-a4'), 'Den Ordner auf der Seite durchklicken')}

Viele Grüße
Alex`,
  },

  // ── AdsFlow Welle 2: Workshop-Anmeldungen ohne Kauf (Liste 7) ──
  B1: {
    subject: 'Etwas Neues für deine Meta-Anzeigen',
    preview: 'Claude schreibt deine Meta-Anzeigen und legt sie fertig in deinem Werbekonto an. Live schaltest du selbst.',
    why: WHY_WORKSHOP,
    body: `${HI}

{% if contact.RP_PITCH %}du hast dir die Aufzeichnung vom Workshop bis zum Angebot angesehen, danke dafür. Ich habe in den letzten Wochen etwas Neues gebaut, das einen der wichtigsten Teile jedes E-Commerce-Business automatisiert: deine Meta-Anzeigen.{% elif contact.RP_START %}du hast in die Aufzeichnung vom Workshop reingeschaut. Heute geht es um etwas anderes, das ich in den letzten Wochen gebaut habe und das genauso mit Claude arbeitet, nur für deine Meta-Anzeigen.{% else %}du hattest dich für meinen Workshop „KI + Shopify“ angemeldet. Heute habe ich etwas Neues für dich, das ich in den letzten Wochen gebaut habe. Es arbeitet genauso mit Claude und automatisiert einen der wichtigsten Teile jedes E-Commerce-Business: deine Meta-Anzeigen.{% endif %} Es heißt AdsFlow.

${ADSFLOW_CORE('adsflow-b1')}

Der Launch-Preis für AdsFlow gilt noch bis Montag, 2. November.

Wenn du Fragen hast, antworte einfach auf diese Mail.

Viele Grüße
Alex`,
  },

  // Zweiter Versuch für Nicht-Öffner: gleicher Text, neuer Betreff. Text muss für sich stehen, nie auf die erste Mail
  // Bezug nehmen oder so tun, als kenne man AdsFlow schon (Alex 2026-10-13)
  A1KX: { from: 'A1K', subject: 'Ein Satz an Claude, 40 fertige Anzeigen', preview: 'So sieht das in meinem eigenen Werbekonto aus. Eingeschaltet wird nichts ohne dich.' },
  A1GX: { from: 'A1G', subject: 'Ein Satz an Claude, 40 fertige Anzeigen', preview: 'So sieht das in meinem eigenen Werbekonto aus. Eingeschaltet wird nichts ohne dich.' },
  B1X: { from: 'B1', subject: 'Ein Satz an Claude, 40 fertige Anzeigen', preview: 'So sieht das in meinem eigenen Werbekonto aus. Eingeschaltet wird nichts ohne dich.' },

  // Upsell: Tag nach dem Bundle-Kauf (Alex 2026-10-11: frische Käufer sind am wärmsten)
  U1: {
    subject: 'Wenn du deine Anzeigen auch automatisieren willst',
    preview: 'Es arbeitet genauso mit Claude wie vorflows, nur für deine Meta-Anzeigen.',
    why: WHY_BUYER,
    body: `${HI}

danke, dass du dich für vorflows entschieden hast. Ich freue mich schon darauf, deinen Shop mit dir einzurichten.

Eine Sache wollte ich dir gleich zeigen, weil sie gut dazu passt: Wenn du deine Anzeigen auch automatisieren willst, gibt es AdsFlow. Es arbeitet genauso mit Claude wie vorflows, nur für deine Meta-Anzeigen. Du schreibst „Neue Ads“, Claude schreibt die Texte, holt sich dein Okay und legt die Anzeigen fertig in deinem Werbekonto an, im Feed quadratisch und in der Story hochkant, mit allen Meta-Extras auf aus. Eingeschaltet wird dabei nichts, live schaltest du selbst.

Weil du Claude Code mit vorflows sowieso einrichtest, bist du damit schnell startklar. Im Video zeige ich dir das in meinem eigenen Werbekonto: ${a(link('/adsflow', 'adsflow-upsell'), 'AdsFlow im Video ansehen')}

Der Launch-Preis für AdsFlow gilt noch bis Montag, 2. November.

Wenn du Fragen hast, zu vorflows oder zu AdsFlow, antworte einfach auf diese Mail.

Viele Grüße
Alex`,
  },

  D0: {
    subject: 'Morgen endet der Launch-Preis für AdsFlow',
    preview: 'Bis Montag um Mitternacht gilt noch der Launch-Preis. Danach nicht mehr, auch nicht verlängert.',
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
    preview: 'Ab Mitternacht kostet AdsFlow den regulären Preis. Hier die kurze Version, worum es geht.',
    body: `${HI}

kurz zur Info: Heute um Mitternacht endet der Launch-Preis für AdsFlow. Danach gilt der reguläre Preis. Das ist keine künstliche Deadline, der Launch ist dann einfach vorbei, und ich verlängere ihn nicht noch einmal.

Falls du noch überlegst, hier die kurze Version:

Du schreibst Claude einen Satz, und die fertigen Anzeigen liegen in deinem Werbekonto, mit Texten, Formaten für Feed und Story und allen Meta-Extras auf aus.<br>Claude legt alles ausgeschaltet an, live schaltest du selbst.<br>Was dir nicht gefällt, sagst du einmal, und Claude merkt es sich.

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

export function mailFor(key) {
  const m = MAILS[key];
  if (!m) throw new Error('unknown mail ' + key);
  const base = m.from ? { ...MAILS[m.from], subject: m.subject, preview: m.preview } : m;
  return { key, subject: base.subject, preview: base.preview, html: render(base) };
}
