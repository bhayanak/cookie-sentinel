import { execSync } from 'child_process';
import { mkdirSync, writeFileSync, readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const distDir = resolve(root, 'dist');
const outDir = resolve(root, 'dist-firefox');

mkdirSync(outDir, { recursive: true });

// Read manifest and convert MV3 → Firefox-compatible
const manifestPath = resolve(distDir, 'manifest.json');
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));

// Firefox-specific adjustments
manifest.browser_specific_settings = {
  gecko: {
    id: 'cookie-monster@extension',
    strict_min_version: '109.0',
  },
};

// Firefox uses background.scripts instead of service_worker
if (manifest.background?.service_worker) {
  manifest.background = {
    scripts: [manifest.background.service_worker],
    type: 'module',
  };
}

// Write modified manifest
writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

const xpiName = `cookie-monster-firefox-v${process.env.npm_package_version || '1.0.0'}.xpi`;
execSync(`cd "${distDir}" && zip -r "${resolve(outDir, xpiName)}" .`, { stdio: 'inherit' });

console.log(`✅ Firefox package created: dist-firefox/${xpiName}`);
