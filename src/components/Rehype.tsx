import React from 'react';
import { useAmp } from 'next/amp';

import unified from 'unified';
import rehype2react from 'rehype-react';

import Link from '@/components/Link';

export interface RehypeProps {
  hast: any;
}

const Img = ({ className, ...props }: any) => {
  const isAmp = useAmp();
  return isAmp ? (
    <amp-img {...props} layout="responsive" />
  ) : (
    <img className={className} {...props} />
  );
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
