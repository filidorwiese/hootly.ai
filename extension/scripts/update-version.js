import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

const packageJson = JSON.parse(readFileSync('../package.json', 'utf-8'));
const version = packageJson.version;

console.log(`Updating manifest versions to ${version}...`);

// Determine target based on TARGET env var
const target = process.env.TARGET;
if (!target) {
  console.error('TARGET environment variable not set (should be "firefox" or "chrome")');
  process.exit(1);
}

const distDir = target === 'chrome' ? 'dist/chrome' : 'dist/firefox';
const manifestPath = resolve(distDir, 'manifest.json');

try {
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8'));
  manifest.version = version;
  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
  console.log(`✓ Updated ${manifestPath} to version ${version}`);
} catch (error) {
  console.error(`Failed to update ${manifestPath}:`, error.message);
  process.exit(1);
}
