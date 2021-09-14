import React from 'react';

import Link from '@/components/Link';

import LatteList from './lattelist.svg';

export interface LatteListBannerProps {}

const LatteListBanner = ({}: LatteListBannerProps) => {
  return (
    <aside className="root">
      <img src={LatteList} />
      <div>
        I’ve recently launched{' '}
        <Link className="external" href="https://lattelist.app/">
          Latte List
        </Link>
        —a reading list that helps you read what you save. I would love if you
        could give it a try.
      </div>
      <style jsx>{`
        .root {
          display: flex;
          align-items: center;
          gap: 12px;

          background-color: #f1eddf;
          color: #3a3335;

          margin: 0 -16px 16px;
          padding: 8px 16px 8px 8px;
          border-radius: 4px;
        }
        @media (min-width: 900px) {
          .root {
            margin-left: calc(-16px - 32px);
            margin-right: calc(-16px - 86px - 8px);
          }
        }
        img {
          height: 3em;
          width: 3em;
        }
      `}</style>
    </aside>
  );
};

export default LatteListBanner;
