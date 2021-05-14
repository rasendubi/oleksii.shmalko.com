import React from 'react';

import Head from 'next/head';
import Link from 'next/link';
import { NextSeo } from 'next-seo';
import pageSymbol from '@/lib/pageSymbol';
import { websiteUrl } from '@/config';

export interface HeaderProps {
  slug: string;
  pageType?: string;
  title: string;
  isodate?: string;
  date?: string;
  images?: Array<{ src: string; alt?: string }>;
}

const Header = ({
  slug,
  title,
  pageType,
  isodate,
  date,
  images,
}: HeaderProps) => {
  const url = websiteUrl + slug;
  const image = images?.[0] ?? { src: '/gravatar.png' };
  return (
    <div className="root">
      <NextSeo
        title={title}
        canonical={url}
        openGraph={{
          type: 'website',
          locale: 'en_US',
          title,
          url,
          site_name: 'Alexey Shmalko',
          images: [{ url: websiteUrl + image.src }],
        }}
      />
      <Head>
        <title>{title}</title>
      </Head>
      <div className="homerow">
        <div className="quicklinks">
          <Link href="/">
            <a className="icon-link" aria-label="Home">
              <HomeIcon />
            </a>
          </Link>
          <Link href="/archive">
            <a className="icon-link" aria-label="Search">
              <SearchIcon width={24} height={24} />
            </a>
          </Link>
        </div>
        <h1>
          <span className="page-symbol">{pageSymbol(pageType)}</span>
          {title}
        </h1>
      </div>
      {isodate && date && <time dateTime={isodate}>{date}</time>}

      <style jsx>{`
        .root {
          margin-top: 8px;
          margin-bottom: 16px;
        }
        .homerow {
          display: flex;
          flex-wrap: wrap;
          flex-direction: row-reverse;
        }
        .page-symbol {
          margin-right: 8px;
        }
        h1 {
          flex-shrink: 0;
          flex-grow: 1;
          justify-self: stretch;
          max-width: 100%;
          margin-bottom: 0px;
        }
        time {
          display: inline-block;
          // margin-top: 4px;
          color: #444;
          font-style: italic;
          font-size: 13px;
        }
        .quicklinks {
          display: inline-flex;
          align-items: flex-start;
          margin-left: 12px;
        }
        .icon-link {
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 12px;
          padding-bottom: 0px;
        }
        @media (min-width: 900px) {
          .page-symbol {
            position: absolute;
            right: 100%;
            margin-right: 0;
          }
          .quicklinks {
            position: absolute;
            left: 100%;
            // position: fixed;
            // left: calc((100vw - 700px) / 2 + 700px);
            margin-left: 0;
          }
        }
      `}</style>
    </div>
  );
};

const HomeIcon = (props: React.SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      height="24"
      viewBox="0 0 24 24"
      width="24"
      {...props}
    >
      <path d="M0 0h24v24H0z" fill="none" />
      <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
    </svg>
  );
};

const SearchIcon = (props: React.SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="black"
      width="18px"
      height="18px"
      {...props}
    >
      <path d="M0 0h24v24H0z" fill="none" />
      <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
    </svg>
  );
};

export default Header;
