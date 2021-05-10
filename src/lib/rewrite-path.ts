import path from 'path';

export default function rewritePath(p: string): string {
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
