import path from 'path';
import { isResource, loadResource } from './resource';

export function rewritePagePath(p: string): string {
  let result = '/' + p.replace(/^\//, '');

  const ext = path.extname(p);
  if (ext === '' || ext === '.org' || ext === '.bib' || ext === '.md') {
    result = result
      .replace(/\.(org|bib|md)$/, '')
      .replace(/^\/posts\//, '/')
      .replace(/\/index$/, '');

    if (result[result.length - 1] !== '/') {
      result = result + '/';
    }
  }

  return result;
}

export default async function rewritePath(p: string): Promise<string> {
  if (isResource(p)) {
    return await loadResource(p);
  } else {
    return rewritePagePath(p);
  }
}
