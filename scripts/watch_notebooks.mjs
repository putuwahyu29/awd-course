#!/usr/bin/env node
/**
 * scripts/watch_notebooks.mjs
 *
 * Pemantau otomatis (Watcher) file notebook submateri.
 * Setiap kali ada perubahan / penyimpanan (Ctrl+S) pada file .ipynb submateri,
 * skrip ini langsung menggabungkan kembali ke file bab lengkap (.ipynb) secara otomatis.
 *
 * Jalankan via terminal:
 *   npm run notebooks:watch
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { CHAPTER_CONFIGS, bundleAll } from './bundle_notebooks.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('👀 Memulai Notebook Watcher (Auto-Sync Submateri ke Bab Lengkap)...');
console.log('Tekan Ctrl+C untuk berhenti.\n');

// Initial sync
bundleAll(true);

let debounceTimer = null;
const watchedDirs = CHAPTER_CONFIGS.map((cfg) => cfg.sourceDir).filter((d) => fs.existsSync(d));

watchedDirs.forEach((dir) => {
  const relDir = path.relative(rootDir, dir);
  console.log(`[WATCHING] Memantau folder: ${relDir}`);

  fs.watch(dir, { recursive: true }, (eventType, filename) => {
    if (!filename || !filename.endsWith('.ipynb')) return;

    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      console.log(`\n⚡ Terdeteksi perubahan pada: ${filename} (${eventType})`);
      console.log('🔄 Memperbarui seluruh notebook bab...');
      try {
        bundleAll(true);
      } catch (err) {
        console.error('❌ Gagal sinkronisasi:', err.message);
      }
    }, 400);
  });
});
