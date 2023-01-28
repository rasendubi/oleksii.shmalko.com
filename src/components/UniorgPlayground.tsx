import React from 'react';
import clsx from 'clsx';
import { useDebounced } from '@/useDebounced';

import { unified } from 'unified';
import uniorgParse from 'uniorg-parse';
import { parse } from 'uniorg-parse/lib/parser';
import uniorg2rehype from 'uniorg-rehype';
import raw from 'rehype-raw';
import format from 'rehype-format';
import html from 'rehype-stringify';
import katex from 'rehype-katex';
import 'katex/contrib/mhchem';

import './UniorgPlayground.css';

const processor = unified()
  .use(uniorgParse)
  .use(uniorg2rehype)
  .use(raw)
  .use(katex)
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

  const [source] = useDebounced(input, 100);
  const uniorg = React.useMemo(() => parse(source), [source]);
  const html = React.useMemo(
    () => String(processor.processSync(source).value),
    [source]
  );

  const [mode, setMode] = React.useState('rendered');

  return (
    <div>
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
    </div>
  );
};

export default Uniorg;
