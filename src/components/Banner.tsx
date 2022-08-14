import React from 'react';

import Link from '@/components/Link';

export interface BannerProps {}

const Banner = ({}: BannerProps) => {
  return (
    <aside className="root">
      <div className="content">
        {
          '🇺🇦 If you like my work and want to thank me, please support my country in a war against russia—'
        }
        <Link className="external" href="https://u24.gov.ua/">
          {'donate'}
        </Link>
        {' or '}
        <Link className="external" href="https://supportukrainenow.org/">
          {'help in other ways.'}
        </Link>
        {' Thank you 💙💛'}
      </div>
      <style jsx>{`
        .root {
          display: flex;
          justify-content: center;

          background-color: #f0f0f0;
          margin: 0;
          padding: 0;
        }
        .content {
          padding: 8px 16px;
          line-height: 1.6;
        }
        @media (min-width: 900px) {
        }
      `}</style>
    </aside>
  );
};

export default Banner;
