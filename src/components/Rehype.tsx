import React from 'react';

import unified from 'unified';
import rehype2react from 'rehype-react';

import Link from '@/components/Link';
import { loadResource } from '@/lib/resource';

export interface RehypeProps {
  hast: any;
}

const Img = ({ src, alt }: any) => {
  return <img alt={alt} src={loadResource(src)} />;
};

const processor = unified().use(rehype2react, {
  createElement: React.createElement,
  Fragment: React.Fragment,
  components: {
    a: Link,
    img: Img,

    notice: (props: any) => {
      return (
        <span className="block notice">
          {props.children}
          <style jsx>{`
            .notice {
              border-color: #2fcddf;
            }
          `}</style>
        </span>
      );
    },
    important: (props: any) => {
      return (
        <span className="block important">
          {props.children}
          <style jsx>{`
            .important {
              border-color: #f08290;
            }
          `}</style>
        </span>
      );
    },
  },
});

const Rehype = ({ hast }: RehypeProps) => {
  return <>{processor.stringify(hast)}</>;
};

export default Rehype;
