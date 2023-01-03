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
  };
  ids: Record<string, string>;
};

export const allPages: Promise<Page[]> = Promise.all(
  Object.values(
    import.meta.glob([
      '../../posts/*.org',
      '../../posts/{posts,biblio}/**/*.{org,bib}',
    ])
  ).map((p: any) => p())
).then((pgs) => {
  if (process.env.NODE_ENV === 'development') {
    return pgs;
  } else {
    return pgs.filter(
      (p: any) => p.frontmatter?.published !== 'false' && !p.frontmatter?.draft
    );
  }
});

const cwd = process.cwd();
export const resources = Object.fromEntries(
  Object.entries(
    import.meta.glob(
      ['../../posts/**/*.{png,jpg,jpeg,gif,webp,avif,txt,pdf,sh}'],
      {
        as: 'url',
      }
    )
  ).map(([path, loader]) => {
    return [fs.realpathSync(join(cwd, 'src/lib', path)), loader];
  })
);

export const bySlug = allPages.then((pages) => {
  const bySlug = new Map();
  pages.forEach((p) => {
    bySlug.set(p.frontmatter.slug, p);
  });
  return bySlug;
});

const idLinks = allPages.then((posts) => {
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

export const resolveId = async (id: string) => {
  const ids = await idLinks;
  const saved = ids.get(id);
  if (!saved) {
    throw new Error(`Unable to resolve ${id}`);
  }

  const { slug, anchor } = ids.get(id);
  return slug + anchor;
};

export const calculateBacklinks = async () => {
  const posts = await allPages;
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
        link = await resolveId(link);
      } catch {}

      backlinks[link] = backlinks[link] ?? new Set();
      backlinks[link].add(p);
    }
  }

  return backlinks;
};
const backlinks = calculateBacklinks();

export const getBacklinks = async (slug: string) => {
  const b = await backlinks;
  return b[slug] ?? new Set();
};
