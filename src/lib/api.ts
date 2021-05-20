import * as path from 'path';

import { build, Page } from './build';

export type { Page };

const postsDirectory = path.join(process.cwd(), 'posts');
const blacklistedDirectories = new Set(['life', 'ring']);
const specialPages = new Set(['/', '/uniorg/', '/archive/']);

const dump = build({
  root: postsDirectory,
  blacklistedDirectories,
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
