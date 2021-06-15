import { Plugin } from 'unified';
import { VFile } from 'vfile';
import visit from 'unist-util-visit';
import visitParents from 'unist-util-visit-parents';
import retext from 'retext';
import smartypants from 'retext-smartypants';

import orgParse from 'uniorg-parse';
import org2rehype from 'uniorg-rehype';
import { uniorgSlug } from 'uniorg-slug';
import json from '@/lib/unified-json';

const processor = json()
  .use(orgParse)
  .use(saveKeywords)
  .use(removeCards)
  .use(saveIds)
  .use(orgSmartypants as Plugin<any>, { dashes: 'oldschool' })
  .use(uniorgSlug)
  .use(org2rehype);

export default async function orgToHtml(file: VFile): Promise<VFile> {
  return await processor.process(file);
}

function saveIds() {
  return transformer;

  function transformer(tree: any, file: any) {
    visitParents(
      tree,
      { type: 'node-property', key: 'ID' },
      (property, ancestors) => {
        let parent = ancestors.pop();
        while (
          parent &&
          parent.type !== 'headline' &&
          parent.type !== 'org-data'
        ) {
          parent = ancestors.pop();
        }

        const id: string = (property as any).value;
        file.data.ids = file.data.ids ?? [];
        file.data.ids.push([id, parent!]);
      }
    );
  }
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
        child.title[0]?.value?.toLowerCase() === 'cards'
      );
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
