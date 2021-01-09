import * as path from 'path';
import toVFile from 'to-vfile';
import { VFile } from 'vfile';
import findDown from 'vfile-find-down';
import orgToHtml from './orgToHtml';
import bibtexToHtml from './bibtex';
import rename from 'vfile-rename';

interface PostData {
  type: 'org' | 'bib';
  title: string;
  slug: string;
  bibtexEntries?: any[];
}
type Post = VFile & { data: PostData };

const postsDirectory = path.join(process.cwd(), 'posts');
const whitelistDirectories = new Set(['.', 'biblio']);

const lazy = <T extends (...params: any[]) => any>(
  f: T,
  ...params: Parameters<T>
): (() => ReturnType<T>) => {
  let result: undefined | { result: ReturnType<T> } = undefined;
  return () => {
    if (
      !result ||
      // trigger re-processing page on page reload in development mode
      process.env.NODE_ENV !== 'production'
    ) {
      result = { result: f(...params) };
    }
    return result.result;
  };
};

const getFiles = (root: string, whitelist: Set<string>) =>
  new Promise<VFile[]>((resolve, reject) => {
    findDown.all(
      (file) => {
        const p = path.relative(root, file.path!);
        const dir = path.dirname(p);
        if (!whitelist.has(dir)) {
          return findDown.SKIP;
        }

        const ext = path.extname(p);
        if (ext === '.org' || ext === '.bib') {
          const slug = '/' + p.replace(/\.org$/, '');
          (file.data as any).slug = slug;
          (file.data as any).type = ext === '.org' ? 'org' : 'bib';
          return true;
        }
      },
      root,
      (err, files) => {
        if (err) {
          reject(err);
        } else {
          resolve(files!);
        }
      }
    );
  });

const processPost = async (file: VFile) => {
  await toVFile.read(file, 'utf8');

  const data = file.data as any;

  rename(file, { path: data.slug });

  const type = data.type;
  if (type === 'org') {
    await orgToHtml(file);
  } else if (type === 'bib') {
    await bibtexToHtml(file);
  } else {
    throw new Error(`unknown post type: ${type}`);
  }

  return file;
};

const loadPosts = async (): Promise<
  Record<string, undefined | (() => Promise<Post>)>
> => {
  const files = await getFiles(postsDirectory, whitelistDirectories);
  const posts = Object.fromEntries(
    files.map((f) => [(f.data as any).slug, lazy(processPost, f)])
  );
  return posts;
};

let posts: Record<string, undefined | (() => Promise<Post>)> | null = null;
const postsPromise = loadPosts();
postsPromise.then((p) => {
  posts = p;
});

export async function getAllPaths(): Promise<string[]> {
  const posts = await postsPromise;
  return Object.keys(posts);
}

export async function isPostExists(slug: string): Promise<boolean> {
  const posts = await postsPromise;
  return !!posts[slug];
}
export function isPostExistsSync(slug: string): boolean | null {
  return !!posts?.[slug];
}

export async function getPostBySlug(slug: string): Promise<Post | undefined> {
  const posts = await postsPromise;
  const post = await posts[slug]?.();
  return post;
}
