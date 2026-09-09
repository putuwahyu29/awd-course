#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const args = process.argv.slice(2);
const isClear = args.includes('--clear');

function getAllNotebookFiles(dir = 'public/notebooks') {
  const results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir, { withFileTypes: true });
  for (const item of list) {
    const full = path.join(dir, item.name);
    if (item.isDirectory()) {
      if (!item.name.includes('.ipynb_checkpoints')) {
        results.push(...getAllNotebookFiles(full));
      }
    } else if (item.name.endsWith('.ipynb')) {
      results.push(full);
    }
  }
  return results;
}

// Bersihkan properti outputs yang tidak sengaja menempel di markdown cell
function sanitizeNotebook(filepath) {
  try {
    const raw = fs.readFileSync(filepath, 'utf8');
    const data = JSON.parse(raw);
    let changed = false;
    for (const cell of data.cells || []) {
      if (cell.cell_type === 'markdown') {
        if ('outputs' in cell) {
          delete cell.outputs;
          changed = true;
        }
        if ('execution_count' in cell) {
          delete cell.execution_count;
          changed = true;
        }
      }
    }
    if (changed) {
      fs.writeFileSync(filepath, JSON.stringify(data, null, 1), 'utf8');
    }
  } catch {
    // ignore
  }
}

// Bersihkan seluruh output sel kode
function clearNotebook(filepath) {
  try {
    const raw = fs.readFileSync(filepath, 'utf8');
    const data = JSON.parse(raw);
    for (const cell of data.cells || []) {
      if (cell.cell_type === 'code') {
        cell.outputs = [];
        cell.execution_count = null;
      }
      if (cell.cell_type === 'markdown') {
        delete cell.outputs;
        delete cell.execution_count;
      }
    }
    fs.writeFileSync(filepath, JSON.stringify(data, null, 1), 'utf8');
    console.log(`[BERSIH] Output dibersihkan: ${filepath}`);
    return true;
  } catch (e) {
    console.error(`[GAGAL] Gagal membersihkan ${filepath}: ${e.message}`);
    return false;
  }
}

// Eksekusi notebook menggunakan jupyter nbconvert
function executeNotebook(filepath) {
  sanitizeNotebook(filepath);
  console.log(`\n[MENJALANKAN] ${filepath} ...`);
  const start = Date.now();
  try {
    execSync(
      `jupyter nbconvert --to notebook --execute --inplace "${filepath}"`,
      { stdio: 'inherit' }
    );
    const duration = ((Date.now() - start) / 1000).toFixed(2);
    console.log(`[SUKSES] Selesai dieksekusi dalam ${duration} detik.`);
    return true;
  } catch (e) {
    const duration = ((Date.now() - start) / 1000).toFixed(2);
    console.error(`[GAGAL] Eksekusi terhenti setelah ${duration} detik: ${e.message}`);
    return false;
  }
}

const targetFiles = args.filter((a) => !a.startsWith('--')).length > 0
  ? args.filter((a) => !a.startsWith('--'))
  : getAllNotebookFiles();

if (targetFiles.length === 0) {
  console.log('Tidak ada file .ipynb yang ditemukan.');
  process.exit(0);
}

if (isClear) {
  console.log(`Membersihkan output dari ${targetFiles.length} file notebook...`);
  for (const f of targetFiles) {
    clearNotebook(f);
  }
  console.log('Semua output berhasil dibersihkan!');
  process.exit(0);
}

console.log('='.repeat(65));
console.log(` Memulai eksekusi ${targetFiles.length} Jupyter Notebook di lokal`);
console.log(' Seluruh output (print, tabel DataFrame, chart) akan tersimpan statis');
console.log('='.repeat(65));

let success = 0;
let fail = 0;

for (const f of targetFiles) {
  if (executeNotebook(f)) success++;
  else fail++;
}

console.log('\n' + '='.repeat(65));
console.log(` Selesai: ${success} Berhasil, ${fail} Gagal dari ${targetFiles.length} file notebook.`);
console.log(' Sekarang Anda dapat melakukan git commit & push ke serverless!');
console.log('='.repeat(65));
