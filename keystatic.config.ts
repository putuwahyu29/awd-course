import { config, fields, collection } from '@keystatic/core';

const isProd = import.meta.env.PROD || (typeof process !== 'undefined' && process.env?.NODE_ENV === 'production');

const repoOwner =
  (typeof process !== 'undefined' && (process.env?.PUBLIC_KEYSTATIC_GITHUB_OWNER || process.env?.KEYSTATIC_GITHUB_OWNER)) ||
  import.meta.env?.PUBLIC_KEYSTATIC_GITHUB_OWNER ||
  'putuwahyu29';

const repoName =
  (typeof process !== 'undefined' && (process.env?.PUBLIC_KEYSTATIC_GITHUB_REPO || process.env?.KEYSTATIC_GITHUB_REPO)) ||
  import.meta.env?.PUBLIC_KEYSTATIC_GITHUB_REPO ||
  'awd-course';

export default config({
  storage: isProd
    ? {
        kind: 'github',
        repo: {
          owner: repoOwner,
          name: repoName,
        },
      }
    : {
        kind: 'local',
      },
  ui: {
    brand: {
      name: 'Awd Course CMS',
    },
    navigation: {
      'Manajemen Kursus': ['courses', 'lessons'],
    },
  },
  collections: {
    courses: collection({
      label: 'Katalog Kursus (Courses)',
      slugField: 'title',
      path: 'src/content/courses/*',
      format: { data: 'json' },
      schema: {
        title: fields.slug({ name: { label: 'Judul Kursus' } }),
        description: fields.text({ label: 'Deskripsi Singkat', multiline: true }),
        category: fields.select({
          label: 'Kategori Kursus',
          options: [
            { label: 'Pengembangan Web', value: 'web-dev' },
            { label: 'Pemrograman & Logika', value: 'programming' },
            { label: 'UI/UX & Desain', value: 'ui-ux' },
            { label: 'Sains Data & AI', value: 'data-ai' },
            { label: 'DevOps & Cloud', value: 'cloud' },
          ],
          defaultValue: 'web-dev',
        }),
        level: fields.select({
          label: 'Tingkat Kesulitan (Level)',
          options: [
            { label: 'Pemula (Beginner)', value: 'Pemula' },
            { label: 'Menengah (Intermediate)', value: 'Menengah' },
            { label: 'Mahir (Advanced)', value: 'Mahir' },
            { label: 'Semua Tingkat (All Levels)', value: 'Semua Tingkat' },
          ],
          defaultValue: 'Pemula',
        }),
        duration: fields.text({ label: 'Estimasi Durasi (contoh: 4 Jam)', defaultValue: '3 Jam' }),
        instructor: fields.text({ label: 'Nama Pemateri', defaultValue: 'I Putu Agus Wahyu Dupayana' }),
        instructorRole: fields.text({ label: 'Jabatan / Peran Pemateri', defaultValue: 'Pranata Komputer Ahli Pertama ' }),
        instructorAvatar: fields.text({
          label: 'URL / Path Foto Pemateri (Opsional, contoh: /images/instructors/wahyu-dupayana.jpg)',
          description: 'Path ke file foto profil pemateri',
        }),
        thumbnail: fields.text({ label: 'URL / Path Gambar Thumbnail', defaultValue: '/images/courses/frontend-modern.svg' }),
        isFeatured: fields.checkbox({ label: 'Tampilkan di Halaman Utama (Featured)', defaultValue: true }),
        isPublished: fields.checkbox({
          label: 'Status Publikasi (Publish)',
          description: 'Centang jika kursus sudah siap dipublikasikan dan dibuka untuk peserta',
          defaultValue: true,
        }),
        status: fields.select({
          label: 'Status Rilis Kursus',
          options: [
            { label: 'Published (Tayang & Terbuka)', value: 'published' },
            { label: 'Draft (Segera Hadir / Disiapkan)', value: 'draft' },
          ],
          defaultValue: 'published',
        }),
        updatedAt: fields.text({
          label: 'Tanggal Pembaruan Materi (format: YYYY-MM-DD)',
          description: 'Tanggal terakhir materi kursus diperbarui',
          defaultValue: '2026-09-08',
        }),
        order: fields.number({ label: 'Urutan Tampilan (Order)', defaultValue: 1 }),
      },
    }),
    lessons: collection({
      label: 'Materi Pembelajaran (Lessons)',
      slugField: 'title',
      path: 'src/content/lessons/*',
      format: { contentField: 'content' },
      schema: {
        title: fields.slug({ name: { label: 'Judul Pelajaran' } }),
        courseSlug: fields.relationship({
          label: 'Pilih Kursus Terkait',
          collection: 'courses',
          validation: { isRequired: true },
        }),
        chapter: fields.text({ label: 'Nama Bab / Modul (contoh: Bab 1: Pengenalan)', defaultValue: 'Bab 1: Pengenalan' }),
        order: fields.number({ label: 'Urutan Pelajaran (Order)', defaultValue: 1 }),
        duration: fields.text({ label: 'Estimasi Waktu Belajar (contoh: 15 Menit)', defaultValue: '10 Menit' }),
        contentType: fields.select({
          label: 'Tipe Konten Utama',
          options: [
            { label: 'Artikel & Teks Panduan', value: 'text' },
            { label: 'Video Tutorial (YouTube)', value: 'video' },
            { label: 'Dokumen / Modul PDF', value: 'pdf' },
            { label: 'Kuis & Evaluasi Pemahaman', value: 'quiz' },
            { label: 'Tugas Praktik / Latihan Mandiri', value: 'assignment' },
          ],
          defaultValue: 'text',
        }),
        isPublished: fields.checkbox({
          label: 'Status Publikasi Pelajaran (Publish)',
          description: 'Centang jika materi pelajaran ini sudah dapat dibaca oleh peserta',
          defaultValue: true,
        }),
        updatedAt: fields.text({
          label: 'Tanggal Pembaruan Pelajaran (format: YYYY-MM-DD)',
          defaultValue: '2026-09-08',
        }),
        youtubeId: fields.text({
          label: 'YouTube Video ID (Opsional, contoh: dQw4w9WgXcQ)',
          description: 'Hanya jika materi memiliki video YouTube yang di-embed',
        }),
        pdfUrl: fields.text({
          label: 'Path File PDF (Opsional, contoh: /docs/dasar-dasar-python.pdf)',
          description: 'Hanya jika materi menyediakan modul dokumen PDF',
        }),
        pdfTitle: fields.text({
          label: 'Judul Download PDF (Opsional)',
          defaultValue: 'Unduh Modul Pembelajaran (PDF)',
        }),
        ipynbFile: fields.text({
          label: 'Path File Notebook .ipynb (Opsional, contoh: /notebooks/python-data-science/bab-1-dasar-python/01-komentar.ipynb)',
          description: 'Jika materi menggunakan file Jupyter Notebook interaktif',
        }),
        colabUrl: fields.text({
          label: 'URL Google Colab (Opsional, contoh: https://colab.research.google.com)',
          description: 'Tautan langsung ke Google Colab akun pengajar/publik',
        }),
        content: fields.mdx({
          label: 'Isi Materi (Markdown / MDX)',
          options: {
            image: {
              directory: 'public/images/lessons',
              publicPath: '/images/lessons',
            },
          },
        }),
      },
    }),
  },
});
