/**
 * Course Knowledge Base - AWD Course (https://course.awd.my.id)
 * Sumber data pengetahuan resmi platform untuk Asisten AI (Mistral AI)
 * Hanya mempublikasikan materi dari kursus yang berstatus Published (isPublished: true)
 */

export interface CourseInfo {
  id: string;
  title: string;
  slug: string;
  category: string;
  level: string;
  duration: string;
  description: string;
  isPublished: boolean;
  status: 'published' | 'draft';
  chapters: {
    name: string;
    topics: string[];
  }[];
  keySkills: string[];
}

export const INSTRUCTOR_INFO = {
  name: 'I Putu Agus Wahyu Dupayana',
  role: 'Software Engineer & Pemateri Utama AWD Course',
  organization: 'AWD.dev',
  portfolioUrl: 'https://awd.my.id',
  bio: 'Praktisi rekayasa perangkat lunak dan pengolahan data dengan dedikasi dalam membangun kurikulum terstruktur yang menggabungkan rekayasa perangkat lunak, komputasi awan modern, dan analisis data berstandar industri.',
  expertise: [
    'Software Architecture & Engineering',
    'Python & Data Science / Machine Learning',
    'Full-Stack Web Development (Astro, React, Node.js, Express, Laravel)',
    'Database Engineering & SQL Performance Tuning (PostgreSQL, Redis)',
    'DevOps, Docker, CI/CD, Kubernetes & Cloud Architecture',
    'Web Security & Ethical Defense (OWASP Top 10)',
  ],
};

export const PLATFORM_INFO = {
  name: 'AWD Course',
  url: 'https://course.awd.my.id',
  tagline: 'Platform Pembelajaran Teknis Terstruktur untuk Sains Data & Pemrograman',
  features: [
    {
      name: 'Google Colab & Interactive Execution',
      description: 'Menjalankan notebook Python (.ipynb) secara langsung di cloud Google Colab dengan satu klik tombol.',
    },
    {
      name: 'Mode Presentasi Interaktif (Slide Mode)',
      description: 'Mengubah materi modul menjadi slide presentasi visual layar penuh (fullscreen) untuk pengajaran atau review cepat.',
    },
    {
      name: 'Pelacakan Progres Belajar (Supabase)',
      description: 'Menandai modul selesai dan memantau persentase progres kursus yang tersimpan aman di database Supabase.',
    },
    {
      name: 'Modul PDF & Kuis Evaluasi',
      description: 'Tersedia materi ringkasan PDF yang dapat diunduh, modul tugas praktik langsung, dan kuis evaluasi pemahaman di setiap akhir bab.',
    },
    {
      name: 'Dukungan Tema Gelap & Terang (Dark/Light Mode)',
      description: 'Tampilan antarmuka modern yang ramah mata dengan switch tema instan.',
    },
  ],
};

export const COURSES_CATALOG: CourseInfo[] = [
  {
    id: 'python-data-science',
    title: 'Dasar Python & Analisis Data untuk Pemula',
    slug: 'python-data-science',
    category: 'Sains Data & AI',
    level: 'Pemula hingga Mahir',
    duration: '6 Jam',
    isPublished: true,
    status: 'published',
    description: 'Kuasai dasar sintaksis Python, manipulasi struktur data, analisis statistik dengan library modern NumPy & Pandas, dan visualisasi data eksploratif.',
    chapters: [
      {
        name: 'Bab 1: Fondasi Sintaksis & Logika Pemrograman Python',
        topics: [
          'Komentar dan Dokumentasi Kode (py-01a-komentar)',
          'Tipe Data dan Variabel (py-01b-tipe-data-dan-variabel)',
          'Operator Aritmatika, Komparasi & Logika (py-01c-operator)',
          'Percabangan Kondisional if-elif-else (py-01d-percabangan)',
          'Perulangan for & while Loops (py-01e-perulangan)',
          'Pembuatan dan Parameter Fungsi (py-01f-fungsi)',
          'Modul PDF Dasar Sintaksis Python (py-01g-modul-pdf-dasar-python)',
          'Tugas Praktik: Membangun Kalkulator Finansial (py-01h-tugas-praktik-kalkulator)',
        ],
      },
      {
        name: 'Bab 2: Ekosistem Library Sains Data (NumPy, Pandas & Visualisasi)',
        topics: [
          'Manajemen Package dengan pip dan Virtual Environment (py-02a-pip-dan-packages)',
          'Operasi Vektorisasi & Array dengan NumPy (py-02b-pengenalan-numpy)',
          'Struktur Data Series & DataFrame Pandas (py-02c-pengenalan-pandas)',
          'Visualisasi Data Dasar dengan Matplotlib (py-02d-visualisasi-matplotlib)',
          'Visualisasi Statistik Tingkat Lanjut dengan Seaborn (py-02e-visualisasi-seaborn)',
          'Impor dan Ekspor File CSV, Excel & JSON (py-02f-impor-dan-ekspor-data)',
        ],
      },
      {
        name: 'Bab 3: Eksplorasi Data Analitik & Pembersihan Data',
        topics: [
          'Inspeksi Struktur Data & Handling Missing Values (py-03a-inspeksi-data)',
          'Statistik Deskriptif dan Ringkasan Agregasi (py-03b-statistik-deskriptif)',
          'Teknik Seleksi, Query & Filtering DataFrame (py-03c-seleksi-dan-filter-data)',
        ],
      },
    ],
    keySkills: ['Python 3', 'NumPy', 'Pandas DataFrame', 'Matplotlib', 'Seaborn', 'Data Cleaning', 'Google Colab'],
  },
  {
    id: 'machine-learning-ai',
    title: 'Machine Learning & AI Terapan dengan Python',
    slug: 'machine-learning-ai',
    category: 'Sains Data & AI',
    level: 'Menengah',
    duration: '4 Jam',
    isPublished: false,
    status: 'draft',
    description: 'Pelajari konsep algoritma supervised learning, evaluasi metrik akurasi, decision tree, dan pembuatan model prediksi berbasis data nyata.',
    chapters: [
      {
        name: 'Bab 1: Fondasi Machine Learning & Alur Kerja Data',
        topics: [
          'Pengantar Machine Learning: Supervised vs Unsupervised (ml-01)',
          'Regresi Linier & Evaluasi Metrik MAE/MSE/R2 (ml-02)',
          'Klasifikasi dengan Decision Tree & Confusion Matrix (ml-03)',
          'Tugas Praktik: Model Prediksi Churn Pelanggan (ml-04)',
          'Kuis Evaluasi Pemahaman Machine Learning (ml-05)',
        ],
      },
    ],
    keySkills: ['Scikit-Learn', 'Linear Regression', 'Decision Trees', 'Model Evaluation', 'Confusion Matrix'],
  },
  {
    id: 'frontend-modern-mastery',
    title: 'Pengembangan Web Frontend: Dari Dasar hingga Mahir',
    slug: 'frontend-modern-mastery',
    category: 'Rekayasa Web',
    level: 'Pemula',
    duration: '4 Jam',
    isPublished: false,
    status: 'draft',
    description: 'Pelajari fondasi web modern mulai dari HTML5 semantik, CSS3 responsif, JavaScript DOM & Async, hingga pembuatan portfolio proyek nyata.',
    chapters: [],
    keySkills: ['HTML5 Semantic', 'CSS3 Flexbox & Grid', 'Vanilla JavaScript (ES6+)', 'DOM API', 'Responsive Web Design'],
  },
  {
    id: 'backend-web-development',
    title: 'Pengembangan Web Backend: Dari Dasar hingga Mahir',
    slug: 'backend-web-development',
    category: 'Rekayasa Web',
    level: 'Semua Tingkat',
    duration: '6 Jam',
    isPublished: false,
    status: 'draft',
    description: 'Kuasai arsitektur server-side modern dengan Node.js, Express, database relasional PostgreSQL, Prisma ORM, autentikasi JWT, caching Redis, dan deployment API siap produksi.',
    chapters: [],
    keySkills: ['Node.js', 'Express.js', 'PostgreSQL', 'Prisma ORM', 'JWT Authentication', 'Redis Caching'],
  },
  {
    id: 'laravel-modern-mastery',
    title: 'Pengembangan Aplikasi Web Modern dengan Laravel & Filament',
    slug: 'laravel-modern-mastery',
    category: 'Rekayasa Web',
    level: 'Pemula hingga Menengah',
    duration: '10 Jam',
    isPublished: false,
    status: 'draft',
    description: 'Kuasai framework PHP paling populer, arsitektur MVC, Eloquent ORM, autentikasi Breeze/Sanctum, hingga dashboard admin reaktif dengan Filament PHP.',
    chapters: [],
    keySkills: ['Laravel 11', 'PHP 8.3+', 'Filament PHP v3', 'Eloquent ORM', 'Blade'],
  },
  {
    id: 'dsa-software-engineering',
    title: 'Struktur Data, Algoritma & Rekayasa Perangkat Lunak Modern',
    slug: 'dsa-software-engineering',
    category: 'Pemrograman & Algoritma',
    level: 'Semua Tingkat',
    duration: '6 Jam',
    isPublished: false,
    status: 'draft',
    description: 'Kuasai analisis kompleksitas Big-O, struktur data fundamental dan algoritma pengurutan & pencarian.',
    chapters: [],
    keySkills: ['Big-O Analysis', 'Data Structures', 'Binary Search Tree', 'Algorithms'],
  },
  {
    id: 'devops-cloud-mastery',
    title: 'DevOps & Cloud Deployment: Docker, CI/CD, Kubernetes & Serverless',
    slug: 'devops-cloud-mastery',
    category: 'Cloud & DevOps',
    level: 'Semua Tingkat',
    duration: '6 Jam',
    isPublished: false,
    status: 'draft',
    description: 'Kuasai otomatisasi deployment modern, kontainerisasi aplikasi dengan Docker, orkestrasi Kubernetes, pipeline CI/CD GitHub Actions, dan NGINX.',
    chapters: [],
    keySkills: ['Docker', 'Kubernetes', 'GitHub Actions CI/CD', 'NGINX'],
  },
  {
    id: 'database-engineering-sql-tuning',
    title: 'Database Engineering & SQL Performance Tuning',
    slug: 'database-engineering-sql-tuning',
    category: 'Pemrograman & Basis Data',
    level: 'Semua Tingkat',
    duration: '6 Jam',
    isPublished: false,
    status: 'draft',
    description: 'Kuasai arsitektur internal database PostgreSQL, optimasi query berkecepatan tinggi dengan EXPLAIN ANALYZE, dan indexing mendalam.',
    chapters: [],
    keySkills: ['PostgreSQL', 'SQL Performance Tuning', 'EXPLAIN ANALYZE', 'Redis Caching'],
  },
  {
    id: 'cybersecurity-web-defense',
    title: 'Cybersecurity & Keamanan Web: Ethical Hacking & OWASP Top 10',
    slug: 'cybersecurity-web-defense',
    category: 'Cloud & Keamanan',
    level: 'Semua Tingkat',
    duration: '6 Jam',
    isPublished: false,
    status: 'draft',
    description: 'Kuasai teknik pertahanan aplikasi web modern, mitigasi kerentanan OWASP Top 10, dan pengamanan REST API.',
    chapters: [],
    keySkills: ['OWASP Top 10 Defense', 'Applied Cryptography', 'API Security Hardening'],
  },
];

export const PUBLISHED_COURSES = COURSES_CATALOG.filter((c) => c.isPublished);
export const DRAFT_COURSES = COURSES_CATALOG.filter((c) => !c.isPublished);

/**
 * Helper untuk mencari konteks kursus / modul paling relevan berdasarkan pertanyaan user
 */
export function findRelevantKnowledge(query: string): string {
  const q = query.toLowerCase();

  // 1. Cek apakah user menanyakan kursus yang berstatus draft / belum dipublikasikan
  for (const draftCourse of DRAFT_COURSES) {
    const titleMatch = draftCourse.title.toLowerCase();
    const slugMatch = draftCourse.slug.toLowerCase();
    if (q.includes(slugMatch) || q.includes(titleMatch.split(' ')[0].toLowerCase())) {
      return `CATATAN STATUS KURSUS:
Kursus "${draftCourse.title}" (/courses/${draftCourse.slug}) saat ini berstatus DRAFT (Belum Dipublikasikan / Coming Soon) dan BELUM DAPAT DIAKSES di platform AWD Course.
Jika user bertanya cara mengaksesnya atau materi di dalamnya, jelaskan dengan sopan bahwa kursus tersebut sedang dalam tahap pengembangan dan belum dirilis. Arahkan user ke kursus yang sudah aktif dan dirilis resmi saat ini yaitu: **Dasar Python & Analisis Data untuk Pemula** (/courses/python-data-science).`;
    }
  }

  // 2. Cari dari kursus yang sudah dipublikasikan (Published Courses)
  const matchedCourses: CourseInfo[] = [];
  for (const course of PUBLISHED_COURSES) {
    let score = 0;
    const title = course.title.toLowerCase();
    const desc = course.description.toLowerCase();
    const cat = course.category.toLowerCase();

    const keywords = q.split(/\s+/).filter((w) => w.length > 2);
    for (const kw of keywords) {
      if (title.includes(kw)) score += 3;
      if (desc.includes(kw)) score += 2;
      if (cat.includes(kw)) score += 2;
      if (course.keySkills.some((k) => k.toLowerCase().includes(kw))) score += 3;
    }

    if (score > 0) {
      matchedCourses.push(course);
    }
  }

  if (matchedCourses.length > 0) {
    return matchedCourses
      .map((c) => {
        const chaptersList = c.chapters
          .map((ch) => `  * ${ch.name}:\n    - ${ch.topics.join('\n    - ')}`)
          .join('\n');
        return `### Kursus Resmi Aktif: ${c.title} (/courses/${c.slug})\n- Status: Published (Tersedia & Dapat Diakses)\n- Level: ${c.level} | Durasi: ${c.duration} | Kategori: ${c.category}\n- Ringkasan: ${c.description}\n- Skill Utama: ${c.keySkills.join(', ')}\n- Silabus Materi Lengkap:\n${chaptersList}`;
      })
      .join('\n\n');
  }

  // Fallback: Tampilkan kursus yang published saja
  return PUBLISHED_COURSES.map((c) => `- **${c.title}** (/courses/${c.slug}) [Status: Published | ${c.level}, ${c.duration}]: ${c.description}`).join('\n');
}
