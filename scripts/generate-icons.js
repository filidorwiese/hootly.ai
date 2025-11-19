import sharp from 'sharp';
import { readFileSync } from 'fs';
import { mkdirSync } from 'fs';

const svg = readFileSync('public/icons/icon.svg');

mkdirSync('dist/icons', { recursive: true });

// Generate PNG icons in different sizes
const sizes = [16, 48, 128];

for (const size of sizes) {
  await sharp(svg)
    .resize(size, size)
    .png()
    .toFile(`dist/icons/icon-${size}.png`);

  console.log(`Generated icon-${size}.png`);
}

console.log('All icons generated successfully');
