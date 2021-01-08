import * as path from 'path';
import * as fs from 'fs';
import vfile from 'to-vfile';
import { VFile } from 'vfile';

const postsDirectory = path.join(process.cwd(), 'posts');

export function getPostSlugs() {
  const result: string[][] = [];

  const whitelist = new Set(['biblio']);

  const traverse = (p: string[]) => {
    const fullPath = path.join(postsDirectory, ...p);
    fs.readdirSync(fullPath, { withFileTypes: true }).forEach((e) => {
      const curP = [...p, e.name];
      if (e.isDirectory() && whitelist.has(path.join(...curP))) {
        traverse(curP);
      } else if (e.isFile() && e.name.match(/\.(org|bib)$/)) {
        result.push(curP);
      }
    });
  };
  traverse([]);

  return result;
}

export function getPostBySlug(slug: string[]) {
  const realSlug = path.join(...slug).replace(/\.org$/, '');
  const type = realSlug.endsWith('.bib') ? 'bib' : 'org';
  const fullPath =
    type === 'org'
      ? path.join(postsDirectory, `${realSlug}.org`)
      : path.join(postsDirectory, realSlug);
  const file: VFile = vfile.readSync(
    {
      path: fullPath,
      history: [path.join('/', ...slug)],
    },
    'utf8'
  );
  return { type, path: fullPath, slug: realSlug, file };
}

export function getAllPosts() {
  const slugs = getPostSlugs();
  const posts = slugs.map(getPostBySlug);
  return posts;
}
