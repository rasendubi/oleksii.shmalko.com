/// <reference types="next" />
/// <reference types="next/types/global" />

declare module '*.scss' {
  const content: Record<string, string>;
  export default content;
}

declare module 'rehype-urls' {
  const urls: any;
  export default urls;
}

declare module 'rehype-format' {
  const format: any;
  export default format;
}

declare module 'rehype-highlight' {
  const x: any;
  export default x;
}

declare module '@mapbox/rehype-prism' {
  const x: any;
  export default x;
}

declare module 'retext' {
  const x: any;
  export default x;
}
declare module 'retext-smartypants' {
  const x: any;
  export default x;
}
declare module 'bibtex-parse' {
  const x: any;
  export default x;
}

declare module 'to-vfile' {
  const x: any;
  export default x;
}

declare module 'vfile-rename' {
  const x: any;
  export default x;
}

declare module 'rehype-truncate' {
  const x: any;
  export default x;
}

declare module 'rehype-preset-minify' {
  const x: any;
  export default x;
}

declare module 'trough' {
  const x: any;
  export default x;
}
