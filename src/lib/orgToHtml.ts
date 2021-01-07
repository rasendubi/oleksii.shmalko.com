import unified from 'unified';
import html from 'rehype-stringify';
import urls from 'rehype-urls';
import raw from 'rehype-raw';
import vfile from 'vfile';
import { select } from 'unist-util-select';
import visit from 'unist-util-visit';

import orgParse from '@/org/unified-org-parse';
import org2rehype from '@/org/unified-org-rehype';

import classes from '@/components/Note.module.scss';

const processor = unified()
  .use(orgParse)
  .use(saveTitle)
  .use(removeCards)
  .use(org2rehype)
  .use(raw)
  .use(urls, processUrls)
  .use(demoteHeadings)
  .use(html);

export default async function orgToHtml(path: string, org: string) {
  const result = await processor.process(vfile({ path, contents: org }));
  return {
    title: (result.data as any).title,
    html: result.contents,
  };
}

function processUrls(url: URL, node: any) {
  if (url.protocol === 'cite:') {
    const child = node.children[0];
    if (child?.type === 'text' && child.value !== url.href) {
      // this is an annotated cite in the form of [[cite:some-book][p.11]]
      // reformat the text to "cite:some-book,p.11"
      child.value = `${url.href},${child.value}`;
    }

    const ref = url.hostname;
    return `/biblio/${ref}`;
  }

  if (url.host) {
    node.properties.className = classes.link_external;
  }
  if (url.host === null && url.pathname.match(/\.org$/)) {
    return url.pathname.replace(/\.org$/, '');
  } else if (url.host === null) {
    return encodeURI(url.pathname);
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
