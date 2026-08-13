// src/lib/graphicsRenderer.js

// Utility to load an image source (Blob, File, URL) into an HTMLImageElement
const loadImage = (src) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous'; // helpful if any assets are on a CDN
    img.onload = () => resolve(img);
    img.onerror = (e) => {
      console.warn(`Failed to load image: ${src}`, e);
      resolve(null); // Return null on failure so it doesn't break the whole render
    };
    if (src instanceof Blob) {
      img.src = URL.createObjectURL(src);
    } else {
      img.src = src;
    }
  });
};

export const renderGraphic = async ({
  template,
  photoFile,
  cropData,
  formData // name, builderTitle, stack, teamName, members, quote, xHandle, qrData
}) => {
  const canvas = document.createElement('canvas');
  canvas.width = template.width;
  canvas.height = template.height;
  const ctx = canvas.getContext('2d');

  // Fill background
  ctx.fillStyle = template.bg || '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw user photo if provided
  if (photoFile && template.photoRegion) {
    const photoImg = await loadImage(photoFile);
    if (photoImg) {
      ctx.save();
      
      const pr = template.photoRegion;
      
      // Basic support for rounded masks if specified, otherwise just clip to the rect
      if (pr.radius) {
        ctx.beginPath();
        ctx.roundRect(pr.x, pr.y, pr.w, pr.h, pr.radius);
        ctx.clip();
      } else {
        ctx.beginPath();
        ctx.rect(pr.x, pr.y, pr.w, pr.h);
        ctx.clip();
      }

      // If user supplied crop/zoom data, use it, else center cover
      if (cropData) {
        // Calculate crop bounds
        // This is a simplified crop logic; a real app would use zoom/pan variables
        const scale = cropData.scale || 1;
        const dx = cropData.x || 0;
        const dy = cropData.y || 0;
        
        // drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh)
        // We'll keep it simple: draw scaled image at offset
        const dw = photoImg.width * scale;
        const dh = photoImg.height * scale;
        // Center the scaled image, apply user offset
        const cx = pr.x + pr.w / 2 - dw / 2 + dx;
        const cy = pr.y + pr.h / 2 - dh / 2 + dy;
        
        ctx.drawImage(photoImg, cx, cy, dw, dh);
      } else {
        // Default cover
        const scale = Math.max(pr.w / photoImg.width, pr.h / photoImg.height);
        const dw = photoImg.width * scale;
        const dh = photoImg.height * scale;
        const dx = pr.x + pr.w / 2 - dw / 2;
        const dy = pr.y + pr.h / 2 - dh / 2;
        ctx.drawImage(photoImg, dx, dy, dw, dh);
      }

      ctx.restore();
    }
  }

  // Draw layered assets (SVGs, text, etc.)
  for (const layer of template.layers) {
    if (layer.type === 'image') {
      const img = await loadImage(layer.src);
      if (img) {
        ctx.drawImage(img, layer.x, layer.y, layer.w, layer.h);
      }
    } else if (layer.type === 'text') {
      let textContent = '';
      if (layer.key === 'membersText' && formData.members) {
        textContent = formData.members.join(' · ');
      } else {
        textContent = formData[layer.key];
      }

      if (textContent) {
        ctx.font = layer.font;
        ctx.fillStyle = layer.color;
        ctx.textAlign = layer.align || 'left';
        ctx.textBaseline = 'top';
        ctx.fillText(textContent.toUpperCase(), layer.x, layer.y, layer.maxWidth);
      }
    }
  }

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob);
    }, 'image/png', 1.0);
  });
};
