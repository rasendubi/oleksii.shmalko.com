// should match the test in next.config.js
const resourceTest = /\.(svg|png|jpe?g|gif|mp4|pdf|txt|sh|zip)$/i;

export function isResource(path: string): boolean {
  return resourceTest.test(path);
}

const assets =
  import.meta.glob?.(
    [
      '../../posts/**/*.png',
      '../../posts/**/*.svg',
      '../../posts/**/*.jpg',
      '../../posts/**/*.jpeg',
      '../../posts/**/*.gif',
      '../../posts/**/*.sh',
      '../../posts/**/*.txt',
    ],
    { as: 'url' }
  ) ?? {};

/**
 * Try loading a resource. `path` must be relative to the posts
 * directory.
 */
export async function loadResource(path: string): Promise<string> {
  let url = decodeURIComponent(path);
  try {
    url = await assets['../../posts' + url]();
  } catch (e) {
    console.log('failed to load resource', { path, url }, e);
  }

  return encodeURI(url);
}

/**
 * This function must be called on the client side so that webpack
 * bundles all resources for the web.
 */
export function bundleResources(): void {
  // It is a no-op, but importing this module forces webpack to
  // prepare for dynamically requiring any file from `posts` directory
  // and bundle all resources.
  //
  // Even though require() is never called dynamically on the client
  // side, the resources are still exported and can be accessed by
  // urls (generated server-side).
}
