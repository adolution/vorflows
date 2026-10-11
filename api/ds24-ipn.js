import crypto from 'node:crypto';

// Digistore24-IPN → Brevo. Doku: .agents/mail-engine.md
// URL in Digistore: https://vorflows.com/api/ds24-ipn?k=<hookKey('ds24')>
// Kauf: GEKAUFT, PRODUKTE, KAUF_DATUM setzen und Liste 5 (Bundle) bzw. 15 (AdsFlow).
// Damit stoppen die Verkaufsmails der Versand-Steuerung für Käufer.

const BREVO = 'https://api.brevo.com/v3';
const PRODUCTS = {
  688983: { name: 'Vorflows Bundle', list: 5 },
  690701: { name: 'AdsFlow', list: 15 },
};

export const hookKey = (name, secret) =>
  crypto.createHmac('sha256', secret).update('hook:' + name).digest('base64url').slice(0, 24);

const readForm = async (req) => {
  if (req.body && typeof req.body === 'object') return req.body;
  const chunks = [];
  for await (const c of req) chunks.push(c);
  const raw = Buffer.concat(chunks).toString('utf8');
  return Object.fromEntries(new URLSearchParams(raw));
};

const today = () => new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Berlin' }).format(new Date());

export default async function handler(req, res) {
  const SECRET = process.env.VF_TRACK_SECRET;
  const KEY = process.env.BREVO_API_KEY;
  const url = new URL(req.url, 'https://vorflows.com');
  if (!SECRET || !KEY || url.searchParams.get('k') !== hookKey('ds24', SECRET)) return res.status(401).send('unauthorized');
  if (req.method !== 'POST') return res.status(200).send('OK');

  const f = await readForm(req);
  const event = String(f.event || '');
  const email = String(f.email || f.address_email || '').trim().toLowerCase();
  const pid = Number(f.product_id || 0);
  console.log('ds24-ipn', JSON.stringify({ event, pid, order: f.order_id, hasEmail: !!email }));
  if (event === 'connection_test' || !email) return res.status(200).send('OK');

  const product = PRODUCTS[pid];
  const headers = { 'api-key': KEY, 'content-type': 'application/json', accept: 'application/json' };
  try {
    let current = {};
    const g = await fetch(`${BREVO}/contacts/${encodeURIComponent(email)}`, { headers });
    if (g.ok) current = (await g.json()).attributes || {};

    if (event === 'on_payment' && product) {
      const have = String(current.PRODUKTE || '');
      const produkte = have.includes(product.name) ? have : [have, product.name].filter(Boolean).join(', ');
      const attributes = { GEKAUFT: true, PRODUKTE: produkte, KAUF_DATUM: current.KAUF_DATUM ? String(current.KAUF_DATUM).slice(0, 10) : today() };
      if (f.first_name && !current.VORNAME) attributes.VORNAME = String(f.first_name).slice(0, 60);
      const r = await fetch(`${BREVO}/contacts`, {
        method: 'POST', headers,
        body: JSON.stringify({ email, attributes, listIds: [product.list], updateEnabled: true }),
      });
      console.log('ds24-ipn brevo', r.status, product.name);
    } else if (['on_refund', 'on_chargeback'].includes(event)) {
      await fetch(`${BREVO}/contacts/${encodeURIComponent(email)}`, {
        method: 'PUT', headers, body: JSON.stringify({ attributes: { ERSTATTET: true } }),
      });
    }
  } catch (e) {
    console.log('ds24-ipn error', String(e && e.message));
  }
  return res.status(200).send('OK');
}
