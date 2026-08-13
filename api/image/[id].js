import { getShare } from '../../server/shareStore.js';

export default async function handler(req, res) {
  const { id } = req.query;
  const cleanId = (id || '').replace(/\.png$/i, '');
  const share = getShare(cleanId);

  if (!share || !share.imageBuffer) {
    return res.status(404).send('Image not found');
  }

  res.setHeader('Content-Type', 'image/png');
  res.setHeader('Content-Length', share.imageBuffer.length);
  res.setHeader('Cache-Control', 'public, max-age=86400, immutable');
  return res.status(200).send(share.imageBuffer);
}
