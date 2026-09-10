#!/usr/bin/env node
/**
 * scripts/sync_notebooks.mjs
 *
 * Smart Auto-Sync:
 * Mendeteksi secara cerdas file mana yang terakhir kali diubah:
 * - Jika Anda mengedit file Bab Lengkap (.ipynb) -> Otomatis di-split ke submateri.
 * - Jika Anda mengedit salah satu file Submateri (.ipynb) -> Otomatis di-bundle ke bab lengkap.
 * - Jika sudah sinkron -> Tidak ada penulisan ulang.
 *
 * Sangat aman untuk Vercel CI/CD build dan workflow lokal.
 * Jalankan via terminal:
 *   npm run notebooks:sync
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';
import { CHAPTER_CONFIGS, bundleChapter } from './bundle_notebooks.mjs';
import { splitChapter } from './split_notebooks.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

function getGitCommitTime(filePath) {
  try {
    const out = execSync(`git log -1 --format="%ct" -- "${filePath}"`, {
      cwd: rootDir,
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'ignore'],
    }).trim();
    if (out) return parseInt(out, 10) * 1000;
  } catch (e) {}
  return 0;
}

export function smartSyncChapter(cfg) {
  const targetExists = fs.existsSync(cfg.targetFile);
  const sourceExists = fs.existsSync(cfg.sourceDir);

  const sourceFiles = sourceExists
    ? fs.readdirSync(cfg.sourceDir).filter((f) => f.endsWith('.ipynb'))
    : [];

  if (!targetExists && sourceFiles.length > 0) {
    console.log(`[SYNC] ${cfg.chapterId}: Bab lengkap belum ada -> Melakukan Bundle dari Submateri.`);
    return bundleChapter(cfg);
  }

  if (targetExists && sourceFiles.length === 0) {
    console.log(`[SYNC] ${cfg.chapterId}: Submateri belum ada -> Melakukan Split dari Bab Lengkap.`);
    return splitChapter(cfg);
  }

  if (!targetExists && sourceFiles.length === 0) {
    return null;
  }

  const targetFsMtime = fs.statSync(cfg.targetFile).mtimeMs;
  let latestSourceFsMtime = 0;
  sourceFiles.forEach((file) => {
    const fPath = path.join(cfg.sourceDir, file);
    const mtime = fs.statSync(fPath).mtimeMs;
    if (mtime > latestSourceFsMtime) latestSourceFsMtime = mtime;
  });

  const fsDiffMs = targetFsMtime - latestSourceFsMtime;
  let syncDirection = 0; // 0 = in sync, 1 = split (target is newer), -1 = bundle (source is newer)
  let reason = '';

  // 1. Cek perubahan di file system lokal (misal sedang coding di VS Code/Jupyter)
  if (Math.abs(fsDiffMs) > 1500) {
    syncDirection = fsDiffMs > 0 ? 1 : -1;
    reason = `File system mtime (${Math.round(Math.abs(fsDiffMs) / 1000)}s)`;
  } else {
    // 2. Cek riwayat Git Commit (krusial untuk Vercel CI/CD & Colab direct push ke GitHub)
    const targetGitTime = getGitCommitTime(cfg.targetFile);
    const sourceGitTime = getGitCommitTime(cfg.sourceDir);
    const gitDiffMs = targetGitTime - sourceGitTime;

    if (Math.abs(gitDiffMs) > 2000) {
      syncDirection = gitDiffMs > 0 ? 1 : -1;
      reason = `Git commit timestamp (${Math.round(Math.abs(gitDiffMs) / 1000)}s)`;
    }
  }

  if (syncDirection === 1) {
    console.log(`[SYNC] ${cfg.chapterId}: File Bab Lengkap lebih baru [${reason}] -> Memperbarui Submateri (Split)...`);
    const res = splitChapter(cfg);
    alignTimestamps(cfg);
    return res;
  } else if (syncDirection === -1) {
    console.log(`[SYNC] ${cfg.chapterId}: File Submateri lebih baru [${reason}] -> Memperbarui Bab Lengkap (Bundle)...`);
    const res = bundleChapter(cfg);
    alignTimestamps(cfg);
    return res;
  } else {
    console.log(`[SYNC] ${cfg.chapterId}: Konten sudah sinkron.`);
    return {
      chapter: cfg.title,
      status: 'In Sync',
      targetFile: path.relative(rootDir, cfg.targetFile),
    };
  }
}

function alignTimestamps(cfg) {
  const now = new Date();
  if (fs.existsSync(cfg.targetFile)) {
    fs.utimesSync(cfg.targetFile, now, now);
  }
  if (fs.existsSync(cfg.sourceDir)) {
    const files = fs.readdirSync(cfg.sourceDir).filter((f) => f.endsWith('.ipynb'));
    files.forEach((f) => {
      try {
        fs.utimesSync(path.join(cfg.sourceDir, f), now, now);
      } catch (e) {}
    });
  }
}

export function smartSyncAll(verbose = true) {
  if (verbose) console.log('⚡ Menjalankan Smart Notebook Auto-Sync (Bi-Directional)...\n');

  const results = [];
  for (const cfg of CHAPTER_CONFIGS) {
    const res = smartSyncChapter(cfg);
    if (res) results.push(res);
  }

  if (verbose) {
    console.log('\n✨ Proses sinkronisasi selesai.');
  }
  return results;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  smartSyncAll(true);
}
