import { VFile } from 'vfile';
import visit from 'unist-util-visit';
import prism from '@mapbox/rehype-prism';
import katex from 'rehype-katex';
import 'katex/dist/contrib/mhchem';
import minify from 'rehype-preset-minify';
import h from 'hastscript';
import rehypeRaw from 'rehype-raw';
import inspectUrls from 'rehype-url-inspector';
import link from 'rehype-autolink-headings';
import sizeOf from 'image-size';
import toString from 'hast-util-to-string';
import { matches, selectAll } from 'hast-util-select';

import processUrl from '@/lib/processUrls';
import json from '@/lib/unified-json';

const processor = json()
  .use(rehypeRaw)
  .use(bibtexInfo)
  .use(demoteHeadings)
  .use(prism, { ignoreMissing: true })
  .use(katex)
  .use(sizeImages)
  .use(inspectUrls, { inspectEach: processUrl })
  .use(extractImages)
  .use(link, { behavior: 'wrap' })
  .use(minify)
  // minify removes extra spaces within paragraphs, so description
  // should preferrably be used after minify.
  //
  // compactLists removes some p's, so description misses them. Use
  // description before compactLists.
  .use(description)
  .use(compactLists);

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

function sizeImages() {
  return transformer;

  function transformer(tree: any, file: any) {
    visit(tree, { type: 'element', tagName: 'img' }, (img: any) => {
      if (img.properties.src) {
        const url = new URL(img.properties.src, 'file:///' + file.history[1]);
        const f = './posts' + decodeURIComponent(url.pathname);
        const { height, width } = sizeOf(f);
        img.properties.height = height;
        img.properties.width = width;
      }
    });
  }
}

function extractImages() {
  return transformer;

  function transformer(tree: any, file: any) {
    visit(tree, { type: 'element', tagName: 'img' }, (img: any) => {
      const images = file.data.images || (file.data.images = []);
      images.push({ src: img.properties.src, alt: img.properties.alt || '' });
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
        node.children?.length === 1 &&
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

// Extract description from the first paragraph.
function description() {
  return transformer;

  function transformer(node: any, file: VFile) {
    const data: any = file.data;
    if (data.description) {
      return;
    }

    const fakeRoot = h('div', { class: 'root' }, node.children);
    const p = selectAll(
      '.root > p, .root > ul > li > p, .root > ol > li > p',
      fakeRoot
    ).filter(
      // filter out image-only elements
      (p: any) => p.children.filter((c: any) => !matches('img', c)).length
    )[0];

    if (p) {
      const description = toString(p);
      // console.log(file.path, description);

      data.description = description;
    }
  }
}
