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
  description: string | null;
  icon: string;
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
          .note > p > img:only-child {
            margin-left: -16px;
            margin-right: -16px;
            max-width: calc(100% + 32px);
          }

          // allow top-level quotes to be slightly wider
          .note > blockquote,
          .note > pre.verse,
          .note > .block,
          .note > .block-clearfix > blockquote,
          .note > .block-clearfix > pre.verse,
          .note > .block-clearfix > .block {
            margin-left: -16px;
            margin-right: -16px;
            padding-left: 16px;
            padding-right: 16px;
          }

          .note {
            display: flex;
            flex-direction: column;
            position: relative;
          }

          .note table {
            display: block;
            border-collapse: collapse;
            font-size: 0.9em;
            overflow-x: auto;
          }
          .note > table {
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
          .note > dl:first-child {
            margin-top: -8px;
            margin-bottom: 24px;
          }

          // asides
          .block-clearfix {
            position: relative;
          }
          aside {
            background-color: #f2eff3;
            border-radius: 2px;
            padding: 8px 16px;
            margin-bottom: 25.6px;
          }
          aside > *:last-child {
            margin-bottom: 0px;
          }
          // more space for top-level asides
          .note > aside,
          .note > .block-clearfix > aside {
            margin-left: -16px;
            margin-right: -16px;
          }
          // asides are moving to the right
          @media (min-width: 1280px) {
            aside {
              position: absolute;
              // .note and .block-clearfix are narrower than
              // main. Compensate for main's padding.
              left: calc(100% + 16px);
              width: calc((100vw - 700px) / 2 - 32px);
              max-width: 300px;
              margin-top: -8px;
            }
            .block-clearfix aside {
              top: 0px;
            }
            .note aside,
            .note > aside,
            .note > .block-clearfix > aside {
              margin-left: 16px;
              margin-right: 16px;
            }
          }

          // front-page
          .block-categories {
            display: flex;
            flex-wrap: wrap;
            margin-bottom: 32px;
          }
          .block-categories > section {
            margin-right: 48px;
          }
          .block-categories li {
            margin-top: 4px;
          }
          @media (min-width: 900px) {
            .block-categories {
              width: calc(100vw - (100vw - 700px) / 2 - 32px);
              max-width: 960px;
              align-self: flex-start;
            }
          }
          .block-small {
            font-size: 14px;
          }
        `}</style>
      </div>
      {!!backlinks.length && (
        <section>
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
