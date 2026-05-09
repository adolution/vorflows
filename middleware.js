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

  // Desktop bleibt deterministisch auf Variant A (Fixes sind mobile-only).
  if (!isMobile) return next();

  // Optional: ?ab=A|B query-param erlaubt manuelles Override (für QA).
  const override = url.searchParams.get('ab');
  let bucket = override === 'A' || override === 'B'
    ? override
    : (req.headers.get('cookie')?.match(/(?:^|; )vf_ab=([AB])/) || [])[1];

  if (!bucket) bucket = Math.random() < 0.5 ? 'A' : 'B';

  const target = bucket === 'B' ? '/index-b.html' : '/index.html';
  const res = url.pathname === target ? next() : rewrite(new URL(target, url));

  // Cookie 90d sticky setzen, falls noch nicht vorhanden.
  const cookieHeader = req.headers.get('cookie') || '';
  if (!cookieHeader.includes('vf_ab=')) {
    res.headers.append(
      'set-cookie',
      `vf_ab=${bucket}; Path=/; Max-Age=${60 * 60 * 24 * 90}; SameSite=Lax; Secure`
    );
  }
  return res;
}
