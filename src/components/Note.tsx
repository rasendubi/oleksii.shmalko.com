import React from 'react';

import classes from './Note.module.scss';
import Backlink, { BacklinkProps } from './Backlink';
import Rehype from './Rehype';
import Header from './Header';

export interface NoteProps {
  pageType: string;
  slug: string;
  title: string;
  isodate?: string;
  date?: string;
  lastModifiedIso?: string;
  lastModified?: string;
  images: Array<{ src: string; alt: string }>;
  hast: string;
  backlinks: BacklinkProps[];
}

const Note = ({ hast, backlinks, ...props }: NoteProps) => {
  return (
    <>
      <Header {...props} />
      <div className={classes.note}>
        <Rehype hast={hast} />
      </div>
      {!!backlinks.length && (
        <div style={{ marginTop: 24 }}>
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
