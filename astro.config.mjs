// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import vercel from '@astrojs/vercel';
import tailwindcss from '@tailwindcss/vite';

import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://course.awd.my.id',
  redirects: {
    '/admin': '/keystatic',
  },
  integrations: [
    react(),
    mdx(),
    sitemap({
      filter: (page) => !page.includes('/keystatic') && !page.includes('/api/'),
    }),
  ],
  adapter: vercel(),
  markdown: {
    shikiConfig: {
      themes: {
        light: 'github-light',
        dark: 'github-dark',
      },
    },
  },
  vite: {
    plugins: [tailwindcss()],
    ssr: {
      noExternal: ['@oslojs/encoding', '@oslojs/crypto'],
    },
  },
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'hover',
  },
});
