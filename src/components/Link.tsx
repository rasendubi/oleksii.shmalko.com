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
        {external && (
          <svg
            aria-hidden="true"
            focusable="false"
            data-prefix="fas"
            data-icon="external-link-alt"
            className={classes['fa-external-link-alt']}
            role="img"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 512 512"
          >
            <path d="M432,320H400a16,16,0,0,0-16,16V448H64V128H208a16,16,0,0,0,16-16V80a16,16,0,0,0-16-16H48A48,48,0,0,0,0,112V464a48,48,0,0,0,48,48H400a48,48,0,0,0,48-48V336A16,16,0,0,0,432,320ZM488,0h-128c-21.37,0-32.05,25.91-17,41l35.73,35.73L135,320.37a24,24,0,0,0,0,34L157.67,377a24,24,0,0,0,34,0L435.28,133.32,471,169c15,15,41,4.5,41-17V24A24,24,0,0,0,488,0Z"></path>
          </svg>
        )}
      </a>
    );
  }
);

export default LinkView;
