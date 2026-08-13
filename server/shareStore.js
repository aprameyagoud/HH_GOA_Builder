import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

// In-memory cache for fast lookup and serverless environments
const memoryCache = new Map();

// Local directory for temporary storage
const TEMP_DIR = path.resolve(process.cwd(), '.temp_shares');

// Ensure temp directory exists if filesystem is writable
try {
  if (!fs.existsSync(TEMP_DIR)) {
    fs.mkdirSync(TEMP_DIR, { recursive: true });
  }
} catch (e) {
  console.warn('Filesystem temp dir not available, using in-memory store only:', e.message);
}

// Format dimensions mapping
const FORMAT_DIMENSIONS = {
  pfp: { width: 1080, height: 1080 },
  builder_id: { width: 1200, height: 675 },
  team_frame: { width: 1200, height: 675 },
};

/**
 * Generate a unique, short, URL-friendly ID
 */
export function generateShareId() {
  return crypto.randomBytes(6).toString('base64url');
}

/**
 * Save a generated share asset
 */
export function saveShare({ id, format = 'pfp', caption = '', imageBuffer, baseUrl = '' }) {
  const shareId = id || generateShareId();
  const dimensions = FORMAT_DIMENSIONS[format] || { width: 1200, height: 675 };

  const record = {
    id: shareId,
    format,
    caption,
    width: dimensions.width,
    height: dimensions.height,
    imageBuffer,
    createdAt: Date.now()
  };

  // Store in memory
  memoryCache.set(shareId, record);

  // Store to disk if possible
  try {
    const filePath = path.join(TEMP_DIR, `${shareId}.png`);
    const metaPath = path.join(TEMP_DIR, `${shareId}.json`);
    fs.writeFileSync(filePath, imageBuffer);
    fs.writeFileSync(metaPath, JSON.stringify({
      id: shareId,
      format,
      caption,
      width: dimensions.width,
      height: dimensions.height,
      createdAt: record.createdAt
    }));
  } catch (e) {
    // Memory cache will still serve it
  }

  // Construct absolute URLs if baseUrl is provided
  const normalizedBase = baseUrl.replace(/\/$/, '');
  const shareUrl = `${normalizedBase}/share/${shareId}`;
  const imageUrl = `${normalizedBase}/api/image/${shareId}.png`;

  return {
    id: shareId,
    shareUrl,
    imageUrl,
    format,
    caption,
    width: dimensions.width,
    height: dimensions.height
  };
}

/**
 * Retrieve a share record by ID
 */
export function getShare(shareId) {
  if (!shareId) return null;

  // Clean shareId (remove .png extension if passed)
  const cleanId = shareId.replace(/\.png$/i, '');

  // 1. Check memory cache
  if (memoryCache.has(cleanId)) {
    const item = memoryCache.get(cleanId);
    return item;
  }

  // 2. Check disk cache
  try {
    const filePath = path.join(TEMP_DIR, `${cleanId}.png`);
    const metaPath = path.join(TEMP_DIR, `${cleanId}.json`);

    if (fs.existsSync(filePath)) {
      const imageBuffer = fs.readFileSync(filePath);
      let meta = {
        id: cleanId,
        format: 'pfp',
        caption: 'Framed for HH Goa 2026. 🌴 #FrameInGoa',
        width: 1080,
        height: 1080,
        createdAt: Date.now()
      };

      if (fs.existsSync(metaPath)) {
        try {
          meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
        } catch (e) {}
      }

      const record = {
        ...meta,
        imageBuffer
      };

      memoryCache.set(cleanId, record);
      return record;
    }
  } catch (e) {}

  return null;
}

/**
 * Clean up old shares (> 24h)
 */
export function cleanupOldShares(maxAgeMs = 24 * 60 * 60 * 1000) {
  const now = Date.now();

  // Clean memory cache
  for (const [id, record] of memoryCache.entries()) {
    if (now - record.createdAt > maxAgeMs) {
      memoryCache.delete(id);
    }
  }

  // Clean disk cache
  try {
    if (fs.existsSync(TEMP_DIR)) {
      const files = fs.readdirSync(TEMP_DIR);
      for (const file of files) {
        const filePath = path.join(TEMP_DIR, file);
        const stats = fs.statSync(filePath);
        if (now - stats.mtimeMs > maxAgeMs) {
          fs.unlinkSync(filePath);
        }
      }
    }
  } catch (e) {}
}
