import http from 'http';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';
import { execFile } from 'child_process';
import { promisify } from 'util';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT) || 3001;
const execFileP = promisify(execFile);

let _browserPromise = null;
async function getBrowser() {
  if (!_browserPromise) {
    _browserPromise = (async () => {
      const { default: puppeteer } = await import('puppeteer');
      return puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
    })();
  }
  return _browserPromise;
}

const VIEWER_CHROME_HIDE = `
  html, body { background: transparent !important; background-color: transparent !important; }
  .frame { background: transparent !important; background-image: none !important; outline: 0 !important; }
  .frame-wrap { background: transparent !important; border: 0 !important; padding: 0 !important; }
  .frame-meta, .frame-actions, .viewer-head { display: none !important; }
`;

async function captureFrame({ id, format = 'png', scale = 2.4, kind = 'white' }) {
  const browser = await getBrowser();
  const page = await browser.newPage();
  try {
    await page.setViewport({ width: 800, height: 800, deviceScaleFactor: scale });
    await page.goto(`http://localhost:${PORT}/carousels/boxes/`, { waitUntil: 'networkidle0' });
    await page.evaluateHandle('document.fonts.ready');
    await new Promise(r => setTimeout(r, 1200));
    await page.addStyleTag({ content: VIEWER_CHROME_HIDE });
    await page.evaluate((fid) => {
      const el = document.querySelector(`[data-export-id="${fid}"]`);
      if (!el) throw new Error('frame not found: ' + fid);
      el.scrollIntoView({ block: 'center', inline: 'center' });
    }, id);
    await new Promise(r => setTimeout(r, 250));
    const handle = await page.$(`[data-export-id="${id}"]`);
    if (!handle) throw new Error('frame not found: ' + id);
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'boxes-'));
    const pngPath = path.join(tmpDir, `${id}.png`);
    await handle.screenshot({
      path: pngPath,
      omitBackground: kind === 'transparent',
      captureBeyondViewport: false,
    });
    let outPath = pngPath;
    let mime = 'image/png';
    if (format === 'webp') {
      outPath = path.join(tmpDir, `${id}.webp`);
      const flags = kind === 'transparent'
        ? ['-q', '95', '-m', '6', '-exact', '-alpha_q', '100']
        : ['-q', '95', '-m', '6'];
      await execFileP('cwebp', [...flags, pngPath, '-o', outPath]);
      mime = 'image/webp';
    } else if (format === 'jpg' || format === 'jpeg') {
      outPath = path.join(tmpDir, `${id}.jpg`);
      await execFileP('sips', ['-s', 'format', 'jpeg', '-s', 'formatOptions', '95', pngPath, '--out', outPath]);
      mime = 'image/jpeg';
    }
    const buf = fs.readFileSync(outPath);
    fs.rmSync(tmpDir, { recursive: true });
    return { buf, mime };
  } finally {
    await page.close();
  }
}

const MIME = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.mjs': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.webp': 'image/webp',
  '.mp4': 'video/mp4',
  '.xml': 'application/xml',
  '.txt': 'text/plain',
  '.m3u8': 'application/vnd.apple.mpegurl',
};

const server = http.createServer((req, res) => {
  if (req.method === 'GET' && req.url.startsWith('/api/box-export')) {
    (async () => {
      try {
        const u = new URL(req.url, `http://localhost:${PORT}`);
        const id = u.searchParams.get('id');
        const format = (u.searchParams.get('format') || 'png').toLowerCase();
        const scale = parseFloat(u.searchParams.get('scale') || '2.4');
        const kind = id && id.endsWith('-transparent') ? 'transparent' : 'white';
        if (!id || !/^[a-z0-9-]+$/i.test(id)) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'invalid id' }));
          return;
        }
        if (!['png', 'jpg', 'jpeg', 'webp'].includes(format)) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'unsupported format (use png|jpg|webp)' }));
          return;
        }
        const { buf, mime } = await captureFrame({ id, format, scale, kind });
        const ext = format === 'jpeg' ? 'jpg' : format;
        res.writeHead(200, {
          'Content-Type': mime,
          'Content-Disposition': `attachment; filename="${id}.${ext}"`,
          'Content-Length': buf.length,
        });
        res.end(buf);
      } catch (e) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: e.message }));
      }
    })();
    return;
  }

  if (req.method === 'POST' && req.url === '/api/carousel/save') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const { file, mainHtml } = JSON.parse(body);
        if (typeof file !== 'string' || typeof mainHtml !== 'string') {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'file and mainHtml required' }));
          return;
        }
        const carouselsRoot = path.join(__dirname, 'carousels');
        const target = path.resolve(path.join(__dirname, file));
        if (!target.startsWith(carouselsRoot + path.sep) || !target.endsWith('index.html')) {
          res.writeHead(403, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'path outside carousels/' }));
          return;
        }
        const original = fs.readFileSync(target, 'utf8');
        const re = /(<main class="viewer-grid">)([\s\S]*?)(<\/main>)/;
        if (!re.test(original)) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'main.viewer-grid block not found' }));
          return;
        }
        const updated = original.replace(re, `$1\n${mainHtml}\n  $3`);
        fs.writeFileSync(target, updated, 'utf8');
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true, file }));
      } catch (e) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: e.message }));
      }
    });
    return;
  }

  let urlPath = req.url.split('?')[0];

  if (urlPath.endsWith('/')) {
    urlPath += 'index.html';
  }

  const filePath = path.join(__dirname, urlPath);
  const ext = path.extname(filePath);
  const contentType = MIME[ext] || 'application/octet-stream';

  fs.stat(filePath, (statErr, stat) => {
    if (statErr || !stat.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end(`404 Not Found: ${urlPath}`);
      return;
    }

    const range = req.headers.range;
    if (range) {
      const match = /bytes=(\d*)-(\d*)/.exec(range);
      const start = match && match[1] ? parseInt(match[1], 10) : 0;
      const end = match && match[2] ? parseInt(match[2], 10) : stat.size - 1;
      if (start >= stat.size || end >= stat.size) {
        res.writeHead(416, { 'Content-Range': `bytes */${stat.size}` });
        res.end();
        return;
      }
      res.writeHead(206, {
        'Content-Type': contentType,
        'Content-Range': `bytes ${start}-${end}/${stat.size}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': end - start + 1,
      });
      fs.createReadStream(filePath, { start, end }).pipe(res);
      return;
    }

    res.writeHead(200, {
      'Content-Type': contentType,
      'Content-Length': stat.size,
      'Accept-Ranges': 'bytes',
    });
    fs.createReadStream(filePath).pipe(res);
  });
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
