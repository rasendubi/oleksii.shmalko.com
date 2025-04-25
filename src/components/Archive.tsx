import React from 'react';
import { useDebounced } from '../useDebounced';
import clsx from 'clsx';
import Link from './Link';

export type ArchiveProps = {
  posts: ArchivePost[];
};

type ArchivePost = {
  title: string;
  path: string;
  icon: string;
};

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

  const [query] = useDebounced(input, 200);
  const searchResult = React.useMemo(() => {
    const stems = query.toLowerCase().split(/\s+/);
    return posts.filter((post) => {
      const title = post.title.toLowerCase();
      return stems.every((stem) => title.includes(stem));
    });
  }, [posts, query]);

  return (
    <>
      <div className="input-wrapper">
        <input
          aria-label="Search"
          value={input}
          placeholder="Search…"
          onChange={handleChange}
          autoFocus
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
      <section>
        <PostList posts={searchResult} />
      </section>
      {/* always show scroll on this page, so the layout is stable
          when pages list gets too short */}
      <style>{`
        body {
          overflow-y: scroll;
        }
      `}</style>
      <style>{`
        .input-wrapper {
          display: flex;
          align-items: center;
          border: thin solid #888;
          border-radius: 4px;
          overflow: hidden;
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
          color: var(--fg-dim);
          text-align: right;
          margin-bottom: 4px;
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
    <ul>
      {posts.map((p) => (
        <li key={p.path}>
          {p.icon} <Link href={p.path}>{p.title}</Link>
        </li>
      ))}
    </ul>
  );
});
