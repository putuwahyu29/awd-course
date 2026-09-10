#!/usr/bin/env node
/**
 * scripts/split_notebooks.mjs
 *
 * Memecah kembali file notebook kompilasi bab lengkap (.ipynb) ke file-file
 * submateri modular (.ipynb) masing-masing secara otomatis.
 *
 * Berguna jika Anda mengedit langsung file bab lengkap di Jupyter / Google Colab
 * dan ingin menyinkronkan perubahannya kembali ke setiap submateri.
 *
 * Jalankan via terminal:
 *   npm run notebooks:split
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { CHAPTER_CONFIGS } from './bundle_notebooks.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

export function splitChapter(cfg) {
  if (!fs.existsSync(cfg.targetFile)) {
    console.warn(`[WARN] File bab lengkap tidak ditemukan: ${cfg.targetFile}`);
    return null;
  }

  if (!fs.existsSync(cfg.sourceDir)) {
    fs.mkdirSync(cfg.sourceDir, { recursive: true });
  }

  const raw = fs.readFileSync(cfg.targetFile, 'utf8');
  let bundledData;
  try {
    bundledData = JSON.parse(raw);
  } catch (err) {
    console.error(`[ERROR] Gagal membaca JSON dari ${cfg.targetFile}:`, err.message);
    return null;
  }

  const existingFiles = fs.existsSync(cfg.sourceDir)
    ? fs.readdirSync(cfg.sourceDir).filter((f) => f.endsWith('.ipynb')).sort()
    : [];

  const cells = bundledData.cells || [];
  if (cells.length === 0) {
    console.warn(`[WARN] Tidak ada sel di dalam ${cfg.targetFile}`);
    return null;
  }

  // Group cells by target sublesson file
  const groupedCells = new Map();
  existingFiles.forEach((f) => groupedCells.set(f, []));

  let currentTargetFile = existingFiles[0] || '01-materi.ipynb';

  cells.forEach((cell, idx) => {
    // Skip the top banner cell if it matches the chapter title header
    if (idx === 0 && cell.cell_type === 'markdown') {
      const srcText = Array.isArray(cell.source) ? cell.source.join('') : cell.source || '';
      if (srcText.includes(cfg.title) && srcText.includes('Buku Modul Praktik')) {
        return; // skip banner
      }
    }

    if (cell.metadata?.sublesson_file) {
      currentTargetFile = cell.metadata.sublesson_file;
    }

    if (!groupedCells.has(currentTargetFile)) {
      groupedCells.set(currentTargetFile, []);
    }

    // Clone cell and remove internal sync marker from individual file for cleanliness
    const clonedCell = JSON.parse(JSON.stringify(cell));
    if (clonedCell.metadata?.sublesson_file) {
      delete clonedCell.metadata.sublesson_file;
    }

    groupedCells.get(currentTargetFile).push(clonedCell);
  });

  let writtenCount = 0;
  for (const [fileName, fileCells] of groupedCells.entries()) {
    if (fileCells.length === 0) continue;

    const outPath = path.join(cfg.sourceDir, fileName);
    const notebookContent = {
      cells: fileCells,
      metadata: bundledData.metadata || {
        language_info: {
          name: 'python',
          version: '3.11',
        },
      },
      nbformat: bundledData.nbformat || 4,
      nbformat_minor: bundledData.nbformat_minor || 2,
    };

    fs.writeFileSync(outPath, JSON.stringify(notebookContent, null, 1), 'utf8');
    writtenCount++;
  }

  return {
    chapter: cfg.title,
    inputFile: path.relative(rootDir, cfg.targetFile),
    sublessonsUpdated: writtenCount,
    sourceDir: path.relative(rootDir, cfg.sourceDir),
  };
}

export function splitAll(verbose = true) {
  if (verbose) console.log('🔄 Memulai Pemecahan (Split) Notebook Bab ke Submateri...\n');

  const results = [];
  for (const cfg of CHAPTER_CONFIGS) {
    const res = splitChapter(cfg);
    if (res) results.push(res);
  }

  if (verbose) {
    console.table(results);
    console.log('\n✨ Seluruh file submateri berhasil disinkronkan dari file bab lengkap!');
  }
  return results;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  splitAll(true);
}
