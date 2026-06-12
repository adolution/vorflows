// LW Leads — Webhook für /api/lw-survey (vorflows Live-Workshop)
// Web-App: doPost nimmt JSON entgegen, hängt eine Zeile ans Sheet.
// Header-Zeile legt sich beim ersten Lead selbst an.
const HEADERS = ['submitted_at','email','first_name','phone','revenue','app_costs','builder','focus',
  'phone_optin','score','qualified','variant','utm_source','utm_medium',
  'utm_campaign','utm_content','utm_term','fbclid','landed_at'];

function doPost(e) {
  const d = JSON.parse(e.postData.contents);
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  sheet.appendRow(HEADERS.map(h => {
    const v = d[h] !== undefined ? d[h] : '';
    return h === 'phone' && v ? "'" + v : v; // Apostroph = als Text, sonst frisst Sheets das +
  }));
  return ContentService.createTextOutput('ok');
}

// Einmal manuell ausführen → Google fragt nach Berechtigung (Autorisierung).
// Schreibt Header + eine Testzeile.
function authorizeOnce() {
  // Sheet umbenennen, damit es von den alten leeren Duplikaten unterscheidbar ist
  SpreadsheetApp.getActiveSpreadsheet().rename('LW Leads — Workshop');
  doPost({ postData: { contents: JSON.stringify({
    submitted_at: new Date().toISOString(), email: 'setup-test@vorflows.com',
    first_name: 'Setup', revenue: '5to20k', app_costs: '150to400',
    builder: 'selbst', focus: 'seo', phone_optin: true, score: 7,
    qualified: true, variant: 'A', utm_source: 'setup',
    utm_campaign: 'setup-test', utm_content: 'setup-test'
  }) } });
}
