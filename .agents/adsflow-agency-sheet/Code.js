// AdsFlow Agentur-Anfragen — Webhook für /api/adsflow-agency (vorflows.com/adsflow)
// Web-App: doPost nimmt JSON entgegen, hängt eine Zeile ans Sheet und schickt
// eine Benachrichtigung per Mail an Alex.
//
// Sicherheit:
// - SHARED_SECRET steht in secret.js (gitignored, wird nur per clasp zu Google
//   hochgeladen, liegt NIE im Repo und damit nie öffentlich auf vorflows.com).
//   Derselbe Wert steht in Vercel als ADSFLOW_AGENCY_SECRET. Ohne passenden
//   Wert wird jede Anfrage abgelehnt (fail closed).
// - Jede Zelle, die wie eine Formel beginnt, wird als Text geschrieben.
// - Mail-Drossel: dieselbe Adresse höchstens 1 Mail pro 30 min, insgesamt
//   höchstens 20 Mails pro Stunde (Zeilen im Sheet entstehen trotzdem).
// - Mail ist reiner Text, Werte ohne Links/Steuerzeichen.
//
// Neue Spalten NUR ANS ENDE hängen (Altdaten sonst in falschen Spalten).
const HEADERS = ['submitted_at', 'email', 'phone', 'clients', 'spend', 'qualified', 'page',
  'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'fbclid', 'landed_at'];
const NOTIFY = 'alex@adolution.de';
const LABEL = {
  clients: { '1-5': '1 bis 5', '6-15': '6 bis 15', '16-40': '16 bis 40', '40+': 'mehr als 40' },
  spend: { '<10k': 'unter 10.000 €', '10-50k': '10.000 bis 50.000 €', '50-200k': '50.000 bis 200.000 €', '200k+': 'mehr als 200.000 €' },
};

function sheet_() {
  const sh = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  if (sh.getLastRow() === 0) {
    sh.appendRow(HEADERS);
    sh.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
    sh.setFrozenRows(1);
  }
  return sh;
}

// Für Mail-Text: nur harmlose Zeichen, keine Links, kurz.
function plain_(v, max) {
  return String(v == null ? '' : v).replace(/https?:\/\/\S+/gi, '[link]').replace(/[^\w@.+\-() €äöüÄÖÜß\/]/g, '').slice(0, max || 80);
}

function mailAllowed_(email) {
  const cache = CacheService.getScriptCache();
  const key = 'm_' + Utilities.base64EncodeWebSafe(email).slice(0, 200);
  if (cache.get(key)) return false;
  const hourKey = 'h_' + Utilities.formatDate(new Date(), 'Etc/UTC', 'yyyyMMddHH');
  const n = Number(cache.get(hourKey) || 0);
  if (n >= 20) return false;
  cache.put(key, '1', 1800);
  cache.put(hourKey, String(n + 1), 3700);
  return true;
}

function doPost(e) {
  let d;
  try { d = JSON.parse(e.postData.contents); } catch (err) { return ContentService.createTextOutput('bad_request'); }
  const secret = typeof SHARED_SECRET !== 'undefined' ? SHARED_SECRET : '';
  if (!secret || d.secret !== secret) return ContentService.createTextOutput('forbidden');
  if (!/^[^\s@"'<>,;]+@[^\s@"'<>,;]+\.[a-z]{2,}$/i.test(String(d.email || ''))) return ContentService.createTextOutput('bad_request');

  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    // Text, der wie eine Formel beginnt (=, +, -, @, Tab, CR), mit Apostroph als Text
    // schreiben (Formel-Injection über fremdgesteuerte UTM-Werte). Telefon immer als Text.
    const row = HEADERS.map(function (h) {
      const v = d[h] !== undefined && d[h] !== null ? d[h] : '';
      if (typeof v === 'string' && v && (h === 'phone' || /^[=+\-@\t\r]/.test(v))) return "'" + v;
      return v;
    });
    sheet_().appendRow(row);
  } finally {
    lock.releaseLock();
  }

  if (mailAllowed_(String(d.email))) {
    const c = LABEL.clients[d.clients] || '-';
    const s = LABEL.spend[d.spend] || '-';
    const body = [
      'Neue Agentur-Anfrage über vorflows.com/adsflow',
      '',
      'E-Mail: ' + plain_(d.email, 200),
      'Telefon: ' + (plain_(d.phone, 32) || '-'),
      'Kunden mit Meta Ads: ' + c,
      'Werbebudget im Monat: ' + s,
      'Vorqualifiziert: ' + (d.qualified ? 'ja' : 'nein'),
      '',
      'Quelle: ' + [plain_(d.utm_source, 40), plain_(d.utm_campaign, 60), plain_(d.utm_content, 60)].filter(String).join(' / '),
      '',
      'Alle Anfragen: ' + SpreadsheetApp.getActiveSpreadsheet().getUrl(),
    ].join('\n');
    MailApp.sendEmail({
      to: NOTIFY,
      replyTo: String(d.email),
      subject: 'AdsFlow Agency: neue Anfrage (' + c + ' Kunden, ' + s + ')',
      body: body,
    });
  }
  return ContentService.createTextOutput('ok');
}

// Einmal manuell im Editor ausführen → Google fragt nach Berechtigung
// (Sheet, Mail, Cache). Schreibt eine Testzeile und schickt eine Test-Mail.
function authorizeOnce() {
  SpreadsheetApp.getActiveSpreadsheet().rename('AdsFlow Agentur-Anfragen');
  doPost({ postData: { contents: JSON.stringify({
    secret: typeof SHARED_SECRET !== 'undefined' ? SHARED_SECRET : '',
    submitted_at: new Date().toISOString(), email: 'setup-test@vorflows.com', phone: '',
    clients: '6-15', spend: '10-50k', qualified: true, page: 'adsflow', utm_source: 'setup',
  }) } });
}
