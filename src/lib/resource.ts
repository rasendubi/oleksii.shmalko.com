// should match the test in next.config.js
const resourceTest = /\.(svg|png|jpe?g|gif|mp4|pdf|txt|sh|zip)$/i;

export function isResource(path: string): boolean {
  return resourceTest.test(path);
}

/**
 * Try loading a resource. `path` must be relative to the posts
 * directory.
 */
export function loadResource(path: string): string {
  let url = decodeURIComponent(path);
  try {
    url = require('../../posts' + url).default;
  } catch (e) {
    console.log('failed to load resource', path, e);
  }
  return encodeURI(url);
}
