import React from 'react';

import unified from 'unified';
import rehypeParse from 'rehype-parse';
import rehype2react from 'rehype-react';

import Link from '@/components/Link';

export interface RehypeProps {
  html: string;
}

const processor = unified()
  .use(rehypeParse)
  .use(rehype2react, {
    createElement: React.createElement,
    Fragment: React.Fragment,
    components: {
      a: Link,
    },
  });

const Rehype = ({ html }: RehypeProps) => {
  return <>{processor.processSync(html).result}</>;
};

export default Rehype;
