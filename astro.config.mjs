import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import org from 'astro-org';

import bib from './src/lib/bib.js';
import { pathToFrontmatter } from './src/lib/path-to-frontmatter.js';
import orgConfig from './src/lib/org-config.js';

// https://astro.build/config
export default defineConfig({
  site: 'https://oleksii.shmalko.com',
  prefetch: {
    prefetchAll: true,
  },
  integrations: [
    org(orgConfig),
    bib({
      frontmatter: (id) => pathToFrontmatter(id),
    }),
    react(),
    sitemap(),
  ],
  build: {
    assets: 'assets',
  },
  vite: {
    build: {
      assetsInlineLimit: 8192,
    },
  },
});
