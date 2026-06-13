// POST /api/lw-survey — Survey-Antworten der Workshop-Danke-Seite
// (danke-live-workshop.html) inkl. Ad-Attribution dauerhaft sichern.
//
// Sinks:
// 1. Vercel-Log (immer): eine JSON-Zeile pro Lead, Prefix "lw-survey".
// 2. Webhook (optional): env LW_SURVEY_WEBHOOK = beliebige URL, die den
//    Datensatz als JSON-POST entgegennimmt. Empfohlen: Google-Sheets-
//    Apps-Script-Webhook → jede Anmeldung wird eine Tabellenzeile.
//    Setup-Anleitung: .agents/live-workshop-tracking.md
// Ohne Webhook: 200 + stored:false (UX nie blockieren).

const readBody = async (req) => {
  if (req.body && typeof req.body === 'object') return req.body;
  const chunks = [];
  for await (const c of req) chunks.push(c);
  const raw = Buffer.concat(chunks).toString('utf8') || '{}';
  try { return JSON.parse(raw); } catch { return {}; }
};

const clean = (v, max = 250) => {
  if (v === undefined || v === null) return undefined;
  const s = String(v).trim();
  return s ? s.slice(0, max) : undefined;
};

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'method_not_allowed' });

  const body = await readBody(req);
  const answers = body.answers || {};
  const attr = body.attribution || {};

  const record = {
    submitted_at: new Date().toISOString(),
    survey_id: clean(body.survey_id, 64) || '',
    status: clean(body.status, 16) || 'complete',
    email: clean(body.email) || '',
    first_name: clean(body.first_name) || '',
    phone: clean(body.phone, 32) || '',
    shop: clean(body.shop, 250) || '',
    revenue: clean(answers.revenue, 32) || '',
    app_costs: clean(answers.apps, 32) || '',
    builder: clean(answers.builder, 32) || '',
    focus: clean(answers.focus, 32) || '',
    phone_optin: !!answers.phone_optin,
    score: Number(body.score) || 0,
    qualified: !!body.qualified,
    variant: clean(body.variant, 4) || '',
    utm_source: clean(attr.utm_source) || '',
    utm_medium: clean(attr.utm_medium) || '',
    utm_campaign: clean(attr.utm_campaign) || '',
    utm_content: clean(attr.utm_content) || '',
    utm_term: clean(attr.utm_term) || '',
    fbclid: attr.fbclid ? true : false,
    landed_at: clean(attr.landed_at, 40) || '',
  };

  // Immer loggen — Vercel-Logs als Backup-Sink.
  console.log('lw-survey', JSON.stringify(record));

  const WEBHOOK = process.env.LW_SURVEY_WEBHOOK;
  if (!WEBHOOK) return res.status(200).json({ ok: true, stored: false, reason: 'webhook_not_configured' });

  try {
    const r = await fetch(WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(record),
      redirect: 'follow', // Apps-Script-Webhooks antworten mit 302
    });
    if (!r.ok) {
      console.error('lw-survey webhook error', r.status, (await r.text()).slice(0, 300));
      return res.status(200).json({ ok: true, stored: false, reason: 'webhook_error' });
    }
    return res.status(200).json({ ok: true, stored: true });
  } catch (err) {
    console.error('lw-survey exception', String(err));
    return res.status(200).json({ ok: true, stored: false, reason: 'fetch_failed' });
  }
}
