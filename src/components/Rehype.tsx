import React from 'react';

import unified from 'unified';
import rehype2react from 'rehype-react';

import Link from '@/components/Link';

export interface RehypeProps {
  hast: any;
}

const processor = unified().use(rehype2react, {
  createElement: React.createElement,
  Fragment: React.Fragment,
  components: {
    a: Link,
  },
});

const Rehype = ({ hast }: RehypeProps) => {
  return <>{processor.stringify(hast)}</>;
};

export default Rehype;
