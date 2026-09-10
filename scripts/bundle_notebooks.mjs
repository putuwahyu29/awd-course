#!/usr/bin/env node
/**
 * scripts/bundle_notebooks.mjs
 *
 * Menggabungkan seluruh file notebook submateri modular (.ipynb) per bab
 * menjadi satu file notebook bab komprehensif (.ipynb) yang selalu 100% sinkron.
 *
 * Jalankan via terminal:
 *   npm run notebooks:bundle
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const CHAPTER_CONFIGS = [
  {
    chapterId: 'bab-1',
    title: 'Bab 1: Dasar Pemrograman Python & Algoritma',
    description: 'Notebook kompilasi lengkap untuk Bab 1 yang mencakup Komentar, Tipe Data & Variabel, Operator, Percabangan, Perulangan, Fungsi, serta Studi Kasus Praktik Kalkulator Interaktif.',
    sourceDir: path.join(rootDir, 'public/notebooks/python-data-science/bab-1-dasar-python'),
    targetFile: path.join(rootDir, 'public/notebooks/python-data-science/bab-1-dasar-pemrograman-python-lengkap.ipynb'),
  },
  {
    chapterId: 'bab-2',
    title: 'Bab 2: Ekosistem Paket & Sains Data Python',
    description: 'Notebook kompilasi lengkap untuk Bab 2 yang mencakup Pip, NumPy, Pandas, Matplotlib, Seaborn, Impor/Ekspor Data CSV, dan Mini Proyek Analisis Inventaris.',
    sourceDir: path.join(rootDir, 'public/notebooks/python-data-science/bab-2-package-python'),
    targetFile: path.join(rootDir, 'public/notebooks/python-data-science/bab-2-package-data-science-lengkap.ipynb'),
  },
  {
    chapterId: 'bab-3',
    title: 'Bab 3: Analisis Data Eksploratif (EDA)',
    description: 'Notebook kompilasi lengkap untuk Bab 3 yang mencakup Inspeksi Struktur Dataframe, Statistik Deskriptif, Visualisasi Distribusi, dan Seleksi Data Boolean.',
    sourceDir: path.join(rootDir, 'public/notebooks/python-data-science/bab-3-analisis-data-eksploratif'),
    targetFile: path.join(rootDir, 'public/notebooks/python-data-science/bab-3-analisis-data-eksploratif-lengkap.ipynb'),
  },
];

function bundleChapter(cfg) {
  if (!fs.existsSync(cfg.sourceDir)) {
    console.warn(`[WARN] Folder submateri tidak ditemukan: ${cfg.sourceDir}`);
    return null;
  }

  const files = fs
    .readdirSync(cfg.sourceDir)
    .filter((f) => f.endsWith('.ipynb'))
    .sort();

  if (files.length === 0) {
    console.warn(`[WARN] Tidak ada file .ipynb ditemukan di: ${cfg.sourceDir}`);
    return null;
  }

  const headerCell = {
    cell_type: 'markdown',
    metadata: {},
    source: [
      `# ${cfg.title}\n`,
      '\n',
      '**Awd Course - Buku Modul Praktik Komprehensif**\n',
      '\n',
      `${cfg.description}\n`,
      '\n',
      '---\n',
    ],
  };

  const combinedCells = [headerCell];
  let baseMetadata = null;
  let nbformat = 4;
  let nbformat_minor = 2;

  files.forEach((file, fIdx) => {
    const filePath = path.join(cfg.sourceDir, file);
    try {
      const raw = fs.readFileSync(filePath, 'utf8');
      const data = JSON.parse(raw);

      if (!baseMetadata && data.metadata) {
        baseMetadata = data.metadata;
      }
      if (data.nbformat) nbformat = data.nbformat;
      if (data.nbformat_minor) nbformat_minor = data.nbformat_minor;

      const cells = data.cells || [];
      cells.forEach((cell) => {
        // Deep clone cell object
        const clonedCell = JSON.parse(JSON.stringify(cell));
        clonedCell.metadata = clonedCell.metadata || {};
        clonedCell.metadata.sublesson_file = file;
        combinedCells.push(clonedCell);
      });
    } catch (err) {
      console.error(`[ERROR] Gagal membaca file ${file}:`, err.message);
    }
  });

  const bundledNotebook = {
    cells: combinedCells,
    metadata: baseMetadata || {
      language_info: {
        name: 'python',
        version: '3.11',
      },
    },
    nbformat,
    nbformat_minor,
  };

  fs.writeFileSync(cfg.targetFile, JSON.stringify(bundledNotebook, null, 1), 'utf8');
  const stat = fs.statSync(cfg.targetFile);
  const sizeKb = (stat.size / 1024).toFixed(1);

  return {
    chapter: cfg.title,
    filesCount: files.length,
    totalCells: combinedCells.length,
    outputFile: path.relative(rootDir, cfg.targetFile),
    sizeKb,
  };
}

export function bundleAll(verbose = true) {
  if (verbose) console.log('🚀 Memulai Sinkronisasi dan Penggabungan Notebook per Bab...\n');

  const results = [];
  for (const cfg of CHAPTER_CONFIGS) {
    const res = bundleChapter(cfg);
    if (res) results.push(res);
  }

  if (verbose) {
    console.table(results);
    console.log('\n✨ Semua file notebook bab lengkap berhasil disinkronkan 100% dari submateri!');
  }
  return results;
}

export { CHAPTER_CONFIGS, bundleChapter };

// Run if called directly
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  bundleAll(true);
}

