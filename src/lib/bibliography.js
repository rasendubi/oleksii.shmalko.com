import fs from 'fs/promises';
import bibtexParse from 'bibtex-parse';

const biblioFiles = [
  // using paths relative to CWD because this module is bundled to
  // /dist/entry.mjs, so file-relative URL (import.meta.url) doesn't
  // work
  'posts/biblio/books.bib',
  'posts/biblio/papers.bib',
  'posts/biblio/online.bib',
];

export const bibliography = Promise.all(
  biblioFiles.map(async (f) => {
    const data = await fs.readFile(f, { encoding: 'utf8' });
    return bibtexParse.entries(data);
  })
).then((xs) => {
  const bibliography = new Map();
  xs.flat().forEach((e) => {
    bibliography.set(e.key, e);
  });
  return bibliography;
});
