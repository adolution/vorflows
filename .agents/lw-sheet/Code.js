// LW Leads — Webhook für /api/lw-survey (vorflows Live-Workshop)
// Web-App: doPost nimmt JSON entgegen und macht UPSERT per survey_id:
//  - neue survey_id  → neue Zeile (auch bei Teil-Antworten, status=partial)
//  - bekannte id     → bestehende Zeile aktualisieren (status wird zu complete,
//                       wenn die Survey fertig ist). submitted_at bleibt erhalten.
// So landet JEDER Abspringer im Sheet, ohne 5 Zeilen pro Person zu erzeugen.
//
// WICHTIG: neue Spalten NUR ANS ENDE hängen (bestehende Spaltenpositionen
// dürfen sich nie verschieben — sonst rutschen Altdaten in falsche Spalten).
const HEADERS = ['submitted_at','email','first_name','phone','revenue','app_costs','builder','focus',
  'phone_optin','score','qualified','variant','utm_source','utm_medium',
  'utm_campaign','utm_content','utm_term','fbclid','landed_at',
  // ── ab 2026-06-13 angehängt ──
  'survey_id','status','shop','last_update'];

function ensureHeaders(sheet) {
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
    sheet.setFrozenRows(1);
    return;
  }
  // Kopfzeile mit HEADERS abgleichen (deckt das Nachrüsten neuer End-Spalten ab).
  const cur = sheet.getRange(1, 1, 1, HEADERS.length).getValues()[0];
  let diff = false;
  for (let i = 0; i < HEADERS.length; i++) { if (cur[i] !== HEADERS[i]) { diff = true; break; } }
  if (diff) {
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000); // parallele Teil-Pushes derselben Person serialisieren
  try {
    const d = JSON.parse(e.postData.contents);
    d.last_update = new Date().toISOString();
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
    ensureHeaders(sheet);

    const fmt = (h) => {
      const v = d[h] !== undefined && d[h] !== null ? d[h] : '';
      return h === 'phone' && v ? "'" + v : v; // Apostroph = als Text, sonst frisst Sheets das +
    };

    // Bestehende Zeile mit gleicher survey_id suchen.
    const id = d.survey_id || '';
    let rowIdx = 0;
    if (id) {
      const idCol = HEADERS.indexOf('survey_id') + 1;
      const last = sheet.getLastRow();
      if (last >= 2) {
        const ids = sheet.getRange(2, idCol, last - 1, 1).getValues();
        for (let i = 0; i < ids.length; i++) {
          if (ids[i][0] === id) { rowIdx = i + 2; break; }
        }
      }
    }

    if (rowIdx) {
      // Update: submitted_at (Erst-Kontakt) erhalten, Rest überschreiben.
      const orig = sheet.getRange(rowIdx, 1, 1, HEADERS.length).getValues()[0];
      const row = HEADERS.map((h, i) => h === 'submitted_at' ? orig[i] : fmt(h));
      sheet.getRange(rowIdx, 1, 1, HEADERS.length).setValues([row]);
    } else {
      sheet.appendRow(HEADERS.map(fmt));
    }
    return ContentService.createTextOutput('ok');
  } finally {
    lock.releaseLock();
  }
}

// Einmal manuell ausführen → Google fragt nach Berechtigung (Autorisierung).
// Schreibt Header + eine Testzeile.
function authorizeOnce() {
  // Sheet umbenennen, damit es von den alten leeren Duplikaten unterscheidbar ist
  SpreadsheetApp.getActiveSpreadsheet().rename('LW Leads — Workshop');
  doPost({ postData: { contents: JSON.stringify({
    submitted_at: new Date().toISOString(), survey_id: 's_setup', status: 'complete',
    email: 'setup-test@vorflows.com', first_name: 'Setup', shop: 'beispiel-shop.de',
    revenue: '5to20k', app_costs: '150to400',
    builder: 'selbst', focus: 'seo', phone_optin: true, score: 7,
    qualified: true, variant: 'A', utm_source: 'setup',
    utm_campaign: 'setup-test', utm_content: 'setup-test'
  }) } });
}
