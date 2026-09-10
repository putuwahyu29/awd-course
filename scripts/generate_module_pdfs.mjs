import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execFile } from 'child_process';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

function getBrowserExecutable() {
  if (process.platform === 'win32') {
    const winPaths = [
      'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
      'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
      'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    ];
    for (const p of winPaths) {
      if (fs.existsSync(p)) return p;
    }
  } else if (process.platform === 'darwin') {
    const macPaths = [
      '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
      '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    ];
    for (const p of macPaths) {
      if (fs.existsSync(p)) return p;
    }
  } else {
    // Linux / Ubuntu (GitHub Actions runner)
    const linuxPaths = [
      '/usr/bin/google-chrome',
      '/usr/bin/google-chrome-stable',
      '/usr/bin/chromium-browser',
      '/usr/bin/chromium',
      '/snap/bin/chromium',
    ];
    for (const p of linuxPaths) {
      if (fs.existsSync(p)) return p;
    }
  }
  return null;
}

function renderMarkdownText(text) {
  if (!text) return '';
  let out = text.replace(/\r\n/g, '\n');

  // Headings
  out = out.replace(/^### (.*$)/gim, '<h3 class="doc-h3">$1</h3>');
  out = out.replace(/^## (.*$)/gim, '<h2 class="doc-h2">$1</h2>');
  out = out.replace(/^# (.*$)/gim, '<h1 class="doc-h1">$1</h1>');

  // Bold & Italic
  out = out.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  out = out.replace(/\*([^*]+)\*/g, '<em>$1</em>');

  // Inline code
  out = out.replace(/`([^`]+)`/g, '<code class="doc-inline-code">$1</code>');

  // Tables
  out = out.replace(/((\|[^\n]+\|\n)((?:\|:?[-]+:?)+\|\n)((?:\|[^\n]+\|\n?)+))/g, (match, fullTable, headerRow, sepRow, bodyRows) => {
    const parseRow = (row, isHeader) => {
      const cells = row.trim().replace(/^\|/, '').replace(/\|$/, '').split('|');
      const tag = isHeader ? 'th' : 'td';
      return '<tr>' + cells.map((c) => `<${tag}>${c.trim()}</${tag}>`).join('') + '</tr>';
    };
    const thead = '<thead>' + parseRow(headerRow, true) + '</thead>';
    const tbody = '<tbody>' + bodyRows.trim().split('\n').map((r) => parseRow(r, false)).join('') + '</tbody>';
    return `<div class="table-wrap"><table class="doc-table">${thead}${tbody}</table></div>`;
  });

  // Blockquotes / Notes
  out = out.replace(/^>\s*(.*$)/gim, '<div class="doc-callout"><div class="callout-bar"></div><div class="callout-body">$1</div></div>');

  // Lists
  out = out.replace(/^\s*[-*]\s+(.*$)/gim, '<li class="doc-bullet-item">$1</li>');
  out = out.replace(/((?:<li class="doc-bullet-item">.*?<\/li>\s*)+)/gs, '<ul class="doc-list">$1</ul>');

  // Paragraphs
  const blocks = out.split(/\n\n+/);
  return blocks
    .map((b) => {
      const trimmed = b.trim();
      if (!trimmed) return '';
      if (
        trimmed.startsWith('<h') ||
        trimmed.startsWith('<div') ||
        trimmed.startsWith('<ul') ||
        trimmed.startsWith('<table')
      ) {
        return trimmed;
      }
      return `<p class="doc-p">${trimmed.replace(/\n/g, '<br/>')}</p>`;
    })
    .filter(Boolean)
    .join('\n');
}

function escapeHtml(str) {
  return (str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function parseNotebookToHtml(nbPath, title, subtitle, chapterNumber) {
  const nbRaw = fs.readFileSync(nbPath, 'utf8');
  const nb = JSON.parse(nbRaw);

  let sectionsHtml = '';

  for (const cell of nb.cells) {
    if (cell.cell_type === 'markdown') {
      const src = Array.isArray(cell.source) ? cell.source.join('') : cell.source;
      sectionsHtml += `<div class="doc-section doc-text-block">${renderMarkdownText(src)}</div>\n`;
    } else if (cell.cell_type === 'code') {
      const src = Array.isArray(cell.source) ? cell.source.join('') : cell.source;
      if (!src.trim()) continue;

      let outputsHtml = '';
      if (cell.outputs && cell.outputs.length > 0) {
        for (const out of cell.outputs) {
          if (out.text) {
            const outTxt = Array.isArray(out.text) ? out.text.join('') : out.text;
            outputsHtml += `<div class="code-output-box"><span class="out-label">Output Eksekusi:</span><pre class="out-pre"><code>${escapeHtml(outTxt.trim())}</code></pre></div>`;
          } else if (out.data && out.data['text/plain']) {
            const outTxt = Array.isArray(out.data['text/plain']) ? out.data['text/plain'].join('') : out.data['text/plain'];
            outputsHtml += `<div class="code-output-box"><span class="out-label">Output Eksekusi:</span><pre class="out-pre"><code>${escapeHtml(outTxt.trim())}</code></pre></div>`;
          }
        }
      }

      sectionsHtml += `
        <div class="doc-code-block-card">
          <div class="code-card-header">
            <span class="code-lang-tag">Python 3</span>
            <span class="code-badge">Contoh Kode Praktik</span>
          </div>
          <pre class="code-content"><code>${escapeHtml(src.trim())}</code></pre>
          ${outputsHtml}
        </div>
      `;
    }
  }

  const fullHtml = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>${title} - AWD Course</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap');

    @page {
      size: A4 portrait;
      margin: 18mm 16mm 18mm 16mm;
      @bottom-left {
        content: "AWD Course • Platform Pembelajaran Pemrograman & Analisis Data";
        font-size: 8pt;
        color: #64748b;
        font-family: 'Plus Jakarta Sans', sans-serif;
      }
      @bottom-right {
        content: "Halaman " counter(page);
        font-size: 8pt;
        font-weight: bold;
        color: #1e40af;
        font-family: 'Plus Jakarta Sans', sans-serif;
      }
    }

    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }

    body {
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 10pt;
      line-height: 1.65;
      color: #1e293b;
      background: #ffffff;
      margin: 0;
      padding: 0;
    }

    /* Cover Page */
    .cover-page {
      page-break-after: always;
      break-after: page;
      height: 94vh;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 2.5rem 1.5rem;
      border: 2px solid #e2e8f0;
      border-radius: 12px;
      position: relative;
      background: linear-gradient(145deg, #ffffff 0%, #f8fafc 100%);
    }

    .cover-brand {
      display: flex;
      align-items: center;
      gap: 0.85rem;
    }

    .brand-logo-icon {
      width: 42px;
      height: 42px;
      border-radius: 8px;
      background: #1e40af;
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      font-size: 18pt;
    }

    .brand-text {
      display: flex;
      flex-direction: column;
    }

    .brand-name {
      font-size: 14pt;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.5px;
    }

    .brand-tagline {
      font-size: 8.5pt;
      color: #64748b;
      font-weight: 500;
    }

    .cover-main {
      margin: auto 0;
    }

    .cover-badge-chip {
      display: inline-block;
      padding: 0.35rem 0.85rem;
      background: #eff6ff;
      color: #1d4ed8;
      border: 1px solid #bfdbfe;
      border-radius: 99px;
      font-size: 8.5pt;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 1.25rem;
    }

    .cover-title {
      font-size: 26pt;
      font-weight: 800;
      color: #0f172a;
      line-height: 1.2;
      margin: 0 0 1rem 0;
      letter-spacing: -0.5px;
    }

    .cover-subtitle {
      font-size: 12pt;
      color: #475569;
      margin: 0 0 2rem 0;
      line-height: 1.5;
    }

    .cover-highlights {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1rem;
      margin-top: 1.5rem;
    }

    .highlight-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 0.85rem 1rem;
    }

    .hl-title {
      font-size: 8.5pt;
      font-weight: 700;
      color: #64748b;
      text-transform: uppercase;
    }

    .hl-value {
      font-size: 10pt;
      font-weight: 700;
      color: #0f172a;
      margin-top: 0.2rem;
    }

    .cover-footer {
      border-top: 1px solid #e2e8f0;
      padding-top: 1.25rem;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
    }

    .instructor-info {
      display: flex;
      flex-direction: column;
      gap: 0.15rem;
    }

    .inst-label {
      font-size: 8pt;
      color: #64748b;
      font-weight: 600;
      text-transform: uppercase;
    }

    .inst-name {
      font-size: 11pt;
      font-weight: 700;
      color: #0f172a;
    }

    .pub-date {
      font-size: 8.5pt;
      color: #64748b;
    }

    /* Table of contents & intro */
    .toc-page {
      page-break-after: always;
      break-after: page;
      padding-top: 1rem;
    }

    .section-header-box {
      border-bottom: 2px solid #1e40af;
      padding-bottom: 0.5rem;
      margin-bottom: 1.5rem;
    }

    .section-main-title {
      font-size: 18pt;
      font-weight: 800;
      color: #0f172a;
      margin: 0;
    }

    /* Content Typography */
    .doc-h1 {
      font-size: 16pt;
      font-weight: 800;
      color: #0f172a;
      border-bottom: 1.5px solid #e2e8f0;
      padding-bottom: 0.4rem;
      margin: 2rem 0 0.85rem 0;
      page-break-after: avoid;
    }

    .doc-h2 {
      font-size: 13pt;
      font-weight: 700;
      color: #1e40af;
      margin: 1.6rem 0 0.65rem 0;
      page-break-after: avoid;
    }

    .doc-h3 {
      font-size: 11pt;
      font-weight: 700;
      color: #334155;
      margin: 1.25rem 0 0.5rem 0;
      page-break-after: avoid;
    }

    .doc-p {
      margin: 0 0 0.85rem 0;
      color: #334155;
      text-align: justify;
    }

    .doc-inline-code {
      font-family: 'JetBrains Mono', monospace;
      font-size: 8.5pt;
      background-color: #f1f5f9;
      border: 1px solid #e2e8f0;
      color: #0f172a;
      padding: 0.15rem 0.35rem;
      border-radius: 4px;
      font-weight: 600;
    }

    .doc-list {
      margin: 0.5rem 0 1rem 1.5rem;
      padding: 0;
    }

    .doc-bullet-item {
      margin-bottom: 0.35rem;
      color: #334155;
    }

    /* Callout box */
    .doc-callout {
      display: flex;
      background: #f8fafc;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      margin: 1rem 0;
      page-break-inside: avoid;
    }

    .callout-bar {
      width: 5px;
      background: #2563eb;
      border-radius: 6px 0 0 6px;
      flex-shrink: 0;
    }

    .callout-body {
      padding: 0.75rem 1rem;
      font-size: 9.5pt;
      color: #1e293b;
    }

    /* Tables */
    .table-wrap {
      margin: 1rem 0;
      overflow-x: auto;
      page-break-inside: avoid;
    }

    .doc-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 9pt;
      background: #ffffff;
    }

    .doc-table th {
      background: #f1f5f9;
      border: 1px solid #cbd5e1;
      padding: 0.5rem 0.75rem;
      font-weight: 700;
      color: #0f172a;
      text-align: left;
    }

    .doc-table td {
      border: 1px solid #e2e8f0;
      padding: 0.5rem 0.75rem;
      color: #334155;
      vertical-align: top;
    }

    .doc-table tr:nth-child(even) {
      background: #f8fafc;
    }

    /* Code Block Cards */
    .doc-code-block-card {
      margin: 1rem 0 1.25rem 0;
      background: #0f172a;
      border: 1px solid #1e293b;
      border-radius: 8px;
      overflow: hidden;
      page-break-inside: avoid;
      box-shadow: 0 2px 6px rgba(0,0,0,0.08);
    }

    .code-card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.4rem 0.85rem;
      background: #1e293b;
      border-bottom: 1px solid #334155;
    }

    .code-lang-tag {
      font-family: 'JetBrains Mono', monospace;
      font-size: 7.5pt;
      font-weight: 700;
      color: #93c5fd;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .code-badge {
      font-size: 7.5pt;
      color: #94a3b8;
    }

    .code-content {
      margin: 0;
      padding: 0.85rem 1rem;
      font-family: 'JetBrains Mono', monospace;
      font-size: 8.5pt;
      line-height: 1.5;
      color: #f8fafc;
      overflow-x: auto;
      white-space: pre-wrap;
      word-break: break-word;
    }

    /* Output Console Box */
    .code-output-box {
      border-top: 1px dashed #334155;
      background: #020617;
      padding: 0.65rem 1rem;
    }

    .out-label {
      display: block;
      font-size: 7.5pt;
      font-weight: 700;
      color: #10b981;
      text-transform: uppercase;
      margin-bottom: 0.25rem;
      font-family: 'JetBrains Mono', monospace;
    }

    .out-pre {
      margin: 0;
      font-family: 'JetBrains Mono', monospace;
      font-size: 8pt;
      color: #cbd5e1;
      white-space: pre-wrap;
      word-break: break-word;
    }

    /* Cheatsheet page break */
    .cheatsheet-section {
      page-break-before: always;
      break-before: page;
      padding-top: 1rem;
    }
  </style>
</head>
<body>

  <!-- Cover Page -->
  <div class="cover-page">
    <div class="cover-brand">
      <div class="brand-logo-icon">A</div>
      <div class="brand-text">
        <span class="brand-name">AWD COURSE</span>
        <span class="brand-tagline">Platform Pembelajaran Pemrograman & Analisis Data</span>
      </div>
    </div>

    <div class="cover-main">
      <div class="cover-badge-chip">Modul Referensi Resmi • Bab ${chapterNumber}</div>
      <h1 class="cover-title">${title}</h1>
      <p class="cover-subtitle">${subtitle}</p>

      <div class="cover-highlights">
        <div class="highlight-card">
          <div class="hl-title">Kategori Materi</div>
          <div class="hl-value">Dasar Python & Analisis Data</div>
        </div>
        <div class="highlight-card">
          <div class="hl-title">Format Dokumen</div>
          <div class="hl-value">PDF Interaktif Siap Cetak</div>
        </div>
        <div class="highlight-card">
          <div class="hl-title">Tingkat Kesulitan</div>
          <div class="hl-value">Pemula s/d Menengah</div>
        </div>
        <div class="highlight-card">
          <div class="hl-title">Akses Online</div>
          <div class="hl-value">course.awd.my.id</div>
        </div>
      </div>
    </div>

    <div class="cover-footer">
      <div class="instructor-info">
        <span class="inst-label">Pemateri & Penyusun Materi</span>
        <span class="inst-name">I Putu Agus Wahyu Dupayana</span>
        <span class="pub-date">Dipublikasikan secara resmi di AWD Course Platform</span>
      </div>
      <div class="pub-date">
        Edisi Pembaruan: <strong>September 2026</strong>
      </div>
    </div>
  </div>

  <!-- Content Stream -->
  <div class="doc-body-stream">
    ${sectionsHtml}
  </div>

</body>
</html>`;

  return fullHtml;
}

async function exportHtmlToPdf(htmlFilePath, pdfOutputPath) {
  const browserPath = getBrowserExecutable();
  if (!browserPath) {
    console.warn(`[WARN] Browser headless (Chrome/Edge) tidak ditemukan di sistem ini. Melewati ekspor: ${path.basename(pdfOutputPath)}`);
    return;
  }

  const fileUrl = 'file:///' + htmlFilePath.replace(/\\/g, '/');
  const args = [
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--no-pdf-header-footer',
    `--print-to-pdf=${pdfOutputPath}`,
    fileUrl,
  ];

  console.log(`Mengompilasi PDF via browser headless (${path.basename(browserPath)}): ${path.basename(pdfOutputPath)}...`);
  await execFileAsync(browserPath, args);
}

async function main() {
  console.log('=== AWD Course Automatic PDF Module Generator ===');

  const docsDir = path.join(rootDir, 'public', 'docs');
  const scratchDir = path.join(rootDir, 'scratch');
  if (!fs.existsSync(docsDir)) fs.mkdirSync(docsDir, { recursive: true });
  if (!fs.existsSync(scratchDir)) fs.mkdirSync(scratchDir, { recursive: true });

  // 1. Bab 1: Dasar Pemrograman Python
  const bab1NbPath = path.join(
    rootDir,
    'public',
    'notebooks',
    'python-data-science',
    'bab-1-dasar-pemrograman-python-lengkap.ipynb'
  );
  if (fs.existsSync(bab1NbPath)) {
    console.log('\n[1/2] Menyusun Dokumen Bab 1: Dasar Pemrograman Python...');
    const bab1Html = parseNotebookToHtml(
      bab1NbPath,
      'Dasar-Dasar Pemrograman Python',
      'Panduan referensi komprehensif sintaksis dasar, tipe data, variabel, operator logika, percabangan kondisional, perulangan loop, pembuatan fungsi, dan standar penulisan kode bersih.',
      1
    );
    const bab1HtmlFile = path.join(scratchDir, 'modul_bab1_rendered.html');
    fs.writeFileSync(bab1HtmlFile, bab1Html, 'utf8');

    const bab1PdfOut = path.join(docsDir, 'dasar-dasar-python.pdf');
    await exportHtmlToPdf(bab1HtmlFile, bab1PdfOut);
    const size1 = (fs.statSync(bab1PdfOut).size / 1024).toFixed(1);
    console.log(`✓ Berhasil dibuat: ${bab1PdfOut} (${size1} KB)`);
  } else {
    console.warn('Notebook Bab 1 tidak ditemukan di:', bab1NbPath);
  }

  // 2. Bab 2: Paket & Library Data Science
  const bab2NbPath = path.join(
    rootDir,
    'public',
    'notebooks',
    'python-data-science',
    'bab-2-package-data-science-lengkap.ipynb'
  );
  if (fs.existsSync(bab2NbPath)) {
    console.log('\n[2/2] Menyusun Dokumen Bab 2: Paket & Library Data Science...');
    const bab2Html = parseNotebookToHtml(
      bab2NbPath,
      'Paket & Library Data Science Python',
      'Panduan referensi komprehensif ekosistem data science: manajemen paket pip, komputasi array multidimensi NumPy, manipulasi DataFrame Pandas, visualisasi data Matplotlib & Seaborn, serta teknik impor dan ekspor data modern.',
      2
    );
    const bab2HtmlFile = path.join(scratchDir, 'modul_bab2_rendered.html');
    fs.writeFileSync(bab2HtmlFile, bab2Html, 'utf8');

    const bab2PdfOut = path.join(docsDir, 'package-data-science-python.pdf');
    await exportHtmlToPdf(bab2HtmlFile, bab2PdfOut);
    const size2 = (fs.statSync(bab2PdfOut).size / 1024).toFixed(1);
    console.log(`✓ Berhasil dibuat: ${bab2PdfOut} (${size2} KB)`);
  } else {
    console.warn('Notebook Bab 2 tidak ditemukan di:', bab2NbPath);
  }

  // 3. Bab 3: Analisis Data Eksploratif (EDA)
  const bab3NbPath = path.join(
    rootDir,
    'public',
    'notebooks',
    'python-data-science',
    'bab-3-analisis-data-eksploratif-lengkap.ipynb'
  );
  if (fs.existsSync(bab3NbPath)) {
    console.log('\n[3/3] Menyusun Dokumen Bab 3: Analisis Data Eksploratif (EDA)...');
    const bab3Html = parseNotebookToHtml(
      bab3NbPath,
      'Analisis Data Eksploratif (EDA) dengan Python',
      'Panduan komprehensif inspeksi struktur data (head, tail, info), kalkulasi statistik deskriptif mean/median/std, visualisasi distribusi histogram dan scatter plot, serta teknik seleksi data dan boolean indexing.',
      3
    );
    const bab3HtmlFile = path.join(scratchDir, 'modul_bab3_rendered.html');
    fs.writeFileSync(bab3HtmlFile, bab3Html, 'utf8');

    const bab3PdfOut = path.join(docsDir, 'analisis-data-eksploratif.pdf');
    await exportHtmlToPdf(bab3HtmlFile, bab3PdfOut);
    const size3 = (fs.statSync(bab3PdfOut).size / 1024).toFixed(1);
    console.log(`✓ Berhasil dibuat: ${bab3PdfOut} (${size3} KB)`);
  } else {
    console.warn('Notebook Bab 3 tidak ditemukan di:', bab3NbPath);
  }

  console.log('\n=== Semua Modul Dokumen PDF Berhasil Dibuat Secara Otomatis! ===');
}

main().catch((err) => {
  console.error('Terjadi kendala saat membuat PDF:', err);
  process.exit(1);
});
