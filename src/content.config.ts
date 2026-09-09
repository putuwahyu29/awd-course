import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const courses = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/courses' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    category: z.string().default('web-dev'),
    level: z.string().default('Pemula'),
    duration: z.string().default('3 Jam'),
    instructor: z.string().default('Tim Pengajar'),
    instructorRole: z.string().default('Senior Engineer'),
    instructorAvatar: z.string().optional().nullable(),
    thumbnail: z.string().default('/images/courses/frontend-modern.svg'),
    isFeatured: z.boolean().default(true),
    isPublished: z.boolean().default(true),
    status: z.enum(['published', 'draft']).default('published'),
    updatedAt: z.string().default('2026-09-08'),
    order: z.number().default(1),
  }),
});

const lessons = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/lessons' }),
  schema: z.object({
    title: z.string(),
    courseSlug: z.string(),
    chapter: z.string().default('Bab 1: Pengenalan'),
    order: z.number().default(1),
    duration: z.string().default('10 Menit'),
    contentType: z.enum(['text', 'video', 'pdf', 'quiz', 'assignment']).default('text'),
    isPublished: z.boolean().default(true),
    updatedAt: z.string().default('2026-09-08'),
    youtubeId: z.string().optional().nullable(),
    pdfUrl: z.string().optional().nullable(),
    pdfTitle: z.string().optional().nullable(),
    ipynbFile: z.string().optional().nullable(),
    colabUrl: z.string().optional().nullable(),
  }),
});

export const collections = { courses, lessons };
