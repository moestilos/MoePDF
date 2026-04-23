import sharp from 'sharp';
import { mkdirSync } from 'node:fs';

mkdirSync('public/icons', { recursive: true });

const svg = (bg, pad) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0A0F0E"/>
      <stop offset="100%" stop-color="#0E1615"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="${pad ? 0 : 112}" fill="url(#g)"/>
  <g transform="translate(${pad ? 96 : 64}, ${pad ? 96 : 64}) scale(${pad ? 0.64 : 0.75})">
    <rect x="40" y="60" width="432" height="392" rx="56" fill="none" stroke="#2DD4BF" stroke-width="22"/>
    <path d="M140 260 l62 62 l170 -182" fill="none" stroke="#2DD4BF" stroke-width="34" stroke-linecap="round" stroke-linejoin="round"/>
  </g>
</svg>`;

async function gen(size, name, pad = false) {
  await sharp(Buffer.from(svg(null, pad))).resize(size, size).png().toFile(`public/icons/${name}`);
  console.log('wrote', name);
}

await gen(192, 'icon-192.png');
await gen(512, 'icon-512.png');
await gen(512, 'maskable-512.png', true);
// Apple touch icon sizes
await gen(120, 'apple-touch-icon-120.png');
await gen(152, 'apple-touch-icon-152.png');
await gen(167, 'apple-touch-icon-167.png');
await gen(180, 'apple-touch-icon.png');
