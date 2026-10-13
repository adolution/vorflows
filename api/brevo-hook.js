import { hookKey } from './ds24-ipn.js';

// Brevo-Marketing-Webhook (opened, click) → Feld MAIL_OPEN = heute. Doku: .agents/mail-engine.md
// Die Versand-Steuerung nutzt MAIL_OPEN, um Nicht-Öffner nur kurz anzuschreiben.

const BREVO = 'https://api.brevo.com/v3';
const today = () => new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Berlin' }).format(new Date());

const readBody = async (req) => {
  if (req.body && typeof req.body === 'object') return req.body;
  const chunks = [];
  for await (const c of req) chunks.push(c);
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}'); } catch { return {}; }
};

export default async function handler(req, res) {
  const SECRET = process.env.VF_TRACK_SECRET;
  const KEY = process.env.BREVO_API_KEY;
  const url = new URL(req.url, 'https://vorflows.com');
  if (!SECRET || !KEY || url.searchParams.get('k') !== hookKey('brevo', SECRET)) return res.status(401).end();
  if (req.method !== 'POST') return res.status(200).end();

  const body = await readBody(req);
  const items = Array.isArray(body) ? body : [body];
  for (const ev of items) {
    const email = String(ev.email || '').trim().toLowerCase();
    // proxy_open = Apple Mail Privacy Protection: öffnet automatisch, ohne dass jemand liest. Zählt nicht,
    // sonst bekämen echte Nicht-Leser nie die zweite Mail (Alex 2026-10-13).
    if (!email || !['opened', 'click', 'unique_opened'].includes(ev.event)) continue;
    try {
      await fetch(`${BREVO}/contacts/${encodeURIComponent(email)}`, {
        method: 'PUT',
        headers: { 'api-key': KEY, 'content-type': 'application/json' },
        body: JSON.stringify({ attributes: { MAIL_OPEN: today() } }),
      });
    } catch (e) {
      console.log('brevo-hook error', String(e && e.message));
    }
  }
  return res.status(200).end();
}
