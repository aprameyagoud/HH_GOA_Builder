import { getShare } from '../server/shareStore.js';
import { renderSharePageHtml } from '../server/renderSharePage.js';

export default async function handler(req, res) {
  const { id } = req.query;
  const cleanId = (id || '').split('/')[0];
  const share = getShare(cleanId);

  const protocol = req.headers['x-forwarded-proto'] || 'https';
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  const baseUrl = `${protocol}://${host}`;

  if (!share) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(404).send(`<!DOCTYPE html>
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
    </html>`);
  }

  const html = renderSharePageHtml({
    shareId: share.id,
    format: share.format,
    caption: share.caption,
    baseUrl,
    width: share.width,
    height: share.height
  });

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  return res.status(200).send(html);
}
