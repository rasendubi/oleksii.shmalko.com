import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import image from '@astrojs/image';
import prefetch from '@astrojs/prefetch';
import sitemap from '@astrojs/sitemap';

import { getPostBySlug } from './src/lib/api';

// https://astro.build/config
export default defineConfig({
  site: 'https://www.alexeyshmalko.com',

  integrations: [
    react(),
    image({
      serviceEntryPoint: '@astrojs/image/sharp',
    }),
    prefetch({
      throttle: 3,
    }),
    sitemap({
      serialize: async (item) => {
        const slug = new URL(item.url).pathname;
        const post = await getPostBySlug(slug);

        const m = slug.match(
          /^\/(?<year>\d{4})(?<month>\d{2})(?<day>\d{2})(?<hours>\d{2})(?<minutes>\d{2})(?<seconds>\d{2})\/$/
        );
        const dateFromSlug =
          m?.groups &&
          `${m.groups.year}-${m.groups.month}-${m.groups.day}T${m.groups.hours}:${m.groups.minutes}:${m.groups.seconds}Z`;
        return {
          ...item,
          lastmod: post?.data.last_modified ?? post?.data.date ?? dateFromSlug,
        };
      },
    }),
  ],
});
