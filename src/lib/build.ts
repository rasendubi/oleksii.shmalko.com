import * as path from 'path';
import toVFile from 'to-vfile';
import { VFile } from 'vfile';
import findDown from 'vfile-find-down';
import rename from 'vfile-rename';
import bibtexParse from 'bibtex-parse';

import orgToHtml from './orgToHtml';
import bibtexToHtml from './bibtex';

export interface PageData {
  type: 'org' | 'bib';
  title: string;
  slug: string;
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

export class Braindump {
  private readonly options: BraindumpOptions;

  private readonly pages: Promise<Record<string, Page>>;
  private readonly backlinks: Record<string, Set<string>> = {};

  private bibliography!: Record<string, BibtexEntry>;

  private paths: Set<string> = new Set();

  public constructor(options: BraindumpOptions) {
    this.options = options;
    this.pages = this.processAll();
  }

  public getPages(): Promise<Record<string, Page>> {
    return this.pages;
  }

  private pageExists = (slug: string): boolean => {
    return this.paths.has(slug) || this.options.specialPages.has(slug);
  };

  private processAll = async (): Promise<Record<string, Page>> => {
    console.time('process');
    this.bibliography = await collectBibliography(this.options.root);

    const pages = await getFiles(
      this.options.root,
      this.options.whitelistDirectories
    );
    this.paths = new Set(pages.map((p) => p.data.slug));

    await Promise.all(pages.map((file) => toVFile.read(file, 'utf8')));

    // create pages for all bib references
    Object.values(this.bibliography).forEach((b) => {
      const path = '/biblio/' + b.key;
      if (this.paths.has(path)) return;
      this.paths.add(path);

      pages.push(
        toVFile({
          path,
          contents: '',
          data: {
            slug: path,
            type: 'org',
            title: '',
            links: [],
            backlinks: [],
            excerpt: '',
          },
        })
      );
    });

    await Promise.all(pages.map(this.processPage));
    // populateBacklinks must be called after processing of all pages
    // have finished.
    pages.forEach(this.populateBacklinks);
    const result = Object.fromEntries(pages.map((p) => [p.data.slug, p]));
    console.timeEnd('process');
    return result;
  };

  private processPage = async (file: Page): Promise<Page> => {
    const data = file.data;

    rename(file, { path: data.slug });

    file.bibliography = this.bibliography;
    file.pageExists = this.pageExists;

    const type = data.type;
    data.links = [];
    if (type === 'org') {
      await orgToHtml(file);
    } else if (type === 'bib') {
      await bibtexToHtml(file);
    } else {
      throw new Error(`unknown page type: ${type}`);
    }

    data.links.forEach((other: string) => {
      this.backlinks[other] = this.backlinks[other] || new Set();
      this.backlinks[other].add(data.slug);
    });

    return file;
  };

  private populateBacklinks = async (file: Page) => {
    const links = this.backlinks[file.path!] ?? new Set();
    file.data.backlinks = [...links];
  };
}

const collectBibliography = async (
  root: string
): Promise<Record<string, BibtexEntry>> => {
  const files = await new Promise<VFile[]>((resolve, reject) => {
    findDown.all('.bib', root, (err, files) => {
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
  return entries;
};

const getFiles = (root: string, whitelist: Set<string>) =>
  new Promise<Page[]>((resolve, reject) => {
    findDown.all(
      (file) => {
        const p = path.relative(root, file.path!);
        const dir = path.dirname(p);
        if (!whitelist.has(dir)) {
          return findDown.SKIP;
        }

        const ext = path.extname(p);
        if (ext === '.org' || ext === '.bib') {
          const slug = '/' + p.replace(/\.(org|bib)$/, '');

          const data: PageData = {
            slug,
            type: ext === '.org' ? 'org' : 'bib',
            title: '',
            links: [],
            backlinks: [],
            excerpt: '',
          };

          file.data = data;

          return true;
        }
      },
      root,
      (err, files) => {
        if (err) {
          reject(err);
        } else {
          resolve(files as Page[]);
        }
      }
    );
  });
