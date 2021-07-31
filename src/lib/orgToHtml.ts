import { Plugin } from 'unified';
import { VFile } from 'vfile';
import visit from 'unist-util-visit';
import retext from 'retext';
import smartypants from 'retext-smartypants';

import type { NodeProperty } from 'uniorg';
import orgParse from 'uniorg-parse';
import org2rehype from 'uniorg-rehype';
import { uniorgSlug } from 'uniorg-slug';
import json from '@/lib/unified-json';
import { visitIds } from 'orgast-util-visit-ids';

const processor = json()
  .use(orgParse)
  .use(saveKeywords)
  .use(saveProperties)
  .use(removeCards)
  .use(orgSmartypants as Plugin<any>, { dashes: 'oldschool' })
  .use(uniorgSlug)
  .use(saveIds)
  .use(org2rehype);

export default async function orgToHtml(file: VFile): Promise<VFile> {
  return await processor.process(file);
}

function saveProperties() {
  return transformer;

  function transformer(tree: any, file: any) {
    const data = file.data || (file.data = {});

    const props = tree.children[0]?.children?.[0];
    if (props?.type !== 'property-drawer') {
      return;
    }
    visit(props, 'node-property', (prop: NodeProperty) => {
      data[prop.key] = prop.value;
    });
  }
}

function saveIds() {
  return transformer;

  function transformer(tree: any, file: any) {
    const data = file.data || (file.data = {});
    const ids = data.ids || (data.ids = {});

    visitIds(tree, (id, node) => {
      if (node.type === 'org-data') {
        ids[id] = '';
      } else if (node.type === 'headline') {
        if (!node.data?.hProperties?.id) {
          // The headline doesn't have an html id assigned.
          //
          // Assign an html id property based on org id property, so
          // the links won't be broken.
          node.data = node.data || {};
          node.data.hProperties = node.data.hProperties || {};
          node.data.hProperties.id = id;
        }

        ids[id] = '#' + node.data?.hProperties?.id;
      }
    });
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
