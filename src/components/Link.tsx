import React from 'react';
import clsx from 'clsx';

import classes from './Link.module.css';

const LinkView = React.forwardRef(
  ({ className, children, href, ...props }: any, ref) => {
    const external = className && className.includes('external');
    return (
      <a
        ref={ref}
        rel={external ? 'noopener' : undefined}
        target={external ? '_blank' : undefined}
        {...props}
        href={href}
        className={clsx(classes.link, className)}
      >
        {children}
      </a>
    );
  }
);

export default LinkView;
