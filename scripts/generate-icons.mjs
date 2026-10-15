// Renders the app icon, Android adaptive layers, splash and favicon into assets/.
// Run with: node scripts/generate-icons.mjs  (needs the `sharp` dev dependency)
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const assets = join(dirname(fileURLToPath(import.meta.url)), '..', 'assets');
const SIZE = 1024;

// Sleeping owl drawn on the same 200x220 grid as src/components/Owl.tsx, centered on (100, 115).
function owl({ scale, mono = false }) {
  const c = (color) => (mono ? '#FFFFFF' : color);
  const ink = mono ? '#000000' : '#2A1A0C';
  const marks = mono ? '#000000' : '#D9B48A';
  return `
    <g transform="translate(${SIZE / 2} ${SIZE / 2}) scale(${scale}) translate(-100 -115)">
      <path d="M50 62 L36 16 L84 46 Z" fill="${c('#5E4229')}" />
      <path d="M150 62 L164 16 L116 46 Z" fill="${c('#5E4229')}" />
      <ellipse cx="100" cy="124" rx="70" ry="84" fill="${mono ? '#FFFFFF' : 'url(#body)'}" />
      ${mono ? '' : `
      <ellipse cx="36" cy="142" rx="17" ry="46" fill="#5E4229" transform="rotate(12 36 142)" />
      <ellipse cx="164" cy="142" rx="17" ry="46" fill="#5E4229" transform="rotate(-12 164 142)" />
      <ellipse cx="100" cy="154" rx="46" ry="50" fill="#F3D9B1" />
      <circle cx="72" cy="96" r="36" fill="#B98556" />
      <circle cx="128" cy="96" r="36" fill="#B98556" />`}
      ${[[84, 136], [116, 136], [100, 152], [84, 168], [116, 168], [100, 184]]
        .map(([x, y]) => `<path d="M${x - 7} ${y} Q${x} ${y + 7} ${x + 7} ${y}" stroke="${marks}" stroke-width="3" stroke-linecap="round" fill="none" />`)
        .join('')}
      <path d="M55 98 Q72 109 89 98" stroke="${ink}" stroke-width="5" stroke-linecap="round" fill="none" />
      <path d="M111 98 Q128 109 145 98" stroke="${ink}" stroke-width="5" stroke-linecap="round" fill="none" />
      <path d="M91 114 L109 114 L100 131 Z" fill="${mono ? '#000000' : '#F59E0B'}" />
      ${[78, 122]
        .map((x) => [x - 8, x, x + 8].map((fx, i) => `<ellipse cx="${fx}" cy="${i === 1 ? 208 : 206}" rx="5" ry="7" fill="${c('#F59E0B')}" />`).join(''))
        .join('')}
    </g>`;
}

const defs = `
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#2E2A72" />
      <stop offset="1" stop-color="#0B0820" />
    </linearGradient>
    <radialGradient id="moonGlow" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stop-color="#FDE68A" stop-opacity="0.45" />
      <stop offset="1" stop-color="#FDE68A" stop-opacity="0" />
    </radialGradient>
    <linearGradient id="body" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#7C5A3A" />
      <stop offset="1" stop-color="#5E4229" />
    </linearGradient>
  </defs>`;

const stars = [
  [150, 170, 5], [300, 110, 4], [860, 150, 6], [910, 330, 4], [120, 420, 4], [880, 560, 5], [170, 700, 3], [800, 820, 4],
]
  .map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#FFFFFF" opacity="0.8" />`)
  .join('');

const background = `
  <rect width="${SIZE}" height="${SIZE}" fill="url(#bg)" />
  ${stars}
  <circle cx="${SIZE / 2}" cy="${SIZE / 2}" r="400" fill="url(#moonGlow)" />
  <circle cx="${SIZE / 2}" cy="${SIZE / 2}" r="300" fill="#FDE68A" opacity="0.92" />`;

const svg = (content) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" viewBox="0 0 ${SIZE} ${SIZE}">${defs}${content}</svg>`;

// Android keeps the adaptive-icon foreground inside a ~61% circle, so the owl is smaller there.
const files = {
  'icon.png': svg(background + owl({ scale: 3.1 })),
  'android-icon-background.png': svg(background),
  'android-icon-foreground.png': svg(owl({ scale: 2.3 })),
  'android-icon-monochrome.png': svg(owl({ scale: 2.3, mono: true })),
  'splash-icon.png': svg(owl({ scale: 4.2 })),
};

for (const [name, content] of Object.entries(files)) {
  let image = sharp(Buffer.from(content));
  // The App Store rejects icons with an alpha channel.
  if (name === 'icon.png') image = image.removeAlpha();
  await image.png().toFile(join(assets, name));
  console.log(`wrote assets/${name}`);
}

await sharp(Buffer.from(files['icon.png'])).resize(48, 48).png().toFile(join(assets, 'favicon.png'));
console.log('wrote assets/favicon.png');
