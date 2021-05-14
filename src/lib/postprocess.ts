import { VFile } from 'vfile';
import visit from 'unist-util-visit';
import prism from '@mapbox/rehype-prism';
import katex from 'rehype-katex';
import 'katex/dist/contrib/mhchem';
import minify from 'rehype-preset-minify';
import h from 'hastscript';

import processUrls from '@/lib/processUrls';
import excerpt from '@/lib/excerpt';
import json from '@/lib/unified-json';

const processor = json()
  .use(bibtexInfo)
  .use(compactLists)
  .use(demoteHeadings)
  .use(prism, { ignoreMissing: true })
  .use(katex)
  .use(processUrls)
  .use(extractImages)
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
    const m = file.path?.match(/\/biblio\/(.*)\//);
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

function extractImages() {
  return transformer;

  function transformer(tree: any, file: any) {
    visit(tree, { type: 'element', tagName: 'img' }, (img: any) => {
      let url = new URL(img.properties.src, 'file://' + file.path);
      const images = file.data.images || (file.data.images = []);
      images.push({ src: url.pathname, alt: img.properties.alt || '' });
    });
  }
}

// If list item starts with a paragraph and that is the only paragraph
// in the item, drop the paragraph tag (lifting up its children).
//
// This compacts the list, as paragraphs have additional spacing which
// becomes too much in dense lists.
function compactLists() {
  return transformer;

  function transformer(tree: any) {
    visit(
      tree,
      (node: any) =>
        node.type === 'element' &&
        (node.tagName === 'li' || node.tagName === 'dd') &&
        node.children?.[0]?.type === 'element' &&
        node.children[0].tagName === 'p' &&
        node.children.filter(
          (n: any) => n.type === 'element' && n.tagName === 'p'
        ).length === 1,
      (node: any) => {
        node.children = [
          ...node.children[0].children,
          ...node.children.slice(1),
        ];
      }
    );
  }
}
