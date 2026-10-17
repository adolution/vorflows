// Scratch-Test: /adsflow Meta-Engagement-Events (lokal → console '[track]')
import puppeteer from 'puppeteer';
const b = await puppeteer.launch(); const p = await b.newPage();
await p.setViewport({ width: 390, height: 800 });
const ev = []; p.on('console', m => { const t = m.text(); if (t.startsWith('[track]')) ev.push(t.split(' ')[1]); });
p.on('pageerror', e => console.log('ERR', e.message));
await p.goto('http://localhost:3001/adsflow.html', { waitUntil: 'load' });
await new Promise(r => setTimeout(r, 1500));
await p.click('[data-cta="hero"]'); await new Promise(r => setTimeout(r, 800));
await p.click('#play'); await new Promise(r => setTimeout(r, 12000));
for (let i = 0; i < 60; i++) { await p.mouse.wheel({ deltaY: 500 }); await new Promise(r => setTimeout(r, 120)); }
await new Promise(r => setTimeout(r, 50000));
console.log(ev.join('\n'));
await b.close();
