// POST /api/adsflow-agency — Agentur-Anfragen von /adsflow (Qualifizierungs-Formular).
//
// Sinks:
// 1. Vercel-Log (immer): eine JSON-Zeile pro Anfrage, Prefix "adsflow-agency".
// 2. Webhook: env ADSFLOW_AGENCY_WEBHOOK = Apps-Script-Web-App aus
//    .agents/adsflow-agency-sheet/ → Zeile im Sheet "AdsFlow Agentur-Anfragen" + Mail an Alex.
//    env ADSFLOW_AGENCY_SECRET muss zum SHARED_SECRET im Script passen (sonst lehnt es ab).
// Ohne Webhook: 200 + stored:false (UX nie blockieren, Log ist das Backup).
//
// Schutz (Doku: .agents/adsflow-page.md, Abschnitt Sicherheit):
// - nur POST mit JSON, max. 4 KB Body
// - Origin muss vorflows.com sein (Browser schicken ihn immer mit)
// - Honeypot-Feld + Zeitfalle (Formular schneller als 3 s ausgefüllt = Bot): stilles 200, nichts gespeichert
// - einfaches Rate-Limit pro IP und Instanz (5 Anfragen / 10 min)
// - alle Felder gekürzt, Formel-Präfixe (= + - @) entfernt, Auswahlfelder nur aus fester Liste

const ALLOWED_ORIGINS = new Set([
  'https://vorflows.com',
  'https://www.vorflows.com',
]);
const MAX_BODY = 4096;
const RATE = { windowMs: 10 * 60 * 1000, max: 5 };
const hits = new Map(); // ip -> [timestamps]; lebt nur so lange wie die Serverless-Instanz

const CLIENTS = ['1-5', '6-15', '16-40', '40+'];
const SPEND = ['<10k', '10-50k', '50-200k', '200k+'];

const readBody = async (req) => {
  if (req.body && typeof req.body === 'object') return req.body;
  const chunks = [];
  let size = 0;
  for await (const c of req) {
    size += c.length;
    if (size > MAX_BODY) return null;
    chunks.push(c);
  }
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}'); } catch { return {}; }
};

// Kürzt und entfernt Steuerzeichen + führende Formel-Zeichen: die Werte landen in einem
// Google Sheet und in einer Mail, UTM-Parameter sind fremdgesteuert.
const clean = (v, max = 120) => {
  if (v === undefined || v === null || typeof v === 'object') return '';
  return String(v).replace(/[\u0000-\u001f\u007f]/g, ' ').trim().replace(/^[=+\-@]+/, '').slice(0, max);
};
const cleanPhone = (v) => String(v || '').replace(/[^\d+ ()\/-]/g, '').trim().slice(0, 32);
const pick = (v, list) => (list.includes(v) ? v : '');

const rateLimited = (ip) => {
  const now = Date.now();
  const arr = (hits.get(ip) || []).filter((t) => now - t < RATE.windowMs);
  arr.push(now);
  hits.set(ip, arr);
  if (hits.size > 5000) hits.clear(); // Speicher begrenzen
  return arr.length > RATE.max;
};

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  if (req.method !== 'POST') return res.status(405).json({ error: 'method_not_allowed' });

  const origin = req.headers.origin || '';
  if (!ALLOWED_ORIGINS.has(origin) && !(process.env.VERCEL_ENV !== 'production' && /^http:\/\/localhost(:\d+)?$/.test(origin))) {
    return res.status(403).json({ error: 'forbidden' });
  }
  if (!String(req.headers['content-type'] || '').includes('application/json')) {
    return res.status(415).json({ error: 'unsupported_media_type' });
  }
  if (Number(req.headers['content-length'] || 0) > MAX_BODY) return res.status(413).json({ error: 'too_large' });

  const ip = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown';
  if (rateLimited(ip)) return res.status(429).json({ error: 'too_many_requests' });

  const body = await readBody(req);
  if (body === null) return res.status(413).json({ error: 'too_large' });

  // Bot-Fallen: Honeypot gefüllt oder in unter 3 s ausgefüllt → so tun als ob, nichts speichern.
  if (clean(body.website) || (Number(body.t) > 0 && Number(body.t) < 3000)) {
    console.log('adsflow-agency bot', JSON.stringify({ ip, t: body.t }));
    return res.status(200).json({ ok: true });
  }

  const email = clean(body.email, 200).toLowerCase();
  if (!/^[^\s@"'<>,;]+@[^\s@"'<>,;]+\.[a-z]{2,}$/i.test(email)) return res.status(400).json({ error: 'invalid_email' });

  const attr = body.attribution && typeof body.attribution === 'object' ? body.attribution : {};
  const clients = pick(body.clients, CLIENTS);
  const spend = pick(body.spend, SPEND);

  const record = {
    submitted_at: new Date().toISOString(),
    email,
    phone: cleanPhone(body.phone),
    clients,
    spend,
    // grobe Vorqualifizierung: ab 6 Kunden oder ab 10k Spend lohnt sich ein Gespräch
    qualified: CLIENTS.indexOf(clients) >= 1 || SPEND.indexOf(spend) >= 1,
    page: 'adsflow',
    utm_source: clean(attr.utm_source),
    utm_medium: clean(attr.utm_medium),
    utm_campaign: clean(attr.utm_campaign),
    utm_content: clean(attr.utm_content),
    utm_term: clean(attr.utm_term),
    fbclid: attr.fbclid ? true : false,
    landed_at: clean(attr.landed_at, 40),
  };

  console.log('adsflow-agency', JSON.stringify(record));

  const WEBHOOK = process.env.ADSFLOW_AGENCY_WEBHOOK;
  if (!WEBHOOK) return res.status(200).json({ ok: true, stored: false });

  try {
    const r = await fetch(WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...record, secret: process.env.ADSFLOW_AGENCY_SECRET || '' }),
      redirect: 'follow', // Apps-Script-Webhooks antworten mit 302
    });
    const text = (await r.text()).slice(0, 200);
    if (!r.ok || text.trim() !== 'ok') {
      console.error('adsflow-agency webhook error', r.status, text);
      return res.status(200).json({ ok: true, stored: false });
    }
    return res.status(200).json({ ok: true, stored: true });
  } catch (err) {
    console.error('adsflow-agency exception', String(err));
    return res.status(200).json({ ok: true, stored: false });
  }
}
