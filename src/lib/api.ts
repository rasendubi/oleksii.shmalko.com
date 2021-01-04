import * as path from 'path';
import * as fs from 'fs';

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
      } else if (e.isFile() && e.name.match(/\.org$/)) {
        result.push(curP);
      }
    });
  };
  traverse([]);

  return result;
}

export function getPostBySlug(slug: string[]) {
  const realSlug = path.join(...slug).replace(/\.org$/, '');
  const fullPath = path.join(postsDirectory, `${realSlug}.org`);
  const fileContents = fs.readFileSync(fullPath, 'utf8');
  return { path: fullPath, slug: realSlug, content: fileContents };
}

export function getAllPosts() {
  const slugs = getPostSlugs();
  const posts = slugs.map(getPostBySlug);
  return posts;
}
