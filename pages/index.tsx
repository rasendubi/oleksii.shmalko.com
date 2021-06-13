import React from 'react';

import Header from '@/components/Header';
import Link from '@/components/Link';

const Index = () => {
  return (
    <div className="root">
      <Header
        slug="/"
        title="Welcome!"
        pageType={'hello'}
        description="My name is Alexey Shmalko. I love exploring life, humans, and myself. I create software products for a living."
      />
      <div>
        <p>
          {'My name is '}
          <b>{'Alexey Shmalko.'}</b>
          {
            ' I love exploring life, humans, and myself. I create software products for a living.'
          }
        </p>
        <p>
          {
            'Here you can explore what’s on my mind or what I want to say. Many pages are just notes for myself—they are labelled with'
          }
          &nbsp;{'📝. Finished posts are marked with'}
          &nbsp;{'🖋, and 📖'}&nbsp;{'are reading notes.'}
        </p>
      </div>
      <div className="categories">
        <section>
          <h2>{'Latest'}</h2>
          <ul>
            <li>
              {'🖋 '}
              <Link href="/how-i-note/">{'How I note'}</Link>
            </li>
            <li>
              {'🖋 '}
              <Link href="/two-roads-to-success/">
                {'Two roads to success'}
              </Link>
            </li>
            <li>
              {'🖋 '}
              <Link href="/merging-my-websites/">
                {'I’m merging my websites'}
              </Link>
            </li>
            <li>
              {'🖋 '}
              <Link href="/2020/meta-1/">{'Meta: Status Report #1'}</Link>
            </li>
            <li>
              {'🖋 '}
              <Link href="/2020/literate-config/">
                {'4 Years with Literate Config'}
              </Link>
            </li>
          </ul>
        </section>
        <section>
          <h2>{'Popular'}</h2>
          <ul>
            <li>
              {'🖋 '}
              <Link href="/learn-it-yourself/">{'Learn it Yourself'}</Link>
            </li>
            <li>
              {'🖋 '}
              <Link href="/design-patterns-pitfalls/">
                {'Design Patterns Pitfalls'}
              </Link>
            </li>
            <li>
              {'🖋 '}
              <Link href="/2014/using-vim-as-c-cpp-ide/">
                {'Using Vim as C/C++ IDE'}
              </Link>
            </li>
            <li>
              {'🖋 '}
              <Link href="/2014/youcompleteme-ultimate-autocomplete-plugin-for-vim/">
                {'YouCompleteMe Plugin for Vim'}
              </Link>
            </li>
          </ul>
        </section>
        <section>
          <h2>{'Software Development'}</h2>
          <ul>
            <li>
              {'📝 '}
              <Link href="/20200216233843/">{'§ Software Development'}</Link>
            </li>
            <li>
              {'📝 '}
              <Link href="/20200322195425/">{'§ Software Architecture'}</Link>
            </li>
            <li>
              {'🖋 '}
              <Link href="/code-review-essentials/">
                {'Code Review Essentials'}
              </Link>
            </li>
            <li>
              {'🖋 '}
              <Link href="/learn-it-yourself/">{'Learn it Yourself'}</Link>
            </li>
            <li>
              {'🖋 '}
              <Link href="/design-patterns-pitfalls/">
                {'Design Patterns Pitfalls'}
              </Link>
            </li>
            <li>
              {'🖋 '}
              <Link href="/text-editing-fundamentals/">
                {'Text Editing Fundamentals'}
              </Link>
            </li>
            <li>
              {'🖋 '}
              <Link href="/choose-specialization/">
                {'How to Choose Specialization'}
              </Link>
            </li>
          </ul>
        </section>
        <section>
          <h2>{'Zettelkasten'}</h2>
          <ul>
            <li>
              {'📝 '}
              <Link href="/20200427070145/">{'§ Zettelkasten'}</Link>
            </li>
            <li>
              {'📝 '}
              <Link href="/20210108122243/">{'§ My Notes Index'}</Link>
            </li>
            <li>
              {'📖 '}
              <Link href="/biblio/">{'§ Reading Notes'}</Link>
            </li>
          </ul>
        </section>
        <section>
          <h2>{'Contacts'}</h2>
          <ul>
            <li>
              {'Email: '}
              <Link className="external" href="mailto:rasen.dubi@gmail.com">
                {'rasen.dubi@gmail.com'}
              </Link>
            </li>
            <li>
              {'GitHub: '}
              <Link className="external" href="https://github.com/rasendubi">
                {'rasendubi'}
              </Link>
            </li>
            <li>
              {'Telegram: '}
              <Link className="external" href="https://t.me/rasendubi">
                {'@rasendubi'}
              </Link>
            </li>
          </ul>
        </section>
      </div>

      <p>
        <small>
          {'This website is mostly built from my '}
          <Link className="external" href="https://orgmode.org">
            {'org-mode'}
          </Link>
          {' notes (managed by '}
          <Link
            className="external"
            href="https://github.com/org-roam/org-roam"
          >
            {'org-roam'}
          </Link>
          {'). The notes are parsed by '}
          <Link className="external" href="https://github.com/rasendubi/uniorg">
            {'uniorg'}
          </Link>
          {
            ' (of my own authoring) and are exposed as a Next.js website. You can use '
          }
          <Link
            className="external"
            href="https://github.com/rasendubi/uniorg/tree/master/examples/org-braindump"
          >
            {'org-braindump'}
          </Link>
          {' template to build a similar braindump.'}
        </small>
      </p>

      <style jsx>{`
        .root {
          display: flex;
          flex-direction: column;
        }
        .categories {
          display: flex;
          flex-wrap: wrap;
          margin-bottom: 32px;
        }
        section {
          margin-right: 48px;
        }
        li {
          margin-top: 4px;
        }
        @media (min-width: 900px) {
          .categories {
            width: calc(100vw - (100vw - 700px) / 2 - 32px);
            max-width: 960px;
            align-self: flex-start;
          }
        }
      `}</style>
    </div>
  );
};

export default Index;

export const config = {
  amp: 'hybrid',
};
