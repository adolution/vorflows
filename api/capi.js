import crypto from 'node:crypto';

const sha256 = (v) => {
  if (v === undefined || v === null || v === '') return null;
  return crypto.createHash('sha256').update(String(v).trim().toLowerCase()).digest('hex');
};

const hashPhone = (phone) => {
  if (!phone) return null;
  const digits = String(phone).replace(/\D/g, '');
  if (!digits) return null;
  return crypto.createHash('sha256').update(digits).digest('hex');
};

const parseCookies = (str) => {
  const out = {};
  String(str || '').split(';').forEach((p) => {
    const i = p.indexOf('=');
    if (i < 0) return;
    out[p.slice(0, i).trim()] = decodeURIComponent(p.slice(i + 1).trim());
  });
  return out;
};

const readBody = async (req) => {
  if (req.body && typeof req.body === 'object') return req.body;
  const chunks = [];
  for await (const c of req) chunks.push(c);
  const raw = Buffer.concat(chunks).toString('utf8') || '{}';
  try { return JSON.parse(raw); } catch { return {}; }
};

const safeDecode = (v) => {
  if (!v) return '';
  try { return decodeURIComponent(String(v)); } catch { return String(v); }
};

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'method_not_allowed' });

  const PIXEL_ID = process.env.META_PIXEL_ID;
  const TOKEN = process.env.META_CAPI_TOKEN;
  const TEST_CODE = process.env.META_TEST_EVENT_CODE;
  if (!PIXEL_ID || !TOKEN) return res.status(500).json({ error: 'capi_not_configured' });

  const body = await readBody(req);
  const {
    event_name,
    event_id,
    event_source_url,
    custom_data,
    user_data: ud_in = {},
  } = body;
  if (!event_name || !event_id) return res.status(400).json({ error: 'missing_event_name_or_id' });

  const fwd = (req.headers['x-forwarded-for'] || '').toString().split(',')[0].trim();
  const ip = fwd || req.socket?.remoteAddress || '';
  const ua = req.headers['user-agent'] || '';
  const cookies = parseCookies(req.headers.cookie);

  // Geo from Vercel edge headers
  const geoCountry = (req.headers['x-vercel-ip-country'] || ud_in.country || '').toString();
  const geoRegion  = (req.headers['x-vercel-ip-country-region'] || '').toString();
  const geoCity    = safeDecode(req.headers['x-vercel-ip-city']);
  const geoPostal  = (req.headers['x-vercel-ip-postal-code'] || '').toString();

  const user_data = {
    client_ip_address: ip,
    client_user_agent: ua,
  };

  // First-party cookies
  if (cookies._fbp) user_data.fbp = cookies._fbp;
  if (cookies._fbc) user_data.fbc = cookies._fbc;

  // Hashed PII (Meta expects arrays for em/ph, scalar for the rest)
  const em = sha256(ud_in.email);
  if (em) user_data.em = [em];
  const ph = hashPhone(ud_in.phone);
  if (ph) user_data.ph = [ph];
  const fn = sha256(ud_in.first_name);
  if (fn) user_data.fn = [fn];
  const ln = sha256(ud_in.last_name);
  if (ln) user_data.ln = [ln];

  // Identifiers + Geo (hashed)
  const ext = sha256(ud_in.external_id);
  if (ext) user_data.external_id = [ext];
  const ct = sha256(geoCity);
  if (ct) user_data.ct = [ct];
  const st = sha256(geoRegion);
  if (st) user_data.st = [st];
  const zp = sha256(geoPostal);
  if (zp) user_data.zp = [zp];
  const country = sha256(geoCountry);
  if (country) user_data.country = [country];

  const payload = {
    data: [{
      event_name,
      event_time: Math.floor(Date.now() / 1000),
      event_id,
      action_source: 'website',
      event_source_url: event_source_url || req.headers.referer || '',
      user_data,
      custom_data: custom_data || {},
    }],
  };
  if (TEST_CODE) payload.test_event_code = TEST_CODE;

  try {
    const r = await fetch(
      `https://graph.facebook.com/v19.0/${PIXEL_ID}/events?access_token=${encodeURIComponent(TOKEN)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      },
    );
    const data = await r.json();
    if (!r.ok) {
      console.error('capi error', data);
      return res.status(502).json({ error: 'graph_api_error', detail: data });
    }
    return res.status(200).json({ ok: true, fb: data });
  } catch (err) {
    console.error('capi exception', err);
    return res.status(500).json({ error: 'fetch_failed', detail: String(err) });
  }
}
