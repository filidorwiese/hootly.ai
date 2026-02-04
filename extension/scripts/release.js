import { execSync } from 'child_process';
import { createWriteStream, readFileSync } from 'fs';
import archiver from 'archiver';

const packageJson = JSON.parse(readFileSync('../package.json', 'utf-8'));
const version = packageJson.version;
const outDir = 'dist/';

console.log(`Creating release archives for Hootly v${version}...`);

// Build both versions
console.log('\n📦 Building Firefox and Chrome versions...');
execSync('npm run build', { stdio: 'inherit' });

// Create Firefox zip
console.log('\n🦊 Creating Firefox release zip...');
const firefoxZip = `${outDir}/hootly-firefox-${version}.zip`;
const firefoxOutput = createWriteStream(firefoxZip);
const firefoxArchive = archiver('zip', { zlib: { level: 9 } });

firefoxOutput.on('close', () => {
  console.log(`✓ Firefox: ${firefoxZip} (${Math.round(firefoxArchive.pointer() / 1024)} KB)`);
});

firefoxArchive.on('error', (err) => {
  throw err;
});

firefoxArchive.pipe(firefoxOutput);
firefoxArchive.directory('dist/firefox/', false);
await firefoxArchive.finalize();

// Create Chrome zip
console.log('\n🌐 Creating Chrome release zip...');
const chromeZip = `${outDir}/hootly-chrome-${version}.zip`;
const chromeOutput = createWriteStream(chromeZip);
const chromeArchive = archiver('zip', { zlib: { level: 9 } });

chromeOutput.on('close', () => {
  console.log(`✓ Chrome: ${chromeZip} (${Math.round(chromeArchive.pointer() / 1024)} KB)`);
});

chromeArchive.on('error', (err) => {
  throw err;
});

chromeArchive.pipe(chromeOutput);
chromeArchive.directory('dist/chrome/', false);
await chromeArchive.finalize();

console.log('\n✨ Release archives created successfully!');
