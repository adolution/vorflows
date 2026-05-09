import { next, rewrite } from '@vercel/edge';

export const config = {
  matcher: '/((?!api|_next|_vercel|assets|brand_assets|carousels|.*\\.[a-z0-9]+).*)',
};

const MOBILE_UA = /Mobi|Android|iPhone|iPad|iPod/i;

export default function middleware(req) {
  const url = new URL(req.url);

  // Nur Root oder /index.html splitten — alle anderen Routen unverändert.
  if (url.pathname !== '/' && url.pathname !== '/index.html') {
    return next();
  }

  const ua = req.headers.get('user-agent') || '';
  const isMobile = MOBILE_UA.test(ua);
  const cookieHeader = req.headers.get('cookie') || '';
  const override = url.searchParams.get('ab');

  // Reihenfolge:
  // 1. Override (?ab=A|B) hat höchste Priorität — funktioniert auch auf Desktop für QA.
  // 2. Cookie sticky — returning visitor sieht stets gleiche Variante.
  // 3. Mobile-only Random-Bucket — Desktop ohne Cookie + ohne Override bleibt auf A.
  let bucket = (override === 'A' || override === 'B') ? override : null;
  if (!bucket) bucket = (cookieHeader.match(/(?:^|; )vf_ab=([AB])/) || [])[1] || null;
  let source = bucket ? (override ? 'override' : 'cookie') : null;

  if (!bucket) {
    if (!isMobile) {
      // Desktop ohne Cookie/Override: deterministisch auf A, kein Cookie setzen.
      const r = next();
      r.headers.set('cache-control', 'private, no-store, max-age=0, must-revalidate');
      r.headers.set('x-ab-bucket', 'A');
      r.headers.set('x-ab-source', 'desktop-default');
      r.headers.set('x-ab-mobile', '0');
      return r;
    }
    bucket = Math.random() < 0.5 ? 'A' : 'B';
    source = 'random';
  }

  const target = bucket === 'B' ? '/index-b.html' : '/index.html';
  const res = url.pathname === target ? next() : rewrite(new URL(target, url));

  // CDN darf diese Response NICHT cachen, sonst sehen alle Visitors das
  // Bucket des ersten Visitors. Pro-Request frische middleware-Eval.
  res.headers.set('cache-control', 'private, no-store, max-age=0, must-revalidate');
  res.headers.set('x-ab-bucket', bucket);
  res.headers.set('x-ab-source', source || 'unknown');
  res.headers.set('x-ab-mobile', isMobile ? '1' : '0');

  // Cookie 90d sticky setzen, falls noch nicht vorhanden.
  if (!cookieHeader.includes('vf_ab=')) {
    res.headers.append(
      'set-cookie',
      `vf_ab=${bucket}; Path=/; Max-Age=${60 * 60 * 24 * 90}; SameSite=Lax; Secure`
    );
  }
  return res;
}
