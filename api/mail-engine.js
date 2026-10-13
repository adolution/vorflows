import { mailFor, AF_SALE } from './_mail/mails.js';
import { optinToken } from './replay-optin.js';

// Versand-Steuerung für Replay-, Bundle- und AdsFlow-Strecke. Doku: .agents/mail-engine.md
// Läuft per Vercel-Cron morgens und abends. Pro Kontakt höchstens eine Mail pro Lauf und Tag
// (abends nur D2). Versendet wird als normale Brevo-Kampagne an eine Liste im Ordner 16.
// Ohne MAIL_ENGINE=on oder mit ?dry=1 wird nur geplant, nicht verschickt.

export const config = { maxDuration: 60 };

const BREVO = 'https://api.brevo.com/v3';
const SEND_FOLDER = 16;
const L = { all: 4, buyer: 5, live: 6, noshow: 7, unsub: 8, afBuyer: 15, sheetOnly: 17, rpPending: 21, rpConfirmed: 22 };
const LAUNCH_START = '2026-10-11';
const AF_END = AF_SALE.bis; // Ende des aktuellen/letzten AdsFlow-Sales, Pflege nur in mails.js
const AF_LAST_MAIL_DAY = '2026-11-01'; // Ende der Launch-Wellen A/B (fest, Launch 2026)
const WEEK_CAP = 3; // höchstens 3 Mails in 7 Tagen, außer Kauf-Hilfe und Deadline
const URGENT = new Set(['KA', 'KB', 'D0', 'D1', 'D2']);
const DEADLINE = new Set(['D0', 'D1', 'D2']); // ignorieren alle Grenzen, auch 1 pro Tag
// Diese Mails gehen nicht sofort, sondern am selben Tag um 14 Uhr (Berlin) raus, damit zuerst
// die engagiertesten Empfänger Signale an Gmail/GMX senden (Alex 2026-10-11).
const SEND_LATER = { A1G: 14, R1S: 14 };
const SINGLE = new Set(['Q0']); // Einzelversand statt Kampagne

const berlinDay = (d = new Date()) => new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Berlin' }).format(d);
const addDays = (day, n) => {
  const d = new Date(day + 'T12:00:00Z');
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
};
const berlinAt = (day, hour) => {
  const noonUtc = new Date(day + 'T12:00:00Z');
  const h = Number(new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Berlin', hour: '2-digit', hourCycle: 'h23' }).format(noonUtc));
  const off = h - 12; // +1 Winterzeit, +2 Sommerzeit
  return new Date(Date.UTC(+day.slice(0, 4), +day.slice(5, 7) - 1, +day.slice(8, 10), hour - off)).toISOString();
};
const maxDay = (...ds) => ds.filter(Boolean).sort().pop();
const dayOf = (v) => (v ? String(v).slice(0, 10) : '');

function parseSent(s) {
  const out = {};
  String(s || '').split(',').forEach((p) => {
    const [k, d] = p.split(':');
    if (k && d) out[k] = d;
  });
  return out;
}

// Kontakt → Zustand, den die Regeln brauchen
function view(c) {
  const a = c.attributes || {};
  const lists = new Set(c.listIds || []);
  const produkte = String(a.PRODUKTE || '');
  const v = {
    id: c.id,
    lists,
    sent: parseSent(a.MAILS_SENT),
    last: dayOf(a.MAIL_LAST),
    open: dayOf(a.MAIL_OPEN),
    seen: dayOf(a.LAST_SEEN),
    rpStart: dayOf(a.RP_START),
    rpPitch: dayOf(a.RP_PITCH),
    rpChk: maxDay(dayOf(a.RP_CHECKOUT), dayOf(a.SALES_CHECKOUT)),
    afVisit: dayOf(a.AF_VISIT),
    afChk: dayOf(a.AF_CHECKOUT),
    buyerBundle: /688983|bundle|vorflows/i.test(produkte) || (lists.has(L.buyer) && !/690701|adsflow/i.test(produkte)),
    buyerAF: lists.has(L.afBuyer) || /690701|adsflow/i.test(produkte),
    blocked: c.emailBlacklisted || lists.has(L.unsub),
  };
  v.kauf = dayOf(a.KAUF_DATUM);
  v.optin = dayOf(a.RP_OPTIN);
  v.optinOk = dayOf(a.RP_OPTIN_OK);
  // Anforderer der Aufzeichnung über /live-workshop. Alte Workshop-Leads (Liste 4) bleiben in ihrer Strecke.
  v.pend = lists.has(L.rpPending) && !lists.has(L.rpConfirmed) && !lists.has(L.all) && !v.optinOk;
  v.req = lists.has(L.rpConfirmed) && !lists.has(L.all) && !!v.optinOk;
  v.newBundleBuyer = v.buyerBundle && v.kauf >= LAUNCH_START; // kauft während der Strecke → Upsell-Strecke
  v.w1 = !v.newBundleBuyer && (lists.has(L.buyer) || lists.has(L.live));
  v.w2 = !v.newBundleBuyer && lists.has(L.noshow) && !lists.has(L.buyer) && !v.buyerBundle;
  v.engagedSince = (d) => (v.open && v.open >= d) || (v.seen && v.seen >= d);
  return v;
}

// Regeln in Prioritätsreihenfolge: [Schritt, Mail, Bedingung]
function rules(T, evening) {
  const s = (v, k) => v.sent[k];
  const R = [];
  // Wer bekommt die Deadline-Mails: alle in einer AdsFlow-Strecke, Upsell-Käufer und alle aus dem Bundle-Nachfass
  const inAF = (v) => s(v, 'A1') || s(v, 'B1') || s(v, 'C1') || s(v, 'U1') || s(v, 'P1');
  const KA = ['KA', 'KA', (v) => v.afChk >= LAUNCH_START && T >= addDays(v.afChk, 1) && !v.buyerAF && !s(v, 'KA')];
  if (evening) {
    R.push(['D2', 'D2', (v) => T === AF_END && v.afVisit && !v.buyerAF && !s(v, 'D2')]);
    R.push(KA);
    return R;
  }
  R.push(['D0', 'D0', (v) => T === addDays(AF_END, -1) && !v.buyerAF && inAF(v) && !s(v, 'D0')]);
  R.push(['D1', 'D1', (v) => T === AF_END && !v.buyerAF && inAF(v) && !s(v, 'D1')]);
  R.push(KA);
  R.push(['KB', 'KB', (v) => v.rpChk >= LAUNCH_START && T >= addDays(v.rpChk, 1) && !v.buyerBundle && !s(v, 'KB')]);

  // Upsell: Bundle-Kauf ab Strecken-Start → Tag danach U1, bei Interesse 3 Tage später AdsFlow 3
  R.push(['U1', 'U1', (v) => v.newBundleBuyer && !v.buyerAF && T >= addDays(v.kauf, 1) && T <= addDays(v.kauf, 7) && !s(v, 'U1')]);
  R.push(['U2', 'A3', (v) => v.newBundleBuyer && !v.buyerAF && s(v, 'U1') && v.engagedSince(s(v, 'U1')) && T >= addDays(s(v, 'U1'), 3) && !s(v, 'U2')]);

  // Bundle-Nachfass nach gesehenem Pitch
  R.push(['P1', 'P1', (v) => v.rpPitch && T >= addDays(v.rpPitch, 1) && !v.buyerBundle && !s(v, 'P1')]);
  R.push(['P2', 'P2', (v) => s(v, 'P1') && T >= addDays(s(v, 'P1'), 2) && !v.buyerBundle && !s(v, 'P2')]);
  R.push(['P3', 'P3', (v) => s(v, 'P2') && T >= addDays(s(v, 'P2'), 2) && !v.buyerBundle && !s(v, 'P3')]);

  // Replay-Strecke (Liste 7). Liste 17 = nur im Sheet, bekommt die neutrale Fassung.
  R.push(['R1', (v) => (v.lists.has(L.sheetOnly) ? 'R1S' : 'R1'), (v) => v.lists.has(L.noshow) && !v.rpStart && T >= '2026-10-14' && T <= '2026-10-20' && !v.buyerBundle && !s(v, 'R1')]);
  R.push(['RW', 'RW', (v) => ((v.lists.has(L.noshow) && T <= '2026-10-29') || v.req) && v.rpStart && !v.rpPitch && T >= addDays(v.rpStart, 2) && !v.buyerBundle && !s(v, 'RW')]);
  R.push(['R2', 'R2', (v) => v.lists.has(L.noshow) && s(v, 'R1') && !v.rpStart && T >= maxDay('2026-10-16', addDays(s(v, 'R1'), 2)) && T <= addDays(s(v, 'R1'), 5) && !v.buyerBundle && !s(v, 'R2')]);
  R.push(['R3', 'R3', (v) => v.lists.has(L.noshow) && s(v, 'R2') && !v.rpStart && T >= maxDay('2026-10-20', addDays(s(v, 'R2'), 4)) && T <= '2026-10-24' && !v.buyerBundle && !s(v, 'R3')]);

  // Anforderer der Aufzeichnung (/live-workshop). Zeitlos, ohne Enddatum. Doku: .agents/mail-engine.md
  R.push(['Q0', 'Q0', (v) => v.pend && v.optin && T >= addDays(v.optin, 1) && T <= addDays(v.optin, 5) && !s(v, 'Q0')]);
  R.push(['Q1', 'Q1', (v) => v.req && !v.rpStart && !v.buyerBundle && T >= addDays(v.optinOk, 1) && !s(v, 'Q1')]);
  R.push(['Q3', 'Q3', (v) => v.req && !v.rpStart && !v.buyerBundle && s(v, 'Q1') && T >= addDays(s(v, 'Q1'), 3) && !s(v, 'Q3')]);
  // AdsFlow für Anforderer: erst nach der Bundle-Strecke (P3), nach Q3 oder nach RW ohne Pitch
  const cEntry = (v) => {
    if (s(v, 'P3')) return addDays(s(v, 'P3'), 2);
    if (v.rpPitch) return null; // P1 bis P3 laufen noch
    if (s(v, 'Q3')) return addDays(s(v, 'Q3'), 2);
    if (s(v, 'RW')) return addDays(s(v, 'RW'), 4);
    return null;
  };
  const c1 = (v) => s(v, 'C1');
  R.push(['C1', 'C1', (v) => v.req && !v.buyerAF && !v.buyerBundle && cEntry(v) && T >= cEntry(v) && !c1(v)]);
  R.push(['C1X', 'C1X', (v) => v.req && !v.buyerAF && c1(v) && !v.engagedSince(c1(v)) && T >= addDays(c1(v), 3) && T <= addDays(c1(v), 5) && !s(v, 'C1X')]);
  R.push(['C2', 'A2', (v) => v.req && !v.buyerAF && c1(v) && v.engagedSince(c1(v)) && T >= addDays(c1(v), 3) && !s(v, 'C2')]);
  R.push(['C3', 'A3', (v) => v.req && !v.buyerAF && s(v, 'C2') && T >= addDays(s(v, 'C2'), 3) && !s(v, 'C3')]);
  R.push(['C4', 'A4', (v) => v.req && !v.buyerAF && s(v, 'C3') && T >= addDays(s(v, 'C3'), 3) && !s(v, 'C4')]);

  // AdsFlow Welle 1: Käufer (vor dem Launch) + Live-Zuschauer
  const a1 = (v) => s(v, 'A1');
  R.push(['A1', (v) => (v.lists.has(L.buyer) ? 'A1K' : 'A1G'), (v) => v.w1 && !v.buyerAF && T >= '2026-10-13' && T <= '2026-10-19' && !a1(v)]);
  R.push(['A1X', (v) => (v.lists.has(L.buyer) ? 'A1KX' : 'A1GX'), (v) => v.w1 && !v.buyerAF && a1(v) && !v.engagedSince(a1(v)) && T >= addDays(a1(v), 3) && T <= addDays(a1(v), 5) && !s(v, 'A1X')]);
  R.push(['A2', 'A2', (v) => v.w1 && !v.buyerAF && a1(v) && v.engagedSince(a1(v)) && T >= maxDay('2026-10-16', addDays(a1(v), 3)) && T <= AF_LAST_MAIL_DAY && !s(v, 'A2')]);
  R.push(['A3', 'A3', (v) => v.w1 && !v.buyerAF && s(v, 'A2') && T >= maxDay('2026-10-20', addDays(s(v, 'A2'), 3)) && T <= AF_LAST_MAIL_DAY && !s(v, 'A3')]);
  R.push(['A4', 'A4', (v) => v.w1 && !v.buyerAF && s(v, 'A3') && T >= maxDay('2026-10-27', addDays(s(v, 'A3'), 3)) && T <= AF_LAST_MAIL_DAY && !s(v, 'A4')]);

  // AdsFlow Welle 2: Liste 7 ohne Kauf. Wer den Pitch gesehen hat, erst nach dem Bundle-Nachfass.
  const entry = (v) => {
    if (!v.rpPitch) return '2026-10-26';
    if (s(v, 'P3')) return maxDay('2026-10-26', addDays(s(v, 'P3'), 2));
    return maxDay('2026-10-26', addDays(v.rpPitch, 8));
  };
  R.push(['B1', 'B1', (v) => v.w2 && !v.buyerAF && T >= entry(v) && T <= AF_LAST_MAIL_DAY && !s(v, 'B1')]);
  R.push(['B1X', 'B1X', (v) => v.w2 && !v.buyerAF && s(v, 'B1') && !v.engagedSince(s(v, 'B1')) && T >= addDays(s(v, 'B1'), 2) && T <= AF_LAST_MAIL_DAY && !s(v, 'B1X')]);
  R.push(['B2', 'A2', (v) => v.w2 && !v.buyerAF && s(v, 'B1') && v.engagedSince(s(v, 'B1')) && T >= addDays(s(v, 'B1'), 2) && T <= AF_LAST_MAIL_DAY && !s(v, 'B2')]);
  R.push(['B3', 'A3', (v) => v.w2 && !v.buyerAF && s(v, 'B2') && T >= addDays(s(v, 'B2'), 2) && T <= AF_LAST_MAIL_DAY && !s(v, 'B3')]);
  return R;
}

export function planDay(contacts, T, evening) {
  const R = rules(T, evening);
  const groups = {};
  for (const c of contacts) {
    const v = view(c);
    if (v.blocked) continue;
    const today = !evening && v.last === T;
    const week = Object.values(v.sent).filter((d) => d > addDays(T, -7)).length;
    for (const [step, mail, cond] of R) {
      if (today && !DEADLINE.has(step)) continue;
      if (week >= WEEK_CAP && !URGENT.has(step)) continue;
      if (!cond(v)) continue;
      const m = typeof mail === 'function' ? mail(v) : mail;
      const g = (groups[step + '|' + m] ||= { step, mail: m, ids: [] });
      g.ids.push(c.id);
      break;
    }
  }
  return Object.values(groups);
}

async function brevo(path, opts = {}) {
  const r = await fetch(BREVO + path, {
    ...opts,
    headers: { 'api-key': process.env.BREVO_API_KEY, 'content-type': 'application/json', accept: 'application/json' },
  });
  const text = await r.text();
  if (!r.ok) throw new Error(`${opts.method || 'GET'} ${path} ${r.status} ${text.slice(0, 300)}`);
  return text ? JSON.parse(text) : {};
}

export async function loadContacts() {
  const all = [];
  for (let off = 0; ; off += 1000) {
    const r = await brevo(`/contacts?limit=1000&offset=${off}`);
    all.push(...(r.contacts || []));
    if (off + 1000 >= r.count) break;
  }
  return all;
}

// Q0 geht als Einzelmail (Transaktions-API), weil jeder Kontakt seinen eigenen Bestätigungslink braucht
async function sendSingles(g, T, byId) {
  const secret = process.env.VF_TRACK_SECRET;
  if (!secret) throw new Error('VF_TRACK_SECRET fehlt');
  let count = 0;
  for (const id of g.ids) {
    const c = byId.get(id);
    if (!c || !c.email) continue;
    const vorname = (c.attributes && c.attributes.VORNAME) || '';
    const m = mailFor(g.mail, { T, vorname, optin: `https://vorflows.com/api/replay-optin?c=${optinToken(id, secret)}` });
    await brevo('/smtp/email', {
      method: 'POST',
      body: JSON.stringify({
        sender: { name: 'Alex von vorflows', email: 'alex@adolution.de' },
        replyTo: { name: 'Alex von vorflows', email: 'alex@adolution.de' },
        to: [{ email: c.email, ...(vorname ? { name: vorname } : {}) }],
        subject: m.subject,
        htmlContent: m.html,
        tags: ['mail-engine', g.step],
      }),
    });
    const prev = (c.attributes?.MAILS_SENT || '').trim();
    await brevo(`/contacts/${id}?identifierType=contact_id`, {
      method: 'PUT',
      body: JSON.stringify({ attributes: { MAILS_SENT: (prev ? prev + ',' : '') + `${g.step}:${T}`, MAIL_LAST: T } }),
    });
    count++;
  }
  return { label: `${g.step} ${g.mail} ${T} einzeln`, count };
}

async function sendGroup(g, T, evening, byId) {
  if (SINGLE.has(g.mail)) return sendSingles(g, T, byId);
  const mail = mailFor(g.mail, { T });
  const label = `${g.step} ${g.mail} ${T}${evening ? ' abends' : ''}`;
  const list = await brevo('/contacts/lists', { method: 'POST', body: JSON.stringify({ name: 'Versand ' + label, folderId: SEND_FOLDER }) });
  for (let i = 0; i < g.ids.length; i += 150) {
    await brevo(`/contacts/lists/${list.id}/contacts/add`, { method: 'POST', body: JSON.stringify({ ids: g.ids.slice(i, i + 150) }) });
  }
  const camp = await brevo('/emailCampaigns', {
    method: 'POST',
    body: JSON.stringify({
      name: 'Auto ' + label,
      subject: mail.subject,
      previewText: mail.preview,
      sender: { name: 'Alex von vorflows', email: 'alex@adolution.de' },
      replyTo: 'alex@adolution.de',
      htmlContent: mail.html,
      recipients: { listIds: [list.id], exclusionListIds: [L.unsub] },
    }),
  });
  const at = SEND_LATER[g.mail] && !evening ? berlinAt(T, SEND_LATER[g.mail]) : null;
  let scheduledAt = null;
  if (at && new Date(at) > new Date(Date.now() + 10 * 60 * 1000)) {
    try {
      await brevo(`/emailCampaigns/${camp.id}`, { method: 'PUT', body: JSON.stringify({ scheduledAt: at }) });
      scheduledAt = at;
    } catch (e) {
      console.log('mail-engine schedule fallback', g.mail, String(e.message));
      await brevo(`/emailCampaigns/${camp.id}/sendNow`, { method: 'POST' });
    }
  } else {
    await brevo(`/emailCampaigns/${camp.id}/sendNow`, { method: 'POST' });
  }
  const contacts = g.ids.map((id) => {
    const prev = (byId.get(id)?.attributes?.MAILS_SENT || '').trim();
    return { id, attributes: { MAILS_SENT: (prev ? prev + ',' : '') + `${g.step}:${T}`, MAIL_LAST: T } };
  });
  for (let i = 0; i < contacts.length; i += 100) {
    await brevo('/contacts/batch', { method: 'POST', body: JSON.stringify({ contacts: contacts.slice(i, i + 100) }) });
  }
  return { label, campaignId: camp.id, listId: list.id, count: g.ids.length, scheduledAt };
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  const url = new URL(req.url, 'https://vorflows.com');
  const secret = process.env.CRON_SECRET;
  const auth = req.headers.authorization || '';
  if (!secret || (auth !== `Bearer ${secret}` && url.searchParams.get('key') !== secret)) {
    return res.status(401).json({ error: 'unauthorized' });
  }
  const evening = url.searchParams.get('evening') === '1';
  let live = process.env.MAIL_ENGINE === 'on' && url.searchParams.get('dry') !== '1';
  let gate = '';
  if (live) {
    // Sicherung: ohne authentifizierte Absender-Domain (DKIM) wird nichts verschickt
    try {
      const d = await brevo('/senders/domains');
      const dom = (d.domains || []).find((x) => x.domain_name === 'adolution.de');
      if (!dom || !dom.authenticated) { live = false; gate = 'adolution.de nicht authentifiziert'; }
    } catch (e) { live = false; gate = 'Domain-Check fehlgeschlagen'; }
  }
  const T = (!live && url.searchParams.get('today')) || berlinDay();

  try {
    const contacts = await loadContacts();
    const byId = new Map(contacts.map((c) => [c.id, c]));
    const groups = planDay(contacts, T, evening);
    const summary = groups.map((g) => ({ step: g.step, mail: g.mail, count: g.ids.length }));
    if (!live) {
      console.log('mail-engine dry', T, evening ? 'abends' : 'morgens', gate, JSON.stringify(summary));
      return res.status(200).json({ live: false, gate, today: T, evening, groups: summary });
    }
    const sent = [];
    for (const g of groups) {
      try { sent.push(await sendGroup(g, T, evening, byId)); }
      catch (e) { sent.push({ step: g.step, mail: g.mail, error: String(e.message) }); }
    }
    console.log('mail-engine live', T, JSON.stringify(sent));
    return res.status(200).json({ live: true, today: T, evening, sent });
  } catch (e) {
    console.log('mail-engine error', String(e && e.message));
    return res.status(500).json({ error: String(e && e.message) });
  }
}
