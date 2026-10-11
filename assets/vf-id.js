/* Brevo-Verhaltens-Tagging. Doku: .agents/brevo-tracking.md
   Muss im <head> vor Clarity/Pixel laden: entfernt ?vt= aus der URL, bevor jemand sie mitschreibt.
   Ohne Token (also ohne Klick aus einer Brevo-Mail) sendet vfTag nichts. */
(function () {
  var KEY = 'vf_vt';
  var RE = /^\d{1,12}\.[A-Za-z0-9_-]{12}$/;
  var vt = null;
  function get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function put(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }

  try {
    var u = new URL(location.href);
    var q = u.searchParams.get('vt');
    if (q !== null) {
      if (RE.test(q)) put(KEY, q);
      u.searchParams.delete('vt');
      history.replaceState(history.state, '', u.pathname + (u.search || '') + u.hash);
    }
  } catch (e) {}
  vt = get(KEY);
  if (vt && !RE.test(vt)) vt = null;

  var path = location.pathname.replace(/\.html$/, '').replace(/\/$/, '');
  var page = path === '/replay' ? 'replay' : path === '/sales' ? 'sales' : path === '/adsflow' ? 'adsflow' : '';
  var local = /^(localhost|127\.0\.0\.1)$/.test(location.hostname);

  function denied() { return get('vf_consent') === 'denied'; }

  window.vfTag = function (ev, d) {
    if (!vt || !page || denied()) return;
    var data = {};
    if (d && d.pct != null) data.pct = d.pct;
    if (d && d.loc) data.loc = String(d.loc).slice(0, 40);
    var body = JSON.stringify({ vt: vt, ev: String(ev).slice(0, 40), page: page, d: data });
    if (local) { console.info('[vfTag]', ev, data); return; }
    try {
      if (navigator.sendBeacon && navigator.sendBeacon('/api/brevo-track', new Blob([body], { type: 'application/json' }))) return;
      fetch('/api/brevo-track', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: body, keepalive: true }).catch(function () {});
    } catch (e) {}
  };

  // Seitenaufruf, 1x pro Sitzung und Seite
  try {
    var sk = 'vf_vt_page_' + page;
    if (page && vt && !sessionStorage.getItem(sk)) { sessionStorage.setItem(sk, '1'); window.vfTag('page'); }
  } catch (e) { window.vfTag('page'); }
})();
