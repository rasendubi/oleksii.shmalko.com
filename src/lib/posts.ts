import fs from 'fs';
import { join } from 'path';

export type Page = {
  frontmatter: {
    slug: string;
    title: string;
    pageType: string;
    icon: string;
    description?: string;
    date?: string;
    last_modified?: string;
    links: string[];

    no_backlinks?: unknown;
    no_links?: unknown;
    draft?: unknown;
  };
  ids: Record<string, string>;
};

export const pubDate = (page: Page): Date | null => {
  if (page.frontmatter.date) {
    return new Date(page.frontmatter.date);
  }

  const m = page.frontmatter.slug.match(/^\/(\d{14})/);
  if (m) {
    const n = m[1];
    const year = n.slice(0, 4);
    const month = n.slice(4, 6);
    const day = n.slice(6, 8);
    const hour = n.slice(8, 10);
    const minute = n.slice(10, 12);
    const second = n.slice(12, 15);
    const s = `${year}-${month}-${day}T${hour}:${minute}:${second}Z`;
    return new Date(s);
  }

  if (page.frontmatter.last_modified) {
    // fallback
    return new Date(page.frontmatter.last_modified);
  }

  return null;
};

const on = <T, R>(value: T, f: (value: T) => R): R => f(value);

const pages = import.meta.glob<true, '', Page>(
  [
    '../../posts/index.org',
    '../../posts/*.org',
    '../../posts/{posts,biblio}/**/*.{org,bib}',
  ],
  { eager: true }
) as Record<string, Page>;

export const allPages = Object.values(pages).filter(
  (p) => process.env.NODE_ENV === 'development' || !('draft' in p.frontmatter)
);

const cwd = process.cwd();
export const resources = Object.fromEntries(
  Object.entries(
    import.meta.glob(
      ['../../posts/**/*.{png,jpg,jpeg,gif,webp,avif,txt,pdf,sh,asc}'],
      {
        as: 'url',
      }
    )
  ).map(([path, loader]) => {
    return [fs.realpathSync(join(cwd, 'src/lib', path)), loader];
  })
);

const idLinks = on(allPages, (posts) => {
  const ids = new Map();
  posts.forEach((p) => {
    const localIds = p.ids;
    if (localIds) {
      Object.entries(localIds).forEach(([id, anchor]) => {
        ids.set(id, { slug: p.frontmatter.slug, anchor, post: p });
      });
    }
  });
  return ids;
});

export const resolveId = (id: string) => {
  const saved = idLinks.get(id);
  if (!saved) {
    throw new Error(`Unable to resolve ${id}`);
  }

  const { slug, anchor } = saved;
  return slug + anchor;
};

const backlinks = on(allPages, (posts) => {
  const backlinks: Record<string, Set<Page>> = {};
  for (const p of posts) {
    if (p.frontmatter.hasOwnProperty('no_links')) {
      continue;
    }

    const links = p.frontmatter.links ?? [];

    for (let link of links) {
      if (Object.keys(p.ids).includes(link)) {
        // linking to self -> does not count
        continue;
      }

      try {
        link = resolveId(link);
      } catch {}

      backlinks[link] = backlinks[link] ?? new Set();
      backlinks[link].add(p);
    }
  }

  return backlinks;
});

export const getBacklinks = (slug: string) => {
  return backlinks[slug] ?? new Set();
};
