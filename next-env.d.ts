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
