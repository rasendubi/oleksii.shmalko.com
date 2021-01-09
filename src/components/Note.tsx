import React from 'react';

import classes from './Note.module.scss';
import Backlink, { BacklinkProps } from './Backlink';
import Rehype from './Rehype';

export interface NoteProps {
  title: string;
  html: string;
  backlinks: BacklinkProps[];
}

const Note = ({ title, html, backlinks }: NoteProps) => {
  return (
    <>
      <div className={classes.note}>
        <h1>{title}</h1>
        <Rehype html={html} />
      </div>
      {!!backlinks.length && (
        <div style={{ marginTop: 40 }}>
          <h2>{'Backlinks'}</h2>
          <ul className="wide">
            {backlinks.map((b) => (
              <li key={b.slug}>
                <Backlink {...b} />
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
};

export default Note;
