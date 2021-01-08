import React from 'react';
import Link from 'next/link';

import unified from 'unified';
import rehypeParse from 'rehype-parse';
import rehype2react from 'rehype-react';

import classes from './Note.module.scss';

const A = ({ href, children, ...props }: any) => {
  const absolute = href && !!href.match(/^https?:\/\//);
  return (
    <Link href={href}>
      <a className={absolute ? 'external' : 'internal'} {...props}>
        {children}
        {absolute && (
          <svg
            aria-hidden="true"
            focusable="false"
            data-prefix="fas"
            data-icon="external-link-alt"
            className="svg-inline--fa fa-external-link-alt fa-w-16"
            role="img"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 512 512"
          >
            <path d="M432,320H400a16,16,0,0,0-16,16V448H64V128H208a16,16,0,0,0,16-16V80a16,16,0,0,0-16-16H48A48,48,0,0,0,0,112V464a48,48,0,0,0,48,48H400a48,48,0,0,0,48-48V336A16,16,0,0,0,432,320ZM488,0h-128c-21.37,0-32.05,25.91-17,41l35.73,35.73L135,320.37a24,24,0,0,0,0,34L157.67,377a24,24,0,0,0,34,0L435.28,133.32,471,169c15,15,41,4.5,41-17V24A24,24,0,0,0,488,0Z"></path>
          </svg>
        )}

        <style jsx>{`
          a {
            text-decoration: none;
            color: #315b00;
            background-color: #f0f0f0;
          }
          a:hover {
            background-color: #aecf90;
            color: #282828;
          }
          a.external {
            color: #2544bb;
            padding-right: 12px;
          }
          a.external:hover {
            background-color: #b5d0ff;
            color: #282828;
          }
          a.external:hover > .fa-external-link-alt {
            fill: #282828;
          }
          .fa-external-link-alt {
            display: inline-block;
            vertical-align: super;
            fill: #2544bb;
            width: 12px;
            height: 10px;
            padding-left: 2px;

            // Use negative margin to prevent wrapping the icon alone:
            // https://stackoverflow.com/a/25857961
            margin-right: -10px;
          }
        `}</style>
      </a>
    </Link>
  );
};

const processor = unified()
  .use(rehypeParse)
  .use(rehype2react, {
    createElement: React.createElement,
    Fragment: React.Fragment,
    components: {
      a: A,
    },
  });

export interface NoteProps {
  title: string;
  html: string;
}

const Note = ({ title, html }: NoteProps) => {
  return (
    <div className={classes.note_wrapper}>
      <div className={classes.note}>
        <h1>{title}</h1>
        {processor.processSync(html).result}
      </div>
    </div>
  );
};

export default Note;
