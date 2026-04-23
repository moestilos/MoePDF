import sharp from 'sharp';
import { mkdirSync } from 'node:fs';

mkdirSync('public/icons', { recursive: true });

const svg = (bg, pad) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="${pad ? 0 : 96}" fill="${bg}"/>
  <g transform="translate(${pad ? 96 : 64}, ${pad ? 96 : 64}) scale(${pad ? 0.64 : 0.75})">
    <rect x="40" y="60" width="432" height="392" rx="48" fill="none" stroke="#14B8A6" stroke-width="22"/>
    <path d="M140 260 l62 62 l170 -182" fill="none" stroke="#14B8A6" stroke-width="34" stroke-linecap="round" stroke-linejoin="round"/>
  </g>
</svg>`;

async function gen(size, name, bg = '#0A0F0E', pad = false) {
  await sharp(Buffer.from(svg(bg, pad))).resize(size, size).png().toFile(`public/icons/${name}`);
  console.log('wrote', name);
}

await gen(192, 'icon-192.png');
await gen(512, 'icon-512.png');
await gen(512, 'maskable-512.png', '#0A0F0E', true);
await gen(180, 'apple-touch-icon.png');
