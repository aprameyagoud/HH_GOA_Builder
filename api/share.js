import { saveShare } from '../server/shareStore.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    const { format, caption, imageBase64, id } = req.body || {};

    if (!imageBase64) {
      return res.status(400).json({ error: 'Missing imageBase64' });
    }

    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
    const imageBuffer = Buffer.from(base64Data, 'base64');

    const protocol = req.headers['x-forwarded-proto'] || 'https';
    const host = req.headers['x-forwarded-host'] || req.headers.host;
    const baseUrl = `${protocol}://${host}`;

    const result = saveShare({
      id,
      format,
      caption,
      imageBuffer,
      baseUrl
    });

    return res.status(200).json({
      success: true,
      id: result.id,
      shareUrl: result.shareUrl,
      imageUrl: result.imageUrl,
      format: result.format,
      caption: result.caption
    });
  } catch (err) {
    console.error('Vercel API share error:', err);
    return res.status(500).json({ error: 'Failed to process share' });
  }
}
