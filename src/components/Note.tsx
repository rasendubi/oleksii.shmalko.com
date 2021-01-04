import React from 'react';

import classes from './Note.module.scss';

export interface NoteProps {
  title: string;
  html: string;
}

const Note = ({ title, html }: NoteProps) => {
  return (
    <div className={classes.note}>
      <h1>{title}</h1>
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
};

export default Note;
