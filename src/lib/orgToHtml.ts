import unified from 'unified';
import html from 'rehype-stringify';
import urls from 'rehype-urls';
import raw from 'rehype-raw';
import vfile from 'vfile';
import { select } from 'unist-util-select';

import orgParse from '@/org/unified-org-parse';
import org2rehype from '@/org/unified-org-rehype';

import classes from '@/components/Note.module.scss';

const processor = unified()
  .use(orgParse)
  .use(saveTitle)
  .use(removeCards)
  .use(org2rehype)
  .use(raw)
  .use(urls, removeOrgSuffix)
  .use(html);

export default async function orgToHtml(path: string, org: string) {
  try {
    const result = await processor.process(vfile({ path, contents: org }));
    return {
      title: (result.data as any).title,
      html: result.contents,
    };
  } catch (e) {
    console.warn(e);
    return {
      title: '',
      html: 'This page has failed to render.',
    };
  }
}

function removeOrgSuffix(url: URL, node: any) {
  if (url.protocol === 'cite:') {
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
