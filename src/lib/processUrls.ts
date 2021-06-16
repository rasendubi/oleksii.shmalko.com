import h from 'hastscript';
import rewritePath from './rewrite-path';
import { isResource } from './resource';

export default processUrl;

const formatBib = (bib: any) => {
  if (!bib) return null;

  const lastName = (author: string) =>
    author?.replace(/^(.*),.*$/, '$1').replace(/^.* (.*)$/, '$1');

  const authorLastName = lastName(bib.authors[0]);
  const author2LastName = lastName(bib.authors[1]);

  const author2 = bib.authors.length === 2 ? ` & ${author2LastName}` : '';
  const authors = [{ type: 'text', value: `${authorLastName}${author2}` }];
  const rest = bib.authors.length > 2 ? [{ type: 'text', value: '…' }] : [];

  const cite = authorLastName
    ? [...authors, h('sub', [...rest, '' + bib.YEAR])]
    : [{ type: 'text', value: `cite:${bib.key}` }];

  const title = bib.TITLE ?? null;

  return { cite, title };
};

function processUrl({ url: urlString, propertyName, node, file }: any) {
  // next/link does not handle relative urls properly.
  //
  // file.history[1] is file path relative to root of content. Use it
  // to normalize link against.
  let url = new URL(urlString, 'file:///' + file.history[1]);

  if (url.protocol === 'cite:') {
    const child = node.children[0];

    const key = url.pathname;
    const bib = formatBib(file.bibliography[key]);
    const cite = bib ? bib.cite : [{ type: 'text', value: url.href }];

    if (bib?.title) {
      node.properties.title = bib.title;
    } else {
      console.log('no title for', url.href);
    }

    // do not change text of bibtex notes as they all are "(notes)"
    const isBibtexNotes = node.properties?.className?.includes('bibtex-notes');
    if (isBibtexNotes) {
      // nothing to do
    } else if (child?.type === 'text' && child.value !== url.href) {
      // this is an annotated cite in the form of [[cite:some-book][p.11]]
      // reformat the text to "cite:some-book,p.11"
      node.children = [...cite, { type: 'text', value: `, ${child.value}` }];
    } else {
      node.children = [...cite];
    }

    const ref = url.pathname + url.hash;
    url = new URL(`file:///biblio/${ref}`);
  }

  if (url.protocol === 'id:') {
    const id = url.pathname;
    const ref = file.ids[id];
    if (ref) {
      url = new URL(`file://${ref.path}${url.hash || ref.anchor}`);
    }
  }

  node.properties.className = node.properties.className || [];
  if (url.protocol === 'file:') {
    let pathname = rewritePath(url.pathname);
    node.properties[propertyName] = pathname + url.hash;

    const linkFile = decodeURI(pathname);
    const exists = file.pageExists?.(linkFile);
    if (exists) {
      file.data.links = file.data.links || [];
      file.data.links.push(linkFile);
    } else {
      if (isResource(url.pathname)) {
        // node.properties.className.push('resource');
      } else {
        node.properties.className.push('broken');
      }
    }
  } else {
    node.properties.className.push('external');
  }
}
