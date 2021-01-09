import inspectUrls from 'rehype-url-inspector';
import { isPostExistsSync } from './api';

function processUrls(this: any) {
  this.use(inspectUrls, { inspectEach: processUrl });
}
export default processUrls;

function processUrl({ url: urlString, propertyName, node, file }: any) {
  // next/link does not handle relative urls properly. Use file.path
  // (the slug of the file) to normalize link against.
  let url = new URL(urlString, 'file://' + file.path);

  if (url.protocol === 'cite:') {
    const child = node.children[0];

    // do not change text of bibtex notes as they all are "(notes)"
    const isBibtexNotes = node.properties?.className?.includes('bibtex-notes');
    if (child?.type === 'text' && child.value !== url.href && !isBibtexNotes) {
      // this is an annotated cite in the form of [[cite:some-book][p.11]]
      // reformat the text to "cite:some-book,p.11"
      node.children = [{ type: 'text', value: `${url.href},${child.value}` }];
    }

    const ref = url.pathname;
    url = new URL(`file:///biblio/${ref}`);
  }

  if (url.protocol === 'file:') {
    let href = url.pathname.replace(/\.org$/, '');
    node.properties[propertyName] = encodeURI(href);

    const exists = isPostExistsSync(href);
    if (!exists) {
      node.properties.className = node.properties.className || [];
      node.properties.className.push('broken');
    }
  } else {
    node.properties.className = node.properties.className || [];
    node.properties.className.push('external');
  }
}
