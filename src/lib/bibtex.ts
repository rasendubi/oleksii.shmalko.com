import { VFile } from 'vfile';
import bibtexParse from 'bibtex-parse';
import u from 'unist-builder';
import h from 'hastscript';

import json from '@/lib/unified-json';

const processor = json().use(parseBibtex).use(bibtex2rehype);

export function bibtexToHtml(file: VFile) {
  return processor.process(file);
}
export default bibtexToHtml;

export function parseBibtex(this: any) {
  this.Parser = (text: string) => {
    return u('bibtex-entries', { entries: bibtexParse.entries(text) });
  };
}

export function bibtex2rehype() {
  return transformer;

  function transformer(node: any, file: VFile) {
    const base = file.basename!.replace(/\.bib$/, '');
    (file.data as any).title = '§ ' + base[0].toUpperCase() + base.slice(1);

    return h(
      'ul.wide',
      node.entries.map((e: any) => h('li', [...entryToHast(e)]))
    );
  }

  function entryToHast(e: any) {
    const year = e.YEAR ? ` ${e.YEAR}` : '';
    const title = e.URL
      ? h('a', { href: e.URL }, h('em', e.TITLE))
      : h('em', e.TITLE);
    const notes = [
      ' (',
      h('a', { href: 'cite:' + e.key, className: 'bibtex-notes' }, 'notes'),
      ')',
    ];
    return [
      ...(e.AUTHOR ? [e.AUTHOR, year, ', ', title] : [title, year]),
      ...notes,
    ];
  }
}
