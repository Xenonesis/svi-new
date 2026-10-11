import { copyFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const srcDir = join(root, 'node_modules', 'maplibre-gl', 'dist');
const targetDir = join(root, 'public', 'maplibre');

if (existsSync(srcDir)) {
  if (!existsSync(targetDir)) {
    mkdirSync(targetDir, { recursive: true });
  }
  const workerSrc = join(srcDir, 'maplibre-gl-worker.mjs');
  const sharedSrc = join(srcDir, 'maplibre-gl-shared.mjs');
  if (existsSync(workerSrc) && existsSync(sharedSrc)) {
    copyFileSync(workerSrc, join(targetDir, 'maplibre-gl-worker.mjs'));
    copyFileSync(sharedSrc, join(targetDir, 'maplibre-gl-shared.mjs'));
    console.log('✓ MapLibre worker assets synced to public/maplibre/');
  }
}
