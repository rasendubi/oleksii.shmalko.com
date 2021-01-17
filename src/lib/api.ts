import * as path from 'path';

import { Braindump, Page } from './build';

const postsDirectory = path.join(process.cwd(), 'posts');
const whitelistDirectories = new Set(['.', 'biblio']);
const specialPages = new Set(['/archive']);

const dump = new Braindump({
  root: postsDirectory,
  whitelistDirectories,
  specialPages,
});

export async function getAllPaths(): Promise<string[]> {
  const posts = await dump.getPages();
  return Object.keys(posts);
}

export async function getPostBySlug(slug: string): Promise<Page | undefined> {
  const posts = await dump.getPages();
  return posts[slug];
}

export async function getAllPosts(): Promise<Record<string, Page>> {
  return dump.getPages();
}
