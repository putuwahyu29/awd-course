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
    const durations = chLessons.map((l) => l.data.duration || '10 Menit');
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
