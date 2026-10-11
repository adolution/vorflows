// Test: Brevo-Token aus Mail-Link wird gespeichert, aus der URL entfernt, Ereignisse gehen an vfTag.
// Server auf :3001 nötig (node serve.mjs).
import puppeteer from 'puppeteer';
const br = await puppeteer.launch(); const p = await br.newPage();
const logs = []; p.on('console', m => { if (m.text().includes('[vfTag]')) logs.push(m.text()); });
let ok = true;
for (const path of ['/adsflow', '/replay', '/sales']) {
  await p.goto('http://localhost:3001' + path + '.html?vt=1.ft7Bt1ikeCf8&utm_source=brevo', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 800));
  const url = p.url(), ls = await p.evaluate(() => localStorage.getItem('vf_vt'));
  const pass = !url.includes('vt=') && url.includes('utm_source=brevo') && ls === '1.ft7Bt1ikeCf8';
  ok = ok && pass; console.log(pass ? 'OK ' : 'FAIL', path, url, ls);
}
console.log(logs.join('\n')); await br.close(); process.exit(ok ? 0 : 1);
