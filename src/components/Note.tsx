import React from 'react';

import unified from 'unified';
import rehypeParse from 'rehype-parse';
import rehype2react from 'rehype-react';

import Link from '@/components/Link';
import classes from './Note.module.scss';

const processor = unified()
  .use(rehypeParse)
  .use(rehype2react, {
    createElement: React.createElement,
    Fragment: React.Fragment,
    components: {
      a: Link,
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
