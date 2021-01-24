import { VFile } from 'vfile';
import visit from 'unist-util-visit';
import prism from '@mapbox/rehype-prism';
import katex from 'rehype-katex';
import minify from 'rehype-preset-minify';
import h from 'hastscript';

import processUrls from '@/lib/processUrls';
import excerpt from '@/lib/excerpt';
import json from '@/lib/unified-json';

const processor = json()
  .use(bibtexInfo)
  .use(demoteHeadings)
  .use(prism, { ignoreMissing: true })
  .use(katex)
  .use(processUrls)
  .use(minify)
  .use(excerpt);

export default async function postprocessRehype(file: VFile): Promise<VFile> {
  return await processor.process(file);
}

function demoteHeadings() {
  return transformer;

  function transformer(tree: any) {
    visit(tree, (node: any) => {
      if (node.type !== 'element') return;
      switch (node.tagName) {
        case 'h1':
          node.tagName = 'h2';
          break;
        case 'h2':
          node.tagName = 'h3';
          break;
        case 'h3':
          node.tagName = 'h4';
          break;
        case 'h4':
          node.tagName = 'h5';
          break;
        case 'h5':
          node.tagName = 'h6';
          break;
        case 'h6':
          node.tagName = 'p';
          break;
      }
    });
  }
}

// fill more information for bibliographic notes.
function bibtexInfo() {
  return transformer;

  function transformer(tree: any, file: VFile) {
    const m = file.path?.match(/\/biblio\/(.*)/);
    if (!m) return;

    const bib = (file as any).bibliography[m[1]];
    if (!bib) return;

    if (bib) {
      if (bib.TITLE) {
        (file.data as any).title = bib.TITLE;
      }
      const author = bib.AUTHOR
        ? [h('dt', 'authors'), h('dd', bib.AUTHOR)]
        : [];
      const year = bib.YEAR ? [h('dt', 'year'), h('dd', '' + bib.YEAR)] : [];
      const url = bib.URL
        ? [h('dt', 'url'), h('dd', h('a', { href: bib.URL }, bib.URL))]
        : [];
      tree.children.unshift(h('dl.bibinfo', [...author, ...year, ...url]));
    }
  }
}
