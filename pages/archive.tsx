import React from 'react';
import clsx from 'clsx';
import moment from 'moment';

import { getAllPosts, Page } from '@/lib/api';
import Link from '@/components/Link';
import Header from '@/components/Header';
import { useDebounced } from '@/useDebounced';
import pageSymbol from '@/lib/pageSymbol';

type PostInfo = {
  path: string;
  title: string;
  icon: string | null;
};

interface ArchiveProps {
  posts: PostInfo[];
}

const Archive = ({ posts }: ArchiveProps) => {
  const [input, setInput] = React.useState('');

  const handleChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setInput(event.target.value);
    },
    []
  );
  const handleClearClick = React.useCallback(() => {
    setInput('');
  }, []);

  const query = useDebounced(input, 200);
  const searchResult = React.useMemo(() => {
    const stems = query.toLowerCase().split(/\s+/);
    return posts.filter((post) => {
      const title = post.title.toLowerCase();
      return stems.every((stem) => title.includes(stem));
    });
  }, [posts, query]);

  return (
    <>
      <Header slug="/archive" title={'§ Archive'} />
      <div className="input-wrapper">
        <input
          aria-label="Search"
          value={input}
          placeholder="Search…"
          onChange={handleChange}
        />
        <div
          className={clsx('clear', input === '' && 'hidden')}
          onClick={handleClearClick}
        >
          <svg className="clear-svg" viewBox="0 0 357 357">
            <polygon
              points="357,35.7 321.3,0 178.5,142.8 35.7,0 0,35.7 142.8,178.5 0,321.3 35.7,357 178.5,214.2 321.3,357 357,321.3
 214.2,178.5"
            />
          </svg>
        </div>
      </div>
      <div className="pages-counter">{`${searchResult.length} pages`}</div>
      <PostList posts={searchResult} />
      {/* always show scroll on this page, so the layout is stable
          when pages list gets too short */}
      <style global jsx>{`
        body {
          overflow-y: scroll;
        }
      `}</style>
      <style jsx>{`
        .input-wrapper {
          display: flex;
          align-items: center;
          border: thin solid #888888;
          border-radius: 1px;
          margin-bottom: 5px;
        }
        input {
          flex-grow: 1;
          appearance: none;
          display: inline-block;
          min-height: 36px;
          padding: 8px 0 8px 12px;
          background: #fff;
          border: none;
          font-size: 15px;
          outline: none;
        }
        .clear {
          cursor: pointer;
          font-weight: bold;
          padding: 8px;
          min-height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: opacity 0.2s ease-in-out;
        }
        .clear.hidden {
          opacity: 0;
        }
        .clear-svg {
          height: 12px;
          fill: #888888;
        }
        .pages-counter {
          font-size: 0.8em;
          line-height: 1;
          color: #282828;
          text-align: right;
        }
      `}</style>
    </>
  );
};

export default Archive;

// Split list of posts into a separate component, so it does not
// hinder typing performance.
const PostList = React.memo(({ posts }: ArchiveProps) => {
  return (
    <ul className="wide">
      {posts.map((p) => (
        <li key={p.path}>
          {p.icon} <Link href={p.path}>{p.title}</Link>
        </li>
      ))}
    </ul>
  );
});

export const getStaticProps = async () => {
  const allPosts = await getAllPosts();
  const posts = Object.values(allPosts)
    .sort((a, b) => {
      // new notes on top, but bibliography on bottom (notes with
      // non-numeric path)

      const isodate = (p: Page) => {
        const format = (s: string) => moment(s).format('YYYYMMDD');

        if (p.data.last_modified) {
          return format(p.data.last_modified);
        }
        if (p.data.date) {
          return format(p.data.date);
        }
        return null;
      };

      const aIsodate = isodate(a);
      const bIsodate = isodate(b);

      const aNumeric = !!a.path.match(/^\/\d/) || !!aIsodate;
      const bNumeric = !!b.path.match(/^\/\d/) || !!bIsodate;
      if (aNumeric != bNumeric) {
        return aNumeric < bNumeric ? 1 : -1;
      }

      if (!aNumeric) {
        return a.path < b.path ? -1 : 1;
      }

      return (aIsodate || a.path.slice(1)) < (bIsodate || b.path.slice(1))
        ? 1
        : -1;
    })
    .map((p) => ({
      title: p.data.title,
      path: p.path,
      icon: p.data.icon ?? pageSymbol(p.data.pageType) ?? null,
    }));

  const props: ArchiveProps = {
    posts,
  };
  return { props };
};
