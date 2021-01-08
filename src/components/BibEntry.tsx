import React from 'react';

import Link from '@/components/Link';

interface BibEntryProps {
  bibkey: string;
  type: string;
  TITLE: string;
  AUTHOR: string;
  YEAR: number;
  PUBLISHER?: string;
  ADDRESS?: string;
  URL?: string;
  URLDATE?: string;
}

const BibEntry = ({ type, ...props }: BibEntryProps) => {
  const title = props.URL ? (
    <Link href={props.URL} className="external">
      <a>
        <em>{props.TITLE}</em>
      </a>
    </Link>
  ) : (
    <em>{props.TITLE} </em>
  );
  return (
    <span>
      {props.AUTHOR ? (
        <>
          {props.AUTHOR}
          {props.YEAR && ` ${props.YEAR}`}
          {', '}
          {title}
        </>
      ) : (
        <>
          {title}
          {props.YEAR && ` ${props.YEAR}`}
        </>
      )}
      {' ('}
      <Link href={`/biblio/${props.bibkey}`}>
        <a>{'notes'}</a>
      </Link>
      {')'}
    </span>
  );
};

export default BibEntry;
