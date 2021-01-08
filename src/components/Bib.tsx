import React from 'react';
import BibEntry from './BibEntry';

export interface BibProps {
  title: string;
  entries: any[];
}

const Bib = ({ title, entries }: BibProps) => {
  return (
    <>
      <h1>{title}</h1>
      <ul>
        {entries.map((e) => (
          <li key={e.key}>
            <BibEntry bibkey={e.key} {...e} />
          </li>
        ))}

        <style jsx>{`
          li {
            margin-bottom: 8px;
          }
        `}</style>
      </ul>
    </>
  );
};

export default Bib;
