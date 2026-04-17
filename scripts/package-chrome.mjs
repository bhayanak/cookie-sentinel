import { execSync } from 'child_process';
import { mkdirSync, cpSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const distDir = resolve(root, 'dist');
const outDir = resolve(root, 'dist-chrome');

mkdirSync(outDir, { recursive: true });

// Copy dist to a temp folder and zip it
const zipName = `cookie-monster-chrome-v${process.env.npm_package_version || '1.0.0'}.zip`;
execSync(`cd "${distDir}" && zip -r "${resolve(outDir, zipName)}" .`, { stdio: 'inherit' });

console.log(`✅ Chrome package created: dist-chrome/${zipName}`);
