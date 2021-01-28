import React from 'react';
import clsx from 'clsx';
import { useDebounced } from '@/useDebounced';

import unified from 'unified';
import uniorgParse from 'uniorg-parse';
import { parse } from 'uniorg-parse/lib/parser';
import uniorg2rehype from 'uniorg-rehype';
import raw from 'rehype-raw';
import format from 'rehype-format';
import html from 'rehype-stringify';
import Header from '@/components/Header';

const processor = unified()
  .use(uniorgParse)
  .use(uniorg2rehype)
  .use(raw)
  .use(format)
  .use(html);

interface UniorgProps {}

const Uniorg = ({}: UniorgProps) => {
  const [input, setInput] = React.useState(`* Example
some text
- item1
- item2`);
  const handleChange = React.useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setInput(e.target.value);
    },
    []
  );

  const source = useDebounced(input, 100);
  const uniorg = React.useMemo(() => parse(source), [source]);
  const html = React.useMemo(
    () => processor.processSync(source).contents as string,
    [source]
  );

  const [mode, setMode] = React.useState('html');

  return (
    <div className="root">
      <Header slug="/uniorg" title="uniorg test" />
      <textarea value={input} onChange={handleChange} />
      <div className={clsx('result', mode !== 'rendered' && 'pre')}>
        {mode === 'uniorg' && JSON.stringify(uniorg, null, 2)}
        {mode === 'html' && html}
        {mode === 'rendered' && (
          <div dangerouslySetInnerHTML={{ __html: html }} />
        )}
      </div>
      <div className="buttons">
        <button onClick={() => setMode('uniorg')}>{'uniorg'}</button>
        <button onClick={() => setMode('html')}>{'HTML'}</button>
        <button onClick={() => setMode('rendered')}>{'rendered'}</button>
      </div>

      <style jsx>{`
        textarea {
          width: 100%;
          display: block;
          background: #fff;
          border: thin solid #888888;
          border-radius: 2px;
          font-family: 'Source Code Pro', monospace;
          white-space: pre;
          overflow: auto;
          min-height: 30vh;
        }
        .result {
          padding: 4px;
          background: #fff;
          border: thin solid #888888;
          border-radius: 2px;
          overflow: auto;
          height: 45vh;
        }
        .result.pre {
          font-family: 'Source Code Pro', monospace;
          white-space: pre;
        }
        .buttons {
          display: flex;
          width: 100%;
          justify-content: stretch;
        }
        button {
          flex-grow: 1;
        }
      `}</style>
    </div>
  );
};

export default Uniorg;
