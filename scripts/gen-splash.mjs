import sharp from 'sharp';
import { mkdirSync } from 'node:fs';

mkdirSync('public/splash', { recursive: true });

// iPhone portrait dimensions (width x height at @2x/@3x px)
const devices = [
  { w: 1290, h: 2796, name: 'iphone-16-pro-max' },
  { w: 1179, h: 2556, name: 'iphone-16-pro' },
  { w: 1170, h: 2532, name: 'iphone-15' },
  { w: 1125, h: 2436, name: 'iphone-x' },
  { w: 828, h: 1792, name: 'iphone-xr' },
  { w: 750, h: 1334, name: 'iphone-se' },
];

const makeSvg = (w, h) => `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <radialGradient id="g" cx="50%" cy="45%" r="60%">
      <stop offset="0%" stop-color="#0E1615"/>
      <stop offset="100%" stop-color="#080C0B"/>
    </radialGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#g)"/>
  <g transform="translate(${w/2 - 80}, ${h/2 - 80})">
    <rect x="10" y="20" width="150" height="130" rx="24" fill="none" stroke="#2DD4BF" stroke-width="8"/>
    <path d="M44 90 l22 22 l58 -62" fill="none" stroke="#2DD4BF" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/>
  </g>
</svg>`;

for (const d of devices) {
  await sharp(Buffer.from(makeSvg(d.w, d.h))).png().toFile(`public/splash/${d.name}.png`);
  console.log('splash', d.name);
}
