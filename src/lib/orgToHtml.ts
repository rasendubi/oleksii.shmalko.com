import unified, { Plugin } from 'unified';
import { VFile } from 'vfile';
import visit from 'unist-util-visit';
import prism from '@mapbox/rehype-prism';
import retext from 'retext';
import smartypants from 'retext-smartypants';
import minify from 'rehype-preset-minify';
import h from 'hastscript';

import orgParse from 'uniorg-parse';
import org2rehype from 'uniorg-rehype';
import processUrls from '@/lib/processUrls';
import excerpt from '@/lib/excerpt';
import toJson from '@/lib/rehypeToJson';

const processor = unified()
  .use(orgParse)
  .use(saveKeywords)
  .use(removeCards)
  .use(orgSmartypants as Plugin<any>, { dashes: 'oldschool' })
  .use(org2rehype)
  .use(bibtexInfo)
  .use(demoteHeadings)
  .use(prism, { ignoreMissing: true })
  .use(processUrls)
  .use(minify)
  .use(toJson)
  .use(excerpt);

export default async function orgToHtml(file: VFile): Promise<VFile> {
  return await processor.process(file);
}

function saveKeywords() {
  return transformer;

  function transformer(tree: any, file: any) {
    visit(tree, 'keyword', (kw: any) => {
      file.data[kw.key.toLowerCase()] = kw.value;
    });
  }
}

function removeCards() {
  return transformer;

  function transformer(tree: any) {
    tree.children = tree.children.filter((child: any) => {
      return !(
        child.type === 'headline' &&
        child.title[0]?.value.toLowerCase() === 'cards'
      );
    });
  }
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

function orgSmartypants(options: any) {
  const processor = retext().use(smartypants, options);
  return transformer;

  function transformer(tree: any) {
    visit(tree, 'text', (node) => {
      node.value = String(processor.processSync(node.value));
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
