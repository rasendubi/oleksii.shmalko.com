import React from 'react';

import classes from './Note.module.scss';
import Backlink, { BacklinkProps } from './Backlink';
import Rehype from './Rehype';
import Header from './Header';

export interface NoteProps {
  slug: string;
  title: string;
  images: Array<{ src: string; alt: string }>;
  hast: string;
  backlinks: BacklinkProps[];
}

const Note = ({ slug, title, images, hast, backlinks }: NoteProps) => {
  return (
    <>
      <Header slug={slug} title={title} images={images} />
      <div className={classes.note}>
        <Rehype hast={hast} />
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
