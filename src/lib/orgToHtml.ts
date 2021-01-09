import unified, { Plugin } from 'unified';
import { VFile } from 'vfile';
import { select } from 'unist-util-select';
import visit from 'unist-util-visit';
import prism from '@mapbox/rehype-prism';
import retext from 'retext';
import smartypants from 'retext-smartypants';
import minify from 'rehype-preset-minify';

import orgParse from '@/org/unified-org-parse';
import org2rehype from '@/org/unified-org-rehype';
import processUrls from '@/lib/processUrls';
import excerpt from '@/lib/excerpt';
import toJson from '@/lib/rehypeToJson';

const processor = unified()
  .use(orgParse)
  .use(saveTitle)
  .use(removeCards)
  .use(orgSmartypants as Plugin<any>, { dashes: 'oldschool' })
  .use(org2rehype)
  .use(demoteHeadings)
  .use(prism, { ignoreMissing: true })
  .use(processUrls)
  .use(minify)
  .use(toJson)
  .use(excerpt);

export default async function orgToHtml(file: VFile): Promise<VFile> {
  return await processor.process(file);
}

function saveTitle() {
  return transformer;

  function transformer(tree: any, file: any) {
    const title = select('keyword[key=TITLE]', tree);
    file.data.title = title ? title.value : '';
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
