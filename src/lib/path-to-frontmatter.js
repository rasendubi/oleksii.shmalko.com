import * as path from 'path';
import * as fs from 'fs/promises';

const postsDirectory = new URL('../../posts', import.meta.url);

export const pathToFrontmatter = async (p) => {
  const relpath = path.relative(await fs.realpath(postsDirectory.pathname), p);
  const cleanName = relpath
    .replace(/\.(org|md|bib)$/, '')
    .replace(/(^|\/)index$/, '')
    .replace(/^posts\//, '');
  const slug = ('/' + cleanName + '/').replaceAll(/\/+/g, '/');
  const pageType = getPageType(relpath);

  const isBib = p.endsWith('.bib');

  let title = cleanName.split('/').pop();
  if (title) {
    title = (isBib ? '§ ' : '') + title[0]?.toUpperCase() + title.slice(1);
  }

  return {
    title,
    renderer: isBib ? 'bib' : 'post',
    slug,
    pageType,
    icon: getPageIcon(pageType),
  };
};

const getPageType = (path) => {
  if (path.startsWith('biblio')) return 'biblio';
  if (path.startsWith('posts')) return 'post';
  return 'note';
};

const getPageIcon = (type) => {
  if (!type) return null;
  if (type === 'biblio') return '📖';
  if (type === 'post') return '🖋';
  return '📝';
};
