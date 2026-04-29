import crypto from 'node:crypto';

const sha256 = (v) =>
  crypto.createHash('sha256').update(String(v).trim().toLowerCase()).digest('hex');

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

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'method_not_allowed' });

  const PIXEL_ID = process.env.META_PIXEL_ID;
  const TOKEN = process.env.META_CAPI_TOKEN;
  const TEST_CODE = process.env.META_TEST_EVENT_CODE;
  if (!PIXEL_ID || !TOKEN) return res.status(500).json({ error: 'capi_not_configured' });

  const body = await readBody(req);
  const { event_name, event_id, email, event_source_url, custom_data } = body;
  if (!event_name || !event_id) return res.status(400).json({ error: 'missing_event_name_or_id' });

  const fwd = (req.headers['x-forwarded-for'] || '').toString().split(',')[0].trim();
  const ip = fwd || req.socket?.remoteAddress || '';
  const ua = req.headers['user-agent'] || '';
  const cookies = parseCookies(req.headers.cookie);

  const user_data = { client_ip_address: ip, client_user_agent: ua };
  if (email) user_data.em = [sha256(email)];
  if (cookies._fbp) user_data.fbp = cookies._fbp;
  if (cookies._fbc) user_data.fbc = cookies._fbc;

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
