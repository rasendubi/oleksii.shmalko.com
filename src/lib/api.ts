import * as path from 'path';

import { build, Page } from './build';

export type { Page };

const postsDirectory = path.join(process.cwd(), 'posts');
const allowDirectoryScan = (path: string) => {
  return (
    path === '/' || path.startsWith('/posts/') || path.startsWith('/biblio/')
  );
};
const specialPages = new Set(['/', '/uniorg/', '/archive/']);

const dump = build({
  root: postsDirectory,
  allowDirectoryScan,
  specialPages,
});

export async function getAllPaths(): Promise<string[]> {
  const posts = await dump;
  return Object.keys(posts);
}

export async function getPostBySlug(slug: string): Promise<Page | undefined> {
  const posts = await dump;
  return posts[slug];
}

export async function getAllPosts(): Promise<Record<string, Page>> {
  return dump;
}
