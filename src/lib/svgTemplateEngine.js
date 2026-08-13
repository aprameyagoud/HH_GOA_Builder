// src/lib/svgTemplateEngine.js
import QRCode from 'qrcode';
import { fontStyles } from './fontsBase64.js';

// Cache for loaded raw template SVGs
const templateCache = {};

async function fetchTemplateSvg(filename) {
  if (templateCache[filename]) {
    return templateCache[filename];
  }
  let text;
  if (typeof window === 'undefined') {
    const fs = await import(/* @vite-ignore */ 'fs');
    const path = await import(/* @vite-ignore */ 'path');
    text = fs.readFileSync(path.join(process.cwd(), 'public', 'assets', 'hhgoa', filename), 'utf8');
  } else {
    const res = await fetch(`/assets/hhgoa/${encodeURIComponent(filename)}`);
    text = await res.text();
  }
  templateCache[filename] = text;
  return text;
}

function escapeXml(unsafe) {
  if (!unsafe) return '';
  return String(unsafe)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function generateQrDataUrl(text) {
  try {
    return await QRCode.toDataURL(text || 'https://hhgoa.com', {
      color: {
        dark: '#FF0080',
        light: '#FEE101'
      },
      margin: 1,
      width: 400
    });
  } catch (e) {
    console.warn('QR Code generation error:', e);
    return null;
  }
}

// Convert image File or Blob to Data URL
export function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    if (!file) return resolve(null);
    if (typeof file === 'string') return resolve(file);
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Render dynamic Builder ID SVG
export async function buildBuilderIdSvg({ photoDataUrl, crop, name, builderTitle, stack, team, xHandle, qrText }) {
  let svg = await fetchTemplateSvg('Individual Final.svg');

  // Inject embedded fonts
  if (svg.includes('<defs>')) {
    svg = svg.replace('<defs>', `<defs><style>${fontStyles}</style>`);
  }

  // 1. Photo in Postage Stamp Frame (x=110, y=105.888, w=322, h=464)
  const patternRegex = /<pattern\s+id="pattern5_92_760"[^>]*>[\s\S]*?<\/pattern>/;
  if (photoDataUrl) {
    const scale = crop?.scale || 1;
    const panX = crop?.x || 0;
    const panY = crop?.y || 0;

    const newPattern = `
      <pattern id="pattern5_92_760" patternUnits="userSpaceOnUse" width="322" height="464" x="110" y="105.888">
        <g transform="translate(161, 232)">
          <image href="${photoDataUrl}" x="${-161 * scale + panX}" y="${-232 * scale + panY}" width="${322 * scale}" height="${464 * scale}" preserveAspectRatio="xMidYMid slice" />
        </g>
      </pattern>
    `;
    svg = svg.replace(patternRegex, newPattern);
  } else {
    // Clean, branded empty placeholder clipped to the exact same stamp region
    const emptyPattern = `
      <pattern id="pattern5_92_760" patternUnits="userSpaceOnUse" width="322" height="464" x="110" y="105.888">
        <rect width="322" height="464" fill="#032012" />
        <rect x="10" y="10" width="302" height="444" rx="6" fill="none" stroke="#FEE101" stroke-width="1.5" stroke-dasharray="6 6" stroke-opacity="0.4" />
        <g transform="translate(161, 232)">
          <circle cx="0" cy="-35" r="30" fill="rgba(254, 225, 1, 0.1)" stroke="#FEE101" stroke-width="2" stroke-opacity="0.8" />
          <path d="M-10 -35 H10 M0 -45 V-25" stroke="#FEE101" stroke-width="3" stroke-linecap="round" />
          <text x="0" y="18" text-anchor="middle" font-family="'Victor Mono', monospace" font-size="15px" font-weight="700" fill="#FEE101" letter-spacing="2px">+ ADD PHOTO</text>
          <text x="0" y="42" text-anchor="middle" font-family="'Victor Mono', monospace" font-size="11px" font-weight="500" fill="rgba(255,255,255,0.65)" letter-spacing="1px">PORTRAIT / SQUARE</text>
        </g>
      </pattern>
    `;
    svg = svg.replace(patternRegex, emptyPattern);
  }

  // Remove demo image reference
  svg = svg.replace(/<image\s+id="image2_92_760"[^>]*\/>/g, '');

  // 2. Dynamic QR Code
  const qrUrl = await generateQrDataUrl(qrText || xHandle ? `https://x.com/${(xHandle || '').replace('@', '')}` : 'https://hhgoa.com');
  if (qrUrl) {
    svg = svg.replace(/<image\s+id="image11_92_760"[^>]*>/, `<image id="image11_92_760" width="530" height="530" href="${qrUrl}"/>`);
  }

  // 3. Remove static Figma paths for text
  svg = svg.replace(/<path\s+d="M503\.629\s+167[^"]*"[^>]*fill="#FEE101"[^>]*\/>/, '');
  svg = svg.replace(/<rect\s+x="504"\s+y="211"\s+width="316"\s+height="42"\s+rx="21"\s+fill="#FF0080"\s*\/>/, '');
  svg = svg.replace(/<path\s+d="M521\.536\s+242[^"]*"[^>]*fill="#FEE101"[^>]*\/>/, '');
  svg = svg.replace(/<path\s+d="M504\.818\s+356\.016[^"]*"[^>]*fill="#F60280"[^>]*\/>/, '');
  svg = svg.replace(/<path\s+d="M505\.203\s+446\.124[^"]*"[^>]*fill="#F60280"[^>]*\/>/, '');
  svg = svg.replace(/<path\s+d="M544\.58\s+528\.515[^"]*"[^>]*fill="#F60280"[^>]*\/>/, '');

  // 4. Inject Dynamic Text elements
  const safeName = escapeXml(name || 'YOUR NAME').toUpperCase();
  const safeTitle = escapeXml(builderTitle || 'BUILDER TITLE').toUpperCase();
  const safeStack = escapeXml(stack || 'YOUR STACK').toUpperCase();
  const safeTeam = escapeXml(team || 'YOUR TEAM').toUpperCase();
  const safeX = escapeXml(xHandle || '');

  const titleWidth = Math.max(260, safeTitle.length * 15 + 40);

  const dynamicTextGroup = `
    <!-- DYNAMIC USER TEXTS -->
    <g id="dynamic-user-text">
      <!-- NAME -->
      <text x="504" y="182" font-family="'Imbue', serif" font-size="64px" font-weight="900" fill="#FEE101" letter-spacing="2px">${safeName}</text>
      
      <!-- BUILDER TITLE PILL BADGE -->
      <rect x="504" y="211" width="${titleWidth}" height="42" rx="21" fill="#FF0080" />
      <text x="522" y="239" font-family="'Victor Mono', monospace" font-size="20px" font-weight="700" fill="#FEE101" letter-spacing="1px">${safeTitle}</text>
      
      <!-- STACK -->
      <text x="505" y="354" font-family="'Victor Mono', monospace" font-size="22px" font-weight="700" fill="#FF0080" letter-spacing="0.5px">${safeStack}</text>
      
      <!-- TEAM -->
      ${safeTeam ? `<text x="505" y="444" font-family="'Victor Mono', monospace" font-size="22px" font-weight="700" fill="#FF0080" letter-spacing="0.5px">${safeTeam}</text>` : ''}
      
      <!-- X HANDLE -->
      ${safeX ? `<text x="535" y="525" font-family="'Victor Mono', monospace" font-size="22px" font-weight="700" fill="#FF0080">${safeX}</text>` : ''}
    </g>
  `;

  svg = svg.replace('</svg>', `${dynamicTextGroup}</svg>`);
  return svg;
}

// Render dynamic PFP SVG
export async function buildPfpSvg({ photoDataUrl, crop }) {
  let svg = await fetchTemplateSvg('PFPFInal.svg');

  // Inject embedded fonts
  if (svg.includes('<defs>')) {
    svg = svg.replace('<defs>', `<defs><style>${fontStyles}</style>`);
  }

  // 1. User photo in circular center region
  const patternRegex = /<pattern\s+id="pattern0_61_6017"[^>]*>[\s\S]*?<\/pattern>/;
  if (photoDataUrl) {
    const scale = crop?.scale || 1;
    const panX = crop?.x || 0;
    const panY = crop?.y || 0;

    const newPattern = `
      <pattern id="pattern0_61_6017" patternUnits="userSpaceOnUse" width="1080" height="1080">
        <g transform="translate(540, 540)">
          <image href="${photoDataUrl}" x="${-540 * scale + panX}" y="${-540 * scale + panY}" width="${1080 * scale}" height="${1080 * scale}" preserveAspectRatio="xMidYMid slice" />
        </g>
      </pattern>
    `;
    svg = svg.replace(patternRegex, newPattern);
  } else {
    // Clean, branded circular placeholder
    const emptyPattern = `
      <pattern id="pattern0_61_6017" patternUnits="userSpaceOnUse" width="1080" height="1080">
        <rect width="1080" height="1080" fill="#032012" />
        <circle cx="540" cy="540" r="375" fill="none" stroke="#FEE101" stroke-width="2.5" stroke-dasharray="8 8" stroke-opacity="0.4" />
        <g transform="translate(540, 540)">
          <circle cx="0" cy="-45" r="44" fill="rgba(254, 225, 1, 0.1)" stroke="#FEE101" stroke-width="2.5" stroke-opacity="0.8" />
          <path d="M-15 -45 H15 M0 -60 V-30" stroke="#FEE101" stroke-width="3.5" stroke-linecap="round" />
          <text x="0" y="32" text-anchor="middle" font-family="'Victor Mono', monospace" font-size="26px" font-weight="700" fill="#FEE101" letter-spacing="3px">+ ADD PHOTO</text>
          <text x="0" y="66" text-anchor="middle" font-family="'Victor Mono', monospace" font-size="14px" font-weight="500" fill="rgba(255,255,255,0.65)" letter-spacing="1.5px">SQUARE / PROFILE PHOTO</text>
        </g>
      </pattern>
    `;
    svg = svg.replace(patternRegex, emptyPattern);
  }

  // Remove demo image reference
  svg = svg.replace(/<image\s+id="image0_61_6017"[^>]*\/>/g, '');

  // 2. Remove the bird/parrot illustration (pattern7, pattern5, pattern8, pattern1, pattern6) completely
  svg = svg.replace(/<path[^>]+fill="url\(#pattern7_61_6017\)"[^>]*\/>/g, '');
  svg.match(/<rect[^>]+fill="url\(#pattern5_61_6017\)"\/>/g)?.forEach(m => { svg = svg.replace(m, ''); });
  svg.match(/<rect[^>]+fill="url\(#pattern8_61_6017\)"\/>/g)?.forEach(m => { svg = svg.replace(m, ''); });
  svg.match(/<rect[^>]+fill="url\(#pattern1_61_6017\)"\/>/g)?.forEach(m => { svg = svg.replace(m, ''); });
  svg = svg.replace(/<path[^>]+fill="url\(#pattern6_61_6190\)"[^>]*\/>/g, '');

  return svg;
}

// Render dynamic Team Frame SVG
export async function buildTeamFrameSvg({ photoDataUrl, crop, teamName, members, quote, qrText }) {
  let svg = await fetchTemplateSvg('teamFinal.svg');

  // Inject embedded fonts
  if (svg.includes('<defs>')) {
    svg = svg.replace('<defs>', `<defs><style>${fontStyles}</style>`);
  }

  // 1. Team Photo in Center Stamp Frame (x=349, y=84, w=461, h=317)
  const patternRegex = /<pattern\s+id="pattern10_99_2142"[^>]*>[\s\S]*?<\/pattern>/;
  if (photoDataUrl) {
    const scale = crop?.scale || 1;
    const panX = crop?.x || 0;
    const panY = crop?.y || 0;

    const newPattern = `
      <pattern id="pattern10_99_2142" patternUnits="userSpaceOnUse" width="461" height="317" x="349" y="84">
        <g transform="translate(230.5, 158.5)">
          <image href="${photoDataUrl}" x="${-230.5 * scale + panX}" y="${-158.5 * scale + panY}" width="${461 * scale}" height="${317 * scale}" preserveAspectRatio="xMidYMid slice" />
        </g>
      </pattern>
    `;
    svg = svg.replace(patternRegex, newPattern);
  } else {
    // Clean, branded empty team photo placeholder
    const emptyPattern = `
      <pattern id="pattern10_99_2142" patternUnits="userSpaceOnUse" width="461" height="317" x="349" y="84">
        <rect width="461" height="317" fill="#032012" />
        <rect x="10" y="10" width="441" height="297" rx="6" fill="none" stroke="#FEE101" stroke-width="1.5" stroke-dasharray="6 6" stroke-opacity="0.4" />
        <g transform="translate(230.5, 158.5)">
          <circle cx="0" cy="-30" r="30" fill="rgba(254, 225, 1, 0.1)" stroke="#FEE101" stroke-width="2" stroke-opacity="0.8" />
          <path d="M-10 -30 H10 M0 -40 V-20" stroke="#FEE101" stroke-width="3" stroke-linecap="round" />
          <text x="0" y="20" text-anchor="middle" font-family="'Victor Mono', monospace" font-size="16px" font-weight="700" fill="#FEE101" letter-spacing="2px">+ ADD TEAM PHOTO</text>
          <text x="0" y="44" text-anchor="middle" font-family="'Victor Mono', monospace" font-size="11px" font-weight="500" fill="rgba(255,255,255,0.65)" letter-spacing="1px">LANDSCAPE / GROUP PHOTO</text>
        </g>
      </pattern>
    `;
    svg = svg.replace(patternRegex, emptyPattern);
  }

  // Remove demo image reference
  svg = svg.replace(/<image\s+id="image6_99_2142"[^>]*\/>/g, '');

  // 2. QR Code
  const qrUrl = await generateQrDataUrl(qrText || 'https://hhgoa.com');
  if (qrUrl) {
    svg = svg.replace(/<image\s+id="image3_99_2142"[^>]*>/, `<image id="image3_99_2142" width="530" height="530" href="${qrUrl}"/>`);
  }

  // 3. Remove static sample text paths
  svg = svg.replace(/<path\s+d="M331\.536\s+537[^"]*"[^>]*fill="#FEE101"[^>]*\/>/, '');
  svg = svg.replace(/<path\s+d="M331\.665\s+604[^"]*"[^>]*fill="#F60280"[^>]*\/>/, '');
  svg = svg.replace(/<path\s+d="M106\.4\s+278\.392[^"]*"[^>]*fill="#FEE101"[^>]*\/>/, '');

  // 4. Inject Dynamic Text elements
  const safeTeamName = escapeXml(teamName || 'YOUR TEAM NAME').toUpperCase();
  const safeMembers = escapeXml((members || []).filter(Boolean).join(' · ')).toUpperCase();
  const safeQuote = escapeXml(quote ? `"${quote}"` : '');

  const dynamicTextGroup = `
    <!-- DYNAMIC TEAM TEXTS -->
    <g id="dynamic-team-text">
      <!-- TEAM NAME -->
      <text x="580" y="534" text-anchor="middle" font-family="'Imbue', serif" font-size="56px" font-weight="900" fill="#FEE101" letter-spacing="2px">${safeTeamName}</text>
      
      <!-- MEMBERS -->
      ${safeMembers ? `<text x="580" y="598" text-anchor="middle" font-family="'Victor Mono', monospace" font-size="22px" font-weight="700" fill="#FF0080" letter-spacing="0.5px">${safeMembers}</text>` : ''}
      
      <!-- QUOTE -->
      ${safeQuote ? `
      <foreignObject x="80" y="200" width="230" height="150">
        <div xmlns="http://www.w3.org/1999/xhtml" style="display: flex; align-items: center; justify-content: center; width: 100%; height: 100%; text-align: center; font-family: 'Victor Mono', monospace; font-size: 18px; font-style: italic; font-weight: 600; color: #FEE101; line-height: 1.2;">
          ${safeQuote}
        </div>
      </foreignObject>
      ` : ''}
    </g>
  `;

  svg = svg.replace('</svg>', `${dynamicTextGroup}</svg>`);
  return svg;
}

// Convert SVG string to Canvas and export Blob
export function svgToCanvasBlob(svgString, width, height) {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    const img = new Image();
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      ctx.drawImage(img, 0, 0, width, height);
      URL.revokeObjectURL(url);
      canvas.toBlob((blob) => {
        resolve(blob);
      }, 'image/png', 1.0);
    };

    img.onerror = (err) => {
      URL.revokeObjectURL(url);
      reject(err);
    };

    img.src = url;
  });
}
