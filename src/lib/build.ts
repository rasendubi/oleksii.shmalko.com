import * as path from 'path';
import trough from 'trough';
import toVFile from 'to-vfile';
import { VFile } from 'vfile';
import findDown from 'vfile-find-down';
import rename from 'vfile-rename';
import bibtexParse from 'bibtex-parse';

import orgToHtml from './orgToHtml';
import mdToHtml from './mdToHtml';
import bibtexToHtml from './bibtex';
import postprocessPage from './postprocess';
import { rewritePagePath } from './rewrite-path';

export interface PageData {
  type: '.org' | '.md' | '.bib';
  pageType: 'note' | 'post' | 'biblio';
  slug: string;
  title: string;
  images: Array<{ src: string; alt: string }>;
  ids: Record</* id: */ string, /* anchor: */ string>;
  links: string[];
  backlinks: Set<string>;
  excerpt: string;
  date?: string;
  last_modified?: string;
  description?: string;
  icon?: string;
}
export type Page = VFile & { data: PageData; path: string; result: any };

type BibtexEntry = {
  key: string;
  type: string;
  authors?: string[];

  [key: string]: string | string[] | undefined;
};

export interface BraindumpOptions {
  root: string;
  allowDirectoryScan: (path: string) => boolean;
  specialPages: Set<string>;
}

export interface BuildCtx {
  options: BraindumpOptions;
  bibliography: Record<string, BibtexEntry>;
  pages: Record<string, Page>;
  backlinks: Record<string, Set<string>>;
}

const pageType = (path: string): 'note' | 'post' | 'biblio' => {
  if (path.startsWith('biblio')) return 'biblio';
  if (path.startsWith('posts')) return 'post';
  return 'note';
};

const process = trough()
  .use(collectFiles)
  .use(collectBibliography)
  .use(populateBibliographyPages)
  .use(preprocessPages)
  .use(postprocessPages)
  .use(populateBacklinks);

export const build = async (
  options: BraindumpOptions
): Promise<Record<string, Page>> => {
  console.time('process');
  const result = await new Promise<Record<string, Page>>((resolve, reject) => {
    process.run({ options, backlinks: {} }, (err: any, ctx: BuildCtx) => {
      if (err) {
        reject(err);
      } else {
        resolve(ctx.pages!);
      }
    });
  });
  console.timeEnd('process');
  return result;
};

async function collectFiles(ctx: BuildCtx): Promise<void> {
  const files = await new Promise<Page[]>((resolve, reject) => {
    findDown.all(
      (file, stats) => {
        const p = path.relative(ctx.options.root, file.path!);
        if (stats.isDirectory()) {
          // rewrite path so it starts/ends with slashes
          const pp = path.join('/', p, '/');
          if (ctx.options.allowDirectoryScan(pp)) {
            console.log('scanning into', pp);
            return;
          } else {
            return findDown.SKIP;
          }
        }

        const ext = path.extname(p);
        if (ext === '.org' || ext === '.bib' || ext === '.md') {
          const slug = rewritePagePath(p);
          const type = pageType(p);

          const data: PageData = {
            slug,
            type: ext,
            pageType: type,
            title: '',
            images: [],
            ids: {},
            links: [],
            backlinks: new Set(),
            excerpt: '',
          };
          file.data = data;

          return true;
        }
      },
      ctx.options.root,
      (err, files) => {
        if (err) {
          reject(err);
        } else {
          resolve(files as Page[]);
        }
      }
    );
  });
  const pages = await Promise.all(
    files.map(async (f) => {
      await toVFile.read(f, 'utf8');
      return rename(
        rename(f, { path: path.relative(ctx.options.root, f.path) }),
        { path: f.data.slug }
      );
    })
  );
  ctx.pages = Object.fromEntries(pages.map((p) => [p.data.slug, p]));
}

async function collectBibliography(ctx: BuildCtx): Promise<void> {
  const files = await new Promise<VFile[]>((resolve, reject) => {
    findDown.all('.bib', ctx.options.root, (err, files) => {
      if (err) {
        reject(err);
      } else {
        resolve(files!);
      }
    });
  });
  const entries = (
    await Promise.all(
      files.map(async (f) => {
        await toVFile.read(f, 'utf8');
        return bibtexParse.entries(f.contents);
      })
    )
  ).reduce((acc: any[], es) => {
    es.forEach((e: any) => {
      if ('AUTHOR' in e) {
        e.authors = e['AUTHOR'].split(/[, ]+and[ ]+/i);
      } else {
        e.authors = [];
      }

      acc[e.key] = e;
    });
    return acc;
  }, {});

  ctx.bibliography = entries;
}

// Create pages for all bibliography references
function populateBibliographyPages(ctx: BuildCtx): void {
  Object.values(ctx.bibliography).forEach((b) => {
    const path = '/biblio/' + b.key + '/';
    if (path in ctx.pages) return;

    ctx.pages[path] = toVFile({
      path,
      contents: '',
      data: {
        slug: path,
        type: '.org',
        pageType: 'biblio',
        title: '',
        images: [],
        ids: {},
        links: [],
        backlinks: [],
        excerpt: '',
      },
    });
  });
}

// Convert page to rehype, save page titles and ids.
async function preprocessPages(ctx: BuildCtx): Promise<void> {
  await Promise.all(Object.values(ctx.pages).map(processPage));

  async function processPage(file: Page): Promise<Page | null> {
    const data = file.data;

    const type = data.type;
    if (type === '.org') {
      await orgToHtml(file);
    } else if (type === '.md') {
      await mdToHtml(file);
    } else if (type === '.bib') {
      await bibtexToHtml(file);
    } else {
      throw new Error(`unknown page type: ${type}`);
    }

    const published = (file.data as any).published;
    if (published && (published !== 'true' || published !== 'yes')) {
      // TODO: refactor this, so it does less mutation
      if (import.meta.env.PROD) {
        delete ctx.pages[file.data.slug];
      }
    }

    return file;
  }
}

async function postprocessPages(ctx: BuildCtx): Promise<void> {
  const ids: Record</* id: */ string, { path: string; anchor: string }> = {};
  Object.values(ctx.pages).forEach((p) => {
    Object.entries(p.data.ids).forEach(([id, anchor]: [string, string]) => {
      ids[id] = { path: p.path, anchor };
    });
  });

  await Promise.all(Object.values(ctx.pages).map(processPage));

  async function processPage(file: Page): Promise<Page> {
    const data = file.data;

    file.bibliography = ctx.bibliography;
    file.pageExists = pageExists;
    file.ids = ids;

    postprocessPage(file);

    return file;
  }
  function pageExists(slug: string) {
    return ctx.options.specialPages.has(slug) || slug in ctx.pages;
  }
}

function populateBacklinks(ctx: BuildCtx) {
  const backlinks: Record<string, Set<string>> = {};
  Object.values(ctx.pages).forEach((file) => {
    file.data.links = file.data.links ?? [];
    file.data.backlinks = backlinks[file.data.slug] =
      backlinks[file.data.slug] ?? new Set();

    file.data.links
      .filter((l) => l !== file.data.slug)
      .forEach((other) => {
        backlinks[other] = backlinks[other] || new Set();
        backlinks[other].add(file.data.slug);
      });
  });
}
