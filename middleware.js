export const config = {
  matcher: ['/', '/index.html', '/live-workshop'],
};

const MOBILE_UA = /Mobi|Android|iPhone|iPad|iPod/i;
const BOT_UA = /googlebot|bingbot|duckduckbot|yandex|baiduspider|slurp|applebot|gptbot|chatgpt-user|oai-searchbot|perplexitybot|claudebot|claude-web|anthropic-ai|google-extended|ccbot|bytespider|facebookexternalhit|meta-externalagent|twitterbot|linkedinbot|petalbot|semrushbot|ahrefsbot|mj12bot/i;
const MIDDLEWARE_VERSION = 'v8-2026-06-18-lw-forceA';

// Per-Pfad-Testkonfiguration. Jeder Test hat eigenen Cookie + eigenes
// B-Rewrite-Target → Tests laufen unabhängig, keine Bucket-Vermischung.
// splitDesktop: true → Desktop wird 50/50 gebucket statt auf A gepinnt.
// forceA: true → Test entschieden, alle auf A pinnen (Sieger). ?ab=B bleibt für QA/Preview offen.
function testConfig(pathname) {
  if (pathname === '/live-workshop') {
    // A/B-Test #4 entschieden 2026-06-18: A gewinnt → 100 % A für den Webinar-Push.
    return { cookie: 'vf_ab_lw', bTarget: '/live-workshop-b', splitDesktop: true, forceA: true };
  }
  // '/' + '/index.html' → bestehender Homepage-Test (Desktop bleibt A).
  return { cookie: 'vf_ab', bTarget: '/index-b', splitDesktop: false };
}

export default function middleware(req) {
  const url = new URL(req.url);
  console.log(`[ab-middleware ${MIDDLEWARE_VERSION}] ${url.pathname}${url.search}`);

  const { cookie: COOKIE, bTarget: B_TARGET, splitDesktop: SPLIT_DESKTOP, forceA: FORCE_A } = testConfig(url.pathname);

  const ua = req.headers.get('user-agent') || '';
  const isMobile = MOBILE_UA.test(ua);
  const isBot = BOT_UA.test(ua);
  const cookieHeader = req.headers.get('cookie') || '';
  const override = url.searchParams.get('ab');

  let bucket = (override === 'A' || override === 'B') ? override : null;
  if (!bucket) bucket = (cookieHeader.match(new RegExp(`(?:^|; )${COOKIE}=([AB])`)) || [])[1] || null;
  let source = bucket ? (override ? 'override' : 'cookie') : null;

  const headers = new Headers({
    'cache-control': 'private, no-store, max-age=0, must-revalidate',
    'x-ab-mw-version': MIDDLEWARE_VERSION,
    'x-ab-test': COOKIE,
    'x-ab-mobile': isMobile ? '1' : '0',
    'x-ab-bot': isBot ? '1' : '0',
  });

  // Test entschieden (forceA) → alle auf A, auch Alt-Besucher mit B-Cookie. Nur ?ab=B (QA/Preview) kommt noch zu B durch.
  if (FORCE_A && override !== 'B') {
    headers.set('x-ab-bucket', 'A');
    headers.set('x-ab-source', 'forced-A');
    headers.set('x-middleware-next', '1');
    return new Response(null, { headers });
  }

  // Bots/Crawler ohne Override → immer A (canonical), kein Cookie, keine Split-Crawl-Inkonsistenz.
  if (isBot && !override) {
    headers.set('x-ab-bucket', 'A');
    headers.set('x-ab-source', 'bot-pinned-A');
    headers.set('x-middleware-next', '1');
    return new Response(null, { headers });
  }

  // Desktop ohne Cookie/Override → nur pinnen, wenn Test Desktop NICHT splittet.
  if (!bucket && !isMobile && !SPLIT_DESKTOP) {
    headers.set('x-ab-bucket', 'A');
    headers.set('x-ab-source', 'desktop-default');
    headers.set('x-middleware-next', '1');
    return new Response(null, { headers });
  }

  // Ohne Cookie/Override → random bucket (Mobile immer, Desktop bei splitDesktop).
  if (!bucket) {
    bucket = Math.random() < 0.5 ? 'A' : 'B';
    source = isMobile ? 'random' : 'random-desktop';
  }

  headers.set('x-ab-bucket', bucket);
  headers.set('x-ab-source', source || 'unknown');

  // cleanUrls: true → rewrite-Target ohne .html.
  // A bleibt pass-through (canonical-Datei: index.html bzw. live-workshop.html).
  if (bucket === 'B') {
    headers.set('x-middleware-rewrite', new URL(B_TARGET, url).toString());
  } else {
    headers.set('x-middleware-next', '1');
  }

  if (!cookieHeader.includes(`${COOKIE}=`)) {
    headers.append(
      'set-cookie',
      `${COOKIE}=${bucket}; Path=/; Max-Age=${60 * 60 * 24 * 90}; SameSite=Lax; Secure`
    );
  }

  return new Response(null, { headers });
}
