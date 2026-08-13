import { saveShare, getShare, cleanupOldShares } from './shareStore.js';
import { renderSharePageHtml } from './renderSharePage.js';

/**
 * Express / Connect / Vite compatible middleware for share API & pages
 */
export function createShareMiddleware() {
  // Periodic cleanup every hour
  setInterval(() => {
    cleanupOldShares();
  }, 60 * 60 * 1000);

  return function shareMiddleware(req, res, next) {
    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    const pathname = url.pathname;
    const protocol = req.headers['x-forwarded-proto'] || (req.socket?.encrypted ? 'https' : 'http');
    const host = req.headers['x-forwarded-host'] || req.headers.host || 'localhost:5173';
    const baseUrl = `${protocol}://${host}`;

    // 1. POST /api/share
    if (pathname === '/api/share' && req.method === 'POST') {
      let body = '';
      req.on('data', chunk => {
        body += chunk;
        // Limit upload size to 25MB
        if (body.length > 25 * 1024 * 1024) {
          res.writeHead(413, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Payload too large' }));
          req.destroy();
        }
      });

      req.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          const { format, caption, imageBase64, id } = parsed;

          if (!imageBase64) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Missing imageBase64' }));
            return;
          }

          // Strip data URL prefix if present
          const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
          const imageBuffer = Buffer.from(base64Data, 'base64');

          const result = saveShare({
            id,
            format,
            caption,
            imageBuffer,
            baseUrl
          });

          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            success: true,
            id: result.id,
            shareUrl: result.shareUrl,
            imageUrl: result.imageUrl,
            format: result.format,
            caption: result.caption
          }));
        } catch (err) {
          console.error('API share error:', err);
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Failed to process share' }));
        }
      });
      return;
    }

    // 2. GET /api/image/:id or /api/image/:id.png
    if (pathname.startsWith('/api/image/')) {
      const shareId = pathname.replace('/api/image/', '').replace(/\.png$/i, '');
      const share = getShare(shareId);

      if (!share || !share.imageBuffer) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Image not found');
        return;
      }

      res.writeHead(200, {
        'Content-Type': 'image/png',
        'Content-Length': share.imageBuffer.length,
        'Cache-Control': 'public, max-age=86400, immutable'
      });
      res.end(share.imageBuffer);
      return;
    }

    // 3. GET /share/:id
    if (pathname.startsWith('/share/')) {
      const shareId = pathname.replace('/share/', '').split('/')[0];
      const share = getShare(shareId);

      if (!share) {
        // Render fallback or redirect
        const fallbackHtml = `<!DOCTYPE html>
        <html>
        <head>
          <title>HH Goa 2026 Frame</title>
          <meta http-equiv="refresh" content="3; url=/" />
          <style>
            body { background: #004121; color: #FEE101; font-family: monospace; text-align: center; padding: 4rem 1rem; }
            a { color: #FF0080; }
          </style>
        </head>
        <body>
          <h1>Frame Not Found or Expired</h1>
          <p>Redirecting to <a href="/">HH Goa Frame Builder</a> in 3 seconds...</p>
        </body>
        </html>`;
        res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(fallbackHtml);
        return;
      }

      const html = renderSharePageHtml({
        shareId: share.id,
        format: share.format,
        caption: share.caption,
        baseUrl,
        width: share.width,
        height: share.height
      });

      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(html);
      return;
    }

    next();
  };
}
