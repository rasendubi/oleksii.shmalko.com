import unified, { Plugin } from 'unified';
import html from 'rehype-stringify';
import inspectUrls from 'rehype-url-inspector';
import vfile from 'vfile';
import { select } from 'unist-util-select';
import visit from 'unist-util-visit';
import prism from '@mapbox/rehype-prism';
import retext from 'retext';
import smartypants from 'retext-smartypants';

import orgParse from '@/org/unified-org-parse';
import org2rehype from '@/org/unified-org-rehype';

const processor = unified()
  .use(orgParse)
  .use(saveTitle)
  .use(removeCards)
  .use(orgSmartypants as Plugin<any>, { dashes: 'oldschool' })
  .use(org2rehype)
  .use(inspectUrls, {
    inspectEach: processUrl,
  })
  .use(demoteHeadings)
  .use(prism, { ignoreMissing: true })
  .use(html);

export default async function orgToHtml(file: vfile.VFile) {
  const result = await processor.process(file);
  return {
    title: (result.data as any).title,
    html: result.contents,
  };
}

function processUrl({ url: urlString, propertyName, node, file }: any) {
  // next/link does not handle relative urls properly. Use
  // file.history[0] (the original slug of the file) to normalize link
  // against.
  const url = new URL(urlString, 'file://' + file.history[0]);

  if (url.protocol === 'cite:') {
    const child = node.children[0];
    if (child?.type === 'text' && child.value !== url.href) {
      // this is an annotated cite in the form of [[cite:some-book][p.11]]
      // reformat the text to "cite:some-book,p.11"
      child.value = `${url.href},${child.value}`;
    }

    const ref = url.pathname;
    node.properties[propertyName] = `/biblio/${ref}`;
    return;
  }

  if (url.protocol === 'file:') {
    let href = url.pathname.replace(/\.org$/, '');
    node.properties[propertyName] = encodeURI(href);
  } else {
    node.properties.className = node.properties.className || [];
    node.properties.className.push('external');
  }
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
