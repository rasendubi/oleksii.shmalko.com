import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import image from '@astrojs/image';
import prefetch from '@astrojs/prefetch';
import sitemap from '@astrojs/sitemap';

import org from './src/lib/orgx/astro.js';
import bib from './src/lib/bib.js';
import { pathToFrontmatter } from './src/lib/path-to-frontmatter.js';
import orgConfig from './src/lib/org-config.js';

// https://astro.build/config
export default defineConfig({
  site: 'https://www.alexeyshmalko.com',
  integrations: [
    org(orgConfig),
    bib({
      frontmatter: (id) => pathToFrontmatter(id),
    }),
    react(),
    image({
      serviceEntryPoint: '@astrojs/image/sharp',
    }),
    prefetch({
      throttle: 3,
    }),
    sitemap(),
  ],
  build: {
    assets: 'assets',
  },
});
