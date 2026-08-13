// src/lib/templates.js

export const pfpTemplate = {
  id: 'pfp',
  name: 'PFP FRAME',
  width: 1080,
  height: 1080,
  bg: '#004121', // dark green
  photoRegion: { x: 0, y: 0, w: 1080, h: 1080, radius: 0 },
  mask: '/assets/hhgoa/pfp-mask.svg',
  layers: [
    { type: 'image', src: '/assets/hhgoa/pfp-frame.svg', x: 0, y: 0, w: 1080, h: 1080 },
    { type: 'image', src: '/assets/hhgoa/flowers.svg', x: 0, y: 0, w: 1080, h: 1080 },
    { type: 'image', src: '/assets/hhgoa/scooter.svg', x: 540, y: 800, w: 300, h: 200 }
    // Note: the precise layers and SVG files need to be adjusted once assets are reviewed
  ]
};

export const builderIdTemplate = {
  id: 'builder_id',
  name: 'BUILDER ID',
  width: 1080,
  height: 1350,
  bg: '#FDF9EC', // cream
  photoRegion: { x: 90, y: 90, w: 900, h: 600, radius: 0 },
  layers: [
    // placeholder layout, will require adjustment to actual assets
    { type: 'image', src: '/assets/hhgoa/builder-frame.svg', x: 0, y: 0, w: 1080, h: 1350 },
    { type: 'text', key: 'name', x: 90, y: 760, font: '60px Imbue', color: '#004121', align: 'left', maxWidth: 900 },
    { type: 'text', key: 'builderTitle', x: 90, y: 840, font: 'bold 40px "Victor Mono"', color: '#FF0080', align: 'left', maxWidth: 900 },
    { type: 'text', key: 'stack', x: 90, y: 920, font: '30px "Victor Mono"', color: '#000000', align: 'left', maxWidth: 900 },
    { type: 'text', key: 'team', x: 90, y: 970, font: '30px "Victor Mono"', color: '#000000', align: 'left', maxWidth: 900 },
    { type: 'image', src: '/assets/hhgoa/qr-frame.svg', x: 790, y: 1060, w: 200, h: 200 }
  ]
};

export const teamFrameTemplate = {
  id: 'team_frame',
  name: 'TEAM FRAME',
  width: 1080,
  height: 1350,
  bg: '#004121',
  photoRegion: { x: 90, y: 90, w: 900, h: 600, radius: 0 },
  layers: [
    { type: 'image', src: '/assets/hhgoa/team-frame.svg', x: 0, y: 0, w: 1080, h: 1350 },
    { type: 'text', key: 'teamName', x: 90, y: 760, font: '60px Imbue', color: '#FEE101', align: 'left', maxWidth: 900 },
    { type: 'text', key: 'quote', x: 90, y: 840, font: 'italic 30px "Victor Mono"', color: '#FFFFFF', align: 'left', maxWidth: 900 },
    { type: 'text', key: 'membersText', x: 90, y: 920, font: '30px "Victor Mono"', color: '#FFFFFF', align: 'left', maxWidth: 900 }
  ]
};

export const templates = [pfpTemplate, builderIdTemplate, teamFrameTemplate];
