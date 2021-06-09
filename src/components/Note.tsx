import React from 'react';

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
    <article>
      <Header {...props} />
      <div className="note">
        <Rehype hast={hast} />

        <style jsx global>{`
          pre.src-block {
            background-color: #f0f0f0;
          }

          .token.comment {
            color: #505050;
          }
          .token.keyword {
            font-weight: 700;
            color: #5317ac;
          }
          .token.string {
            color: #2544bb;
          }
          .token.function,
          .token.variable {
            color: #721045;
            font-weight: 500;
          }
          .token.car {
            color: #00538b;
          }
          .token.builtin {
            color: #00538b;
            font-weight: 500;
          }
          .token.punctuation {
            color: #56576d;
          }

          // make top-level images slightly wider
          .note > p > img:only-child,
          .note > div > p > img:only-child {
            margin-left: -16px;
            margin-right: -16px;
            max-width: calc(100% + 32px);
          }

          // allow top-level quotes to be slightly wider
          .note > blockquote,
          .note > div > blockquote,
          .note > pre.verse,
          .note > div > pre.verse,
          .note > .block,
          .note > div > .block {
            margin-left: -16px;
            margin-right: -16px;
            padding-left: 16px;
            padding-right: 16px;
          }
        `}</style>
        <style jsx>{`
          .note,
          .note > div {
            display: flex;
            flex-direction: column;
          }

          .note table {
            display: block;
            border-collapse: collapse;
            font-size: 0.9em;
            overflow-x: auto;
          }
          .note > table,
          .note > div > table {
            // allow top-level tables to grow
            max-width: calc(100vw - 32px);
            align-self: center;
          }

          .note th,
          .note td {
            padding: 12px 15px;
          }
          .note thead,
          .note tbody {
            border-bottom: 2px solid #888888;
          }
          .note tbody {
            border-top: 2px solid #888888;
          }
          .note thead tr {
            background-color: #e5e5e5;
            text-align: left;
            font-weight: 700;
          }
          .note tbody tr {
            border-bottom: 1px solid #888888;
            vertical-align: baseline;
          }

          // If first element of the note is a definition list, pull it up
          // closer to the title. It is either my custom metadata list (tags,
          // source, etc.) or an auto-generated from bibtex file (authors, year,
          // etc.)
          .note > div:first-child > dl:first-child {
            margin-top: -8px;
            margin-bottom: 24px;
          }
        `}</style>
      </div>
      {!!backlinks.length && (
        <section style={{ marginTop: 24 }}>
          <h2>{'Backlinks'}</h2>
          <ul className="wide">
            {backlinks.map((b) => (
              <li key={b.slug}>
                <Backlink {...b} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
};

export default Note;
