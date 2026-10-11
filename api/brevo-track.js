import crypto from 'node:crypto';

// Verhaltens-Tagging für Brevo. Doku: .agents/brevo-tracking.md
// Browser schickt {vt, ev, d}. vt = "<brevo-contact-id>.<hmac>" aus dem Feld VF_TOKEN,
// kommt nur über Mail-Links (?vt={{ contact.VF_TOKEN }}). Ohne gültiges vt passiert nichts.

const LIST = {
  replayStart: 9,
  replayPitch: 10,
  bundleCheckout: 11,
  afVisit: 12,
  afVideo: 13,
  afCheckout: 14,
};

const BREVO = 'https://api.brevo.com/v3';

const sign = (id, secret) =>
  crypto.createHmac('sha256', secret).update(String(id)).digest('base64url').slice(0, 12);

const verify = (vt, secret) => {
  const m = /^(\d{1,12})\.([A-Za-z0-9_-]{12})$/.exec(String(vt || ''));
  if (!m) return null;
  const a = Buffer.from(sign(m[1], secret));
  const b = Buffer.from(m[2]);
  return a.length === b.length && crypto.timingSafeEqual(a, b) ? m[1] : null;
};

const today = () => new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Berlin' }).format(new Date());

const readBody = async (req) => {
  if (req.body && typeof req.body === 'object') return req.body;
  const chunks = [];
  for await (const c of req) chunks.push(c);
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}'); } catch { return {}; }
};

// Ereignis → gewünschte Änderungen. first = nur setzen, wenn leer; max = nur höher; set = immer.
function plan(ev, d, page) {
  const p = { first: {}, max: {}, set: {}, inc: {}, lists: [] };
  const pct = Math.max(0, Math.min(100, Number(d.pct) || 0));
  switch (ev) {
    case 'page':
      if (page === 'replay') p.first.RP_VISIT = 1;
      if (page === 'sales') p.first.SALES_VISIT = 1;
      if (page === 'adsflow') { p.first.AF_VISIT = 1; p.set.AF_LAST = 1; p.inc.AF_VISITS = 1; p.lists.push(LIST.afVisit); }
      break;
    case 'LW_Replay_Play':
      p.first.RP_START = 1; p.lists.push(LIST.replayStart); break;
    case 'LW_Replay_Progress':
      p.first.RP_START = 1; p.max.RP_PCT = pct; p.lists.push(LIST.replayStart); break;
    case 'LW_Replay_Offer':
      p.first.RP_PITCH = 1; p.lists.push(LIST.replayPitch); break;
    case 'InitiateCheckout':
      if (page === 'replay') { p.first.RP_CHECKOUT = 1; p.lists.push(LIST.bundleCheckout); }
      if (page === 'adsflow') { p.first.AF_CHECKOUT = 1; p.lists.push(LIST.afCheckout); }
      break;
    case 'digistore_redirect':
      if (page === 'sales') { p.first.SALES_CHECKOUT = 1; p.lists.push(LIST.bundleCheckout); }
      break;
    case 'sales_video_pct':
      p.max.SALES_VSL_PCT = pct; break;
    case 'AF_VSL_Play':
      p.first.AF_VSL_START = 1; p.lists.push(LIST.afVideo); break;
    case 'AF_VSL_Progress':
      p.first.AF_VSL_START = 1; p.max.AF_VSL_PCT = pct; p.lists.push(LIST.afVideo); break;
    case 'Lead':
      if (page === 'adsflow') p.first.AF_AGENCY = 1;
      break;
    default:
      return null;
  }
  return p;
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).end();

  const KEY = process.env.BREVO_API_KEY;
  const SECRET = process.env.VF_TRACK_SECRET;
  if (!KEY || !SECRET) return res.status(500).json({ error: 'not_configured' });

  const body = await readBody(req);
  const id = verify(body.vt, SECRET);
  if (!id) return res.status(204).end();

  const page = ['replay', 'sales', 'adsflow'].includes(body.page) ? body.page : '';
  const p = plan(String(body.ev || ''), body.d && typeof body.d === 'object' ? body.d : {}, page);
  if (!p) return res.status(204).end();

  const headers = { 'api-key': KEY, 'content-type': 'application/json', accept: 'application/json' };
  try {
    const r = await fetch(`${BREVO}/contacts/${id}?identifierType=contact_id`, { headers });
    if (!r.ok) return res.status(204).end();
    const c = await r.json();
    const cur = c.attributes || {};
    const day = today();
    const attrs = {};

    for (const k of Object.keys(p.first)) if (!cur[k]) attrs[k] = day;
    for (const k of Object.keys(p.set)) if (cur[k] !== day) attrs[k] = day;
    for (const [k, v] of Object.entries(p.max)) if (v > (Number(cur[k]) || 0)) attrs[k] = v;
    for (const [k, v] of Object.entries(p.inc)) attrs[k] = (Number(cur[k]) || 0) + v;
    if (cur.LAST_SEEN !== day) attrs.LAST_SEEN = day;

    const have = new Set(c.listIds || []);
    const listIds = p.lists.filter((l) => !have.has(l));

    if (Object.keys(attrs).length || listIds.length) {
      const put = { attributes: attrs };
      if (listIds.length) put.listIds = listIds;
      const u = await fetch(`${BREVO}/contacts/${id}?identifierType=contact_id`, {
        method: 'PUT', headers, body: JSON.stringify(put),
      });
      console.log('brevo-track', JSON.stringify({ id, ev: body.ev, page, attrs, listIds, status: u.status }));
    }
    return res.status(204).end();
  } catch (e) {
    console.log('brevo-track error', String(e && e.message));
    return res.status(204).end();
  }
}

export { sign, verify, plan };
