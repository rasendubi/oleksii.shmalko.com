import type { Plugin } from 'unified';
import type { VFile } from 'vfile';
import { visit } from 'unist-util-visit';
import retext from 'retext';
import smartypants from 'retext-smartypants';

import type { Headline, NodeProperty, PropertyDrawer, Text } from 'uniorg';
import orgParse from 'uniorg-parse';
import org2rehype from 'uniorg-rehype';
import { uniorgSlug } from 'uniorg-slug';
import json from './unified-json';
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
  try {
    return await processor.process(file);
  } catch (e) {
    console.error('Error building file', file.path, e);
    throw e;
  }
}

function saveProperties() {
  return transformer;

  function transformer(tree: any, file: any) {
    const data = file.data || (file.data = {});

    const props = tree.children.find(
      (node: any) => node.type === 'property-drawer'
    ) as PropertyDrawer | undefined;
    if (!props) {
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
      } else if (node.type === 'section') {
        const headline = node.children[0] as Headline;
        const data: any = (headline.data = headline.data || {});
        if (!data?.hProperties?.id) {
          // The headline doesn't have an html id assigned.
          //
          // Assign an html id property based on org id property, so
          // the links are not broken.
          data.hProperties = data.hProperties || {};
          data.hProperties.id = id;
        }

        ids[id] = '#' + data?.hProperties?.id;
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
        child.type === 'section' &&
        (child.children[0] as Headline).rawValue.toLowerCase() === 'cards'
      );
    });
  }
}

function orgSmartypants(options: any) {
  const processor = retext().use(smartypants, options);
  return transformer;

  function transformer(tree: any) {
    visit(tree, 'text', (node: Text) => {
      node.value = String(processor.processSync(node.value));
    });
  }
}
