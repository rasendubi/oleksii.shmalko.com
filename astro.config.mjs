import * as path from 'path';
import * as fs from 'fs/promises';
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import image from '@astrojs/image';
import prefetch from '@astrojs/prefetch';
import sitemap from '@astrojs/sitemap';
// import { getPostBySlug } from './src/lib/api';

import rehypeRaw from 'rehype-raw';

import org from './src/lib/orgx/astro.js';

const slugify = () => {
  return async (tree, file) => {
    const slug = path
      .relative(
        await fs.realpath(new URL('posts', import.meta.url).pathname),
        file.path
      )
      .replace(/\.org$/, '')
      .replace(/(^|\/)index$/, '')
      .replace(/^posts\//, '');

    file.data.keywords = file.data.keywords ?? {};
    file.data.keywords.slug = slug;
  };
};

// https://astro.build/config
export default defineConfig({
  site: 'https://www.alexeyshmalko.com',
  integrations: [
    org({
      uniorgPlugins: [slugify],
      rehypePlugins: [rehypeRaw],
    }),
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
        // const post = await getPostBySlug(slug);
        const post = {};
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
