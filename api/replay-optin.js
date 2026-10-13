import crypto from 'node:crypto';
import { sign } from './brevo-track.js';

// Replay-Anmeldung auf /live-workshop. Doku: .agents/live-workshop-tracking.md §10
// POST {email, vorname, hp, attr} → Kontakt in Brevo (neu: Liste „unbestätigt“), dann eine schlichte
// Einzelmail mit dem Link zur Aufzeichnung. Der Link ist zugleich die Bestätigung (Double-Opt-in):
// GET ?c=<id>.<hmac> → Liste „bestätigt“, RP_OPTIN_OK, VF_TOKEN setzen → weiter auf /replay?vt=…
// Nachfass (Q0 Erinnerung, Q1/Q3, RW, P1-P3, C1-C4) macht die Versand-Steuerung, siehe .agents/mail-engine.md

const BREVO = 'https://api.brevo.com/v3';
const LIST = { pending: 21, confirmed: 22, unsub: 8 };
const SENDER = { name: 'Alex von vorflows', email: 'alex@adolution.de' };
const ORIGIN = 'https://vorflows.com';
const WORKSHOP_DAY = '10. September';

// Abgemeldete/gesperrte Kontakte nie in eine Strecke zurückholen
const isBlocked = (c) => !!(c && (c.emailBlacklisted || (c.listIds || []).includes(LIST.unsub)));
// Vorname nur aus Buchstaben, Leerzeichen, Bindestrich, Apostroph: keine Links/Domains im Mailtext
const cleanName = (s) => String(s || '').normalize('NFC').replace(/[^\p{L}\p{M} '-]/gu, '').replace(/\s+/g, ' ').trim().slice(0, 40);

const today = () => new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Berlin' }).format(new Date());
const EMAIL_RE = /^[^\s@<>()",;:]{1,64}@[A-Za-z0-9.-]{1,253}\.[A-Za-z]{2,24}$/;

// Eigener Bestätigungs-Token (nicht VF_TOKEN), damit Links aus anderen Mails nichts bestätigen
const optinSig = (id, secret) =>
  crypto.createHmac('sha256', secret).update('optin:' + id).digest('base64url').slice(0, 16);
const optinToken = (id, secret) => `${id}.${optinSig(id, secret)}`;
const verifyOptin = (c, secret) => {
  const m = /^(\d{1,12})\.([A-Za-z0-9_-]{16})$/.exec(String(c || ''));
  if (!m) return null;
  const a = Buffer.from(optinSig(m[1], secret));
  const b = Buffer.from(m[2]);
  return a.length === b.length && crypto.timingSafeEqual(a, b) ? m[1] : null;
};

const readBody = async (req) => {
  if (req.body && typeof req.body === 'object') return req.body;
  const chunks = [];
  for await (const c of req) chunks.push(c);
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}'); } catch { return {}; }
};

const esc = (s) => String(s).replace(/[&<>"]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));

function mail(vorname, href) {
  const hi = vorname ? `Hey ${esc(vorname)},` : 'Hey,';
  const subject = 'Deine Aufzeichnung vom Shopify-Workshop';
  const html = `<!doctype html>
<html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${subject}</title></head>
<body style="margin:0;padding:0;background:#ffffff;">
<div style="display:none;max-height:0;overflow:hidden;">Ein Klick, dann läuft die Aufzeichnung</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#ffffff;"><tr><td align="center" style="padding:24px 16px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:16px;line-height:1.6;color:#1a1a1a;"><tr><td>
<p style="margin:0 0 16px;">${hi}</p>
<p style="margin:0 0 16px;">hier ist die Aufzeichnung vom Live-Workshop am ${WORKSHOP_DAY}, in dem ich mit KI einen Shopify-Shop umbaue. Mit diesem Link bestätigst du auch deine Adresse:</p>
<p style="margin:0 0 16px;"><a href="${href}" style="color:#1a1a1a;font-weight:600;text-decoration:underline;">Aufzeichnung ansehen</a></p>
<p style="margin:0 0 16px;">Unter dem Video kannst du zu jedem Kapitel springen. Wenn beim Zuschauen eine Frage auftaucht, antworte einfach auf diese Mail.</p>
<p style="margin:0 0 16px;">Viele Grüße<br>Alex</p>
<p style="margin:16px 0 0;padding-top:16px;border-top:1px solid #e5e5e5;font-size:12px;line-height:1.5;color:#777777;">Du bekommst diese Mail, weil du auf vorflows.com die Aufzeichnung angefordert hast. Warst du das nicht, ignoriere sie einfach, dann hörst du nichts mehr von mir.<br>AMD Media GmbH, c/o Pioneers Club, Ritterstraße 8, 33602 Bielefeld</p>
</td></tr></table></td></tr></table>
</body></html>`;
  const text = `${vorname ? `Hey ${vorname},` : 'Hey,'}\n\nhier ist die Aufzeichnung vom Live-Workshop am ${WORKSHOP_DAY}, in dem ich mit KI einen Shopify-Shop umbaue. Mit diesem Link bestätigst du auch deine Adresse:\n\n${href}\n\nUnter dem Video kannst du zu jedem Kapitel springen. Wenn beim Zuschauen eine Frage auftaucht, antworte einfach auf diese Mail.\n\nViele Grüße\nAlex\n\nDu bekommst diese Mail, weil du auf vorflows.com die Aufzeichnung angefordert hast. Warst du das nicht, ignoriere sie einfach.\nAMD Media GmbH, c/o Pioneers Club, Ritterstraße 8, 33602 Bielefeld`;
  return { subject, html, text };
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  const KEY = process.env.BREVO_API_KEY;
  const SECRET = process.env.VF_TRACK_SECRET;
  const fallback = `${ORIGIN}/replay?utm_source=brevo&utm_medium=email&utm_campaign=replay-optin`;
  if (!KEY || !SECRET) {
    if (req.method === 'GET') { res.statusCode = 302; res.setHeader('Location', fallback); return res.end(); }
    return res.status(500).json({ error: 'not_configured' });
  }
  const headers = { 'api-key': KEY, 'content-type': 'application/json', accept: 'application/json' };
  const brevo = async (path, opt = {}) => {
    const r = await fetch(BREVO + path, { ...opt, headers });
    const t = await r.text();
    let j = null; try { j = t ? JSON.parse(t) : null; } catch {}
    return { ok: r.ok, status: r.status, j };
  };

  // ---- Bestätigung: Klick aus der Mail ----
  if (req.method === 'GET') {
    const url = new URL(req.url, ORIGIN);
    const id = verifyOptin(url.searchParams.get('c'), SECRET);
    let dest = fallback;
    if (id) {
      try {
        const c = await brevo(`/contacts/${id}?identifierType=contact_id`);
        if (c.ok && isBlocked(c.j)) {
          dest = `${ORIGIN}/replay?utm_source=brevo&utm_medium=email&utm_campaign=replay-optin`;
        } else if (c.ok) {
          const cur = c.j.attributes || {};
          const vt = `${id}.${sign(id, SECRET)}`;
          const attrs = {};
          if (!cur.RP_OPTIN_OK) attrs.RP_OPTIN_OK = today();
          if (cur.VF_TOKEN !== vt) attrs.VF_TOKEN = vt;
          const have = new Set(c.j.listIds || []);
          if (Object.keys(attrs).length || !have.has(LIST.confirmed) || have.has(LIST.pending)) {
            const put = { attributes: attrs };
            if (!have.has(LIST.confirmed)) put.listIds = [LIST.confirmed];
            if (have.has(LIST.pending)) put.unlinkListIds = [LIST.pending];
            const u = await brevo(`/contacts/${id}?identifierType=contact_id`, { method: 'PUT', body: JSON.stringify(put) });
            console.log('replay-optin confirm', JSON.stringify({ id, status: u.status }));
          }
          dest = `${ORIGIN}/replay?vt=${encodeURIComponent(vt)}&utm_source=brevo&utm_medium=email&utm_campaign=replay-optin`;
        }
      } catch (e) {
        console.log('replay-optin confirm error', String(e && e.message));
      }
    }
    res.statusCode = 302;
    res.setHeader('Location', dest);
    return res.end();
  }

  if (req.method !== 'POST') return res.status(405).end();

  // ---- Anmeldung: Formular auf /live-workshop ----
  const body = await readBody(req);
  if (body.hp) return res.status(200).json({ ok: true }); // Honeypot: Bots bekommen ein stilles Ok
  const email = String(body.email || '').trim().toLowerCase();
  const vorname = cleanName(body.vorname);
  if (!EMAIL_RE.test(email)) return res.status(400).json({ error: 'email' });

  const ip = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim().slice(0, 45);
  let attr = {};
  try { attr = body.attr && typeof body.attr === 'object' ? body.attr : {}; } catch {}
  const quelle = ['replay-optin', attr.utm_source, attr.utm_campaign].filter(Boolean).join(' · ').slice(0, 120);

  try {
    let id = null;
    const ex = await brevo(`/contacts/${encodeURIComponent(email)}`);
    if (ex.ok) {
      // Bekannter Kontakt: Felder nicht überschreiben, nur Anfrage vermerken
      id = ex.j.id;
      const cur = ex.j.attributes || {};
      // Höchstens eine Link-Mail pro Adresse und Tag (Schutz gegen Mail-Bombing über das Formular)
      if (String(cur.RP_OPTIN || '').slice(0, 10) === today()) return res.status(200).json({ ok: true });
      const attrs = { RP_OPTIN: today() };
      if (vorname && !cur.VORNAME) attrs.VORNAME = vorname;
      const confirmed = (ex.j.listIds || []).includes(LIST.confirmed);
      const put = { attributes: attrs };
      if (!confirmed && !isBlocked(ex.j)) put.listIds = [LIST.pending];
      await brevo(`/contacts/${id}?identifierType=contact_id`, { method: 'PUT', body: JSON.stringify(put) });
    } else if (ex.status === 404) {
      const attrs = { RP_OPTIN: today(), QUELLE: quelle };
      if (vorname) attrs.VORNAME = vorname;
      if (ip) attrs.OPTIN_IP = ip;
      const cr = await brevo('/contacts', {
        method: 'POST',
        body: JSON.stringify({ email, attributes: attrs, listIds: [LIST.pending], updateEnabled: false }),
      });
      if (!cr.ok) throw new Error('create ' + cr.status + ' ' + JSON.stringify(cr.j));
      id = cr.j.id;
    } else {
      throw new Error('lookup ' + ex.status);
    }

    const href = `${ORIGIN}/api/replay-optin?c=${optinToken(id, SECRET)}`;
    const m = mail(vorname, href);
    const s = await brevo('/smtp/email', {
      method: 'POST',
      body: JSON.stringify({
        sender: SENDER,
        replyTo: SENDER,
        to: [{ email, ...(vorname ? { name: vorname } : {}) }],
        subject: m.subject,
        htmlContent: m.html,
        textContent: m.text,
        tags: ['replay-optin'],
      }),
    });
    if (!s.ok) throw new Error('send ' + s.status + ' ' + JSON.stringify(s.j));
    console.log('replay-optin sent', JSON.stringify({ id, known: ex.ok }));
    return res.status(200).json({ ok: true });
  } catch (e) {
    console.log('replay-optin error', String(e && e.message));
    return res.status(502).json({ error: 'brevo' });
  }
}

export { optinToken, verifyOptin, mail };
