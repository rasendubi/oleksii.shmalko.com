import * as path from 'path';
import trough from 'trough';
import toVFile from 'to-vfile';
import { VFile } from 'vfile';
import findDown from 'vfile-find-down';
import rename from 'vfile-rename';
import bibtexParse from 'bibtex-parse';

import orgToHtml from './orgToHtml';
import bibtexToHtml from './bibtex';
import postprocessPage from './postprocess';

export interface PageData {
  type: 'org' | 'bib';
  slug: string;
  title: string;
  ids: [string, any][];
  links: string[];
  backlinks: string[];
  excerpt: string;
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
  whitelistDirectories: Set<string>;
  specialPages: Set<string>;
}

export interface BuildCtx {
  options: BraindumpOptions;
  bibliography: Record<string, BibtexEntry>;
  pages: Record<string, Page>;
  backlinks: Record<string, Set<string>>;
}

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
          if (!p || ctx.options.whitelistDirectories.has(p)) {
            return;
          } else {
            return findDown.SKIP;
          }
        }

        const ext = path.extname(p);
        if (ext === '.org' || ext === '.bib') {
          const slug = '/' + p.replace(/\.(org|bib)$/, '');

          const data: PageData = {
            slug,
            type: ext === '.org' ? 'org' : 'bib',
            title: '',
            ids: [],
            links: [],
            backlinks: [],
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
      return rename(f, { path: f.data.slug });
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
    const path = '/biblio/' + b.key;
    if (path in ctx.pages) return;

    ctx.pages[path] = toVFile({
      path,
      contents: '',
      data: {
        slug: path,
        type: 'org',
        title: '',
        ids: [],
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

  async function processPage(file: Page): Promise<Page> {
    const data = file.data;

    const type = data.type;
    if (type === 'org') {
      await orgToHtml(file);
    } else if (type === 'bib') {
      await bibtexToHtml(file);
    } else {
      throw new Error(`unknown page type: ${type}`);
    }

    return file;
  }
}

async function postprocessPages(ctx: BuildCtx): Promise<void> {
  const ids: Record</* id: */ string, /* slug: */ string> = {};
  Object.values(ctx.pages).forEach((p) => {
    p.data.ids?.forEach(([id, _target]: [string, any]) => {
      ids[id] = p.path;
    });
  });

  await Promise.all(Object.values(ctx.pages).map(processPage));

  async function processPage(file: Page): Promise<Page> {
    const data = file.data;

    file.bibliography = ctx.bibliography;
    file.pageExists = pageExists;
    file.ids = ids;

    data.links = [];
    postprocessPage(file);
    data.links.forEach((other: string) => {
      ctx.backlinks[other] = ctx.backlinks[other] || new Set();
      ctx.backlinks[other].add(data.slug);
    });

    return file;
  }
  function pageExists(slug: string) {
    return ctx.options.specialPages.has(slug) || slug in ctx.pages;
  }
}

function populateBacklinks(ctx: BuildCtx): void {
  Object.values(ctx.pages).forEach((p) => {
    const links = ctx.backlinks[p.path!] ?? new Set();
    p.data.backlinks = [...links];
  });
}
