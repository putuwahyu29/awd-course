export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

export function getChapterSlugs(chapterTitle: string, index: number): { fullSlug: string; shortSlug: string } {
  const fullSlug = slugify(chapterTitle);

  // Try extracting "bab-X" from chapterTitle like "Bab 1: Dasar..."
  const match = chapterTitle.match(/^bab\s*(\d+)/i);
  const shortSlug = match ? `bab-${match[1]}` : `bab-${index + 1}`;

  return { fullSlug, shortSlug };
}

export interface ChapterNotebookInfo {
  title: string;
  url: string;
  colabUrl: string;
  pdfUrl?: string;
  pdfTitle?: string;
}

export const CHAPTER_NOTEBOOK_MAPPINGS: Record<string, Record<number, ChapterNotebookInfo>> = {
  'python-data-science': {
    0: {
      title: 'Notebook Bab 1 Lengkap (.ipynb)',
      url: '/notebooks/python-data-science/bab-1-dasar-pemrograman-python-lengkap.ipynb',
      colabUrl: 'https://colab.research.google.com/github/putuwahyu29/awd-course/blob/main/public/notebooks/python-data-science/bab-1-dasar-pemrograman-python-lengkap.ipynb',
      pdfUrl: '/docs/dasar-dasar-python.pdf',
      pdfTitle: 'Modul Cetak Dokumen Bab 1 (PDF)',
    },
    1: {
      title: 'Notebook Bab 2 Lengkap (.ipynb)',
      url: '/notebooks/python-data-science/bab-2-package-data-science-lengkap.ipynb',
      colabUrl: 'https://colab.research.google.com/github/putuwahyu29/awd-course/blob/main/public/notebooks/python-data-science/bab-2-package-data-science-lengkap.ipynb',
      pdfUrl: '/docs/package-data-science-python.pdf',
      pdfTitle: 'Modul Cetak Dokumen Bab 2 (PDF)',
    },
    2: {
      title: 'Notebook Bab 3 Lengkap (.ipynb)',
      url: '/notebooks/python-data-science/bab-3-analisis-data-eksploratif-lengkap.ipynb',
      colabUrl: 'https://colab.research.google.com/github/putuwahyu29/awd-course/blob/main/public/notebooks/python-data-science/bab-3-analisis-data-eksploratif-lengkap.ipynb',
      pdfUrl: '/docs/analisis-data-eksploratif.pdf',
      pdfTitle: 'Modul Cetak Dokumen Bab 3 (PDF)',
    },
  },
};

export function getChapterNotebook(
  courseId: string,
  chapterIndex: number,
  chapterLessons: any[] = []
): ChapterNotebookInfo | null {
  if (CHAPTER_NOTEBOOK_MAPPINGS[courseId]?.[chapterIndex]) {
    return CHAPTER_NOTEBOOK_MAPPINGS[courseId][chapterIndex];
  }

  // Fallback: check if any lesson in chapter has ipynbFile
  const lessonWithNb = chapterLessons.find((l) => l.data?.ipynbFile);
  if (lessonWithNb?.data?.ipynbFile) {
    const rawUrl = lessonWithNb.data.ipynbFile;
    const cleanRelPath = rawUrl.replace(/^[./\\]+/, '').replace(/^public[/\\]/, '');
    const fullDownloadUrl = cleanRelPath.startsWith('/') ? cleanRelPath : '/' + cleanRelPath;
    const githubColabUrl = `https://colab.research.google.com/github/putuwahyu29/awd-course/blob/main/public${fullDownloadUrl}`;

    return {
      title: `Notebook Bab ${chapterIndex + 1} (.ipynb)`,
      url: fullDownloadUrl,
      colabUrl: lessonWithNb.data.colabUrl || githubColabUrl,
    };
  }

  return null;
}

export interface ChapterGroup {
  title: string;
  fullSlug: string;
  shortSlug: string;
  index: number;
  lessons: any[];
  totalDuration: string;
  notebookInfo: ChapterNotebookInfo | null;
}

export function calculateTotalDuration(durations: string[]): string {
  let totalMinutes = 0;

  for (const d of durations) {
    if (!d) continue;
    const hourMatch = d.match(/(\d+)\s*(?:jam|hour|hours|hr|hrs)/i);
    const minuteMatch = d.match(/(\d+)\s*(?:menit|minute|minutes|min|mins)/i);

    if (hourMatch) {
      totalMinutes += parseInt(hourMatch[1], 10) * 60;
    }
    if (minuteMatch) {
      totalMinutes += parseInt(minuteMatch[1], 10);
    }
    if (!hourMatch && !minuteMatch) {
      const pureNum = parseInt(d.trim(), 10);
      if (!isNaN(pureNum)) totalMinutes += pureNum;
    }
  }

  if (totalMinutes === 0) return '30 Menit';

  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;

  if (hours > 0 && mins > 0) {
    return `${hours} Jam ${mins} Menit`;
  } else if (hours > 0) {
    return `${hours} Jam`;
  } else {
    return `${mins} Menit`;
  }
}

/**
 * Menghitung estimasi waktu baca dari teks konten lesson.
 * Kecepatan baca teknis diasumsikan 150 kata/menit.
 * Setiap blok kode menambah ~30 detik.
 * Hasil dibulatkan ke kelipatan 5 menit, minimum 5 menit.
 */
export function estimateReadingTime(body: string): string {
  if (!body || body.trim().length === 0) return '5 Menit';

  // Hitung jumlah blok kode sebelum dibersihkan
  const codeBlocks = (body.match(/```[\s\S]*?```/g) || []).length;

  // Bersihkan teks dari elemen non-kata
  const cleaned = body
    .replace(/```[\s\S]*?```/g, ' ') // hapus blok kode
    .replace(/^---[\s\S]*?---/m, '')  // hapus frontmatter
    .replace(/import\s+.*?from\s+['"].*?['"]/g, '') // hapus import
    .replace(/export\s+\w+.*?;/g, '')
    .replace(/<[^>]+>/g, ' ')         // hapus JSX/HTML tag
    .replace(/\{[^}]*\}/g, ' ')       // hapus JSX expressions
    .replace(/https?:\/\/\S+/g, '')   // hapus URL
    .replace(/[#*_`\[\]()!|]/g, ' ')  // hapus simbol markdown
    .replace(/\s+/g, ' ')
    .trim();

  const wordCount = cleaned.split(/\s+/).filter((w) => w.length > 1).length;

  // 150 kata/menit untuk konten teknis + 0.5 menit per blok kode
  const rawMinutes = wordCount / 150 + codeBlocks * 0.5;
  const rounded = Math.max(5, Math.ceil(rawMinutes / 5) * 5);

  if (rounded >= 60) {
    const hours = Math.floor(rounded / 60);
    const mins = rounded % 60;
    return mins > 0 ? `${hours} Jam ${mins} Menit` : `${hours} Jam`;
  }
  return `${rounded} Menit`;
}

/**
 * Mendapatkan durasi lesson — dihitung dinamis dari body konten jika tersedia.
 * Pengecualian: lesson bertipe 'assignment' dan 'pdf' (modul dokumen) selalu
 * menggunakan durasi statis dari frontmatter agar bisa dikontrol manual.
 */
export function getLessonDuration(lesson: { data: { duration?: string; contentType?: string }; body?: string }): string {
  const contentType = lesson.data?.contentType || 'text';

  // Tugas praktik & modul dokumen → pakai durasi statis dari frontmatter
  if (contentType === 'assignment' || contentType === 'pdf') {
    return lesson.data?.duration || '30 Menit';
  }

  const body = lesson.body || '';
  // Jika body cukup panjang (bukan sekadar import statement), hitung dinamis
  const wordCount = body.split(/\s+/).filter((w) => w.length > 2).length;
  if (wordCount > 30) {
    return estimateReadingTime(body);
  }
  return lesson.data?.duration || '5 Menit';
}


export function groupLessonsByChapter(courseId: string, lessons: any[]): ChapterGroup[] {
  const sortedLessons = [...lessons].sort((a, b) => (a.data.order || 0) - (b.data.order || 0));
  const map = new Map<string, any[]>();

  sortedLessons.forEach((l) => {
    const ch = l.data.chapter || 'Bab 1: Pengenalan';
    if (!map.has(ch)) {
      map.set(ch, []);
    }
    map.get(ch)!.push(l);
  });

  return Array.from(map.entries()).map(([title, chLessons], idx) => {
    const { fullSlug, shortSlug } = getChapterSlugs(title, idx);
    const durations = chLessons.map((l) => getLessonDuration(l));
    const totalDuration = calculateTotalDuration(durations);
    const notebookInfo = getChapterNotebook(courseId, idx, chLessons);

    return {
      title,
      fullSlug,
      shortSlug,
      index: idx,
      lessons: chLessons,
      totalDuration,
      notebookInfo,
    };
  });
}
