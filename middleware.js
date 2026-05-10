export const config = {
  matcher: ['/', '/index.html'],
};

const MOBILE_UA = /Mobi|Android|iPhone|iPad|iPod/i;
const BOT_UA = /googlebot|bingbot|duckduckbot|yandex|baiduspider|slurp|applebot|gptbot|chatgpt-user|oai-searchbot|perplexitybot|claudebot|claude-web|anthropic-ai|google-extended|ccbot|bytespider|facebookexternalhit|meta-externalagent|twitterbot|linkedinbot|petalbot|semrushbot|ahrefsbot|mj12bot/i;
const MIDDLEWARE_VERSION = 'v5-2026-05-10-bot-pin';

export default function middleware(req) {
  const url = new URL(req.url);
  console.log(`[ab-middleware ${MIDDLEWARE_VERSION}] ${url.pathname}${url.search}`);

  const ua = req.headers.get('user-agent') || '';
  const isMobile = MOBILE_UA.test(ua);
  const isBot = BOT_UA.test(ua);
  const cookieHeader = req.headers.get('cookie') || '';
  const override = url.searchParams.get('ab');

  let bucket = (override === 'A' || override === 'B') ? override : null;
  if (!bucket) bucket = (cookieHeader.match(/(?:^|; )vf_ab=([AB])/) || [])[1] || null;
  let source = bucket ? (override ? 'override' : 'cookie') : null;

  const headers = new Headers({
    'cache-control': 'private, no-store, max-age=0, must-revalidate',
    'x-ab-mw-version': MIDDLEWARE_VERSION,
    'x-ab-mobile': isMobile ? '1' : '0',
    'x-ab-bot': isBot ? '1' : '0',
  });

  // Bots/Crawler ohne Override → immer A (canonical), kein Cookie, keine Split-Crawl-Inkonsistenz.
  if (isBot && !override) {
    headers.set('x-ab-bucket', 'A');
    headers.set('x-ab-source', 'bot-pinned-A');
    headers.set('x-middleware-next', '1');
    return new Response(null, { headers });
  }

  // Desktop ohne Cookie/Override → deterministisch A, kein Cookie setzen.
  if (!bucket && !isMobile) {
    headers.set('x-ab-bucket', 'A');
    headers.set('x-ab-source', 'desktop-default');
    headers.set('x-middleware-next', '1');
    return new Response(null, { headers });
  }

  // Mobile ohne Cookie/Override → random bucket.
  if (!bucket) {
    bucket = Math.random() < 0.5 ? 'A' : 'B';
    source = 'random';
  }

  headers.set('x-ab-bucket', bucket);
  headers.set('x-ab-source', source || 'unknown');

  // cleanUrls: true → rewrite-Target ohne .html für /index-b.
  // index.html als Root bleibt special — pass through.
  if (bucket === 'B') {
    headers.set('x-middleware-rewrite', new URL('/index-b', url).toString());
  } else {
    headers.set('x-middleware-next', '1');
  }

  if (!cookieHeader.includes('vf_ab=')) {
    headers.append(
      'set-cookie',
      `vf_ab=${bucket}; Path=/; Max-Age=${60 * 60 * 24 * 90}; SameSite=Lax; Secure`
    );
  }

  return new Response(null, { headers });
}
