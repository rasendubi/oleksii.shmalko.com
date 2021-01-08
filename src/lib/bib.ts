import { VFile } from 'vfile';
import bibtexParse from 'bibtex-parse';

export function bibEntries(file: VFile) {
  return bibtexParse.entries(file.contents);
}
