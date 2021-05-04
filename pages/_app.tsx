import React from 'react';
import { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import * as Fathom from 'fathom-client';
import { DefaultSeo } from 'next-seo';

import '../styles/globals.css';
import '@/code-highlight.css';
import 'katex/dist/katex.min.css';

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();
  React.useEffect(() => {
    Fathom.load('NQQXBCQR', {
      includedDomains: ['braindump.rasen.dev'],
      url: 'https://tahr.rasen.dev/script.js',
    });
    router.events.on('routeChangeComplete', Fathom.trackPageview);
    return () => {
      router.events.off('routeChangeComplete', Fathom.trackPageview);
    };
  }, []);

  return (
    <div className="root">
      <DefaultSeo
        openGraph={{
          type: 'website',
          locale: 'en_US',
          url: 'https://braindump.rasen.dev',
          site_name: "Alexey Shmalko's notes",
        }}
      />
      <Component {...pageProps} />

      <style jsx>{`
        .root {
          position: relative;
          font-size: 16px;
          line-height: 1.5;
          margin-top: 24px;

          max-width: 600px;
          margin: 0 auto;
          margin: 24px auto 40px;
          padding: 0 16px;

          // Allow breaking words if text overflows (very long words
          // or links)
          word-wrap: break-word;
          overflow-wrap: break-word;
        }
      `}</style>
      <style jsx global>{`
        h1 {
          font-size: 20px;
          font-weight: 700;
          margin-top: 8px;
          margin-bottom: 16px;
        }
        h2 {
          font-size: 16px;
          font-weight: 700;
          margin-top: 24px;
          margin-bottom: 8px;
        }
        h3 {
          font-size: 14px;
          font-weight: 700;
          margin-top: 16px;
          margin-bottom: 8px;
        }
        p,
        ul,
        ol,
        dl,
        table,
        blockquote,
        pre.verse,
        .math-display {
          margin: 0 0 16px 0;
        }
        table {
          margin-bottom: 24px;
        }
        dt {
          float: left;
          display: list-item;
          list-style-type: disc;
          margin-left: 24px;
          font-weight: 700;
        }
        dt::after {
          content: ':';
          margin-right: 4px;
        }
        dd {
          margin-left: 24px;
        }
        dd > p:first-child::before {
          // Add zero-width space to dd, so that dd always occupies
          // some vertical space. Otherwise, the next dt will collapse
          // into the previous one if dd has no text.
          content: '${'\u200b'}';
        }
        // For dd, use larger padding if first child is not the only
        // child. So that next element is properly wrapped to the next
        // line and is not affected by dt's float:left. (Happens when
        // tag contains a list.)
        dd > p:only-child,
        dd > p:not(:first-child),
        dd > ul,
        dd > ol,
        dd > dl,
        dd > table,
        dd > blockquote,
        dd > pre,
        li > p,
        li > ul,
        li > ol,
        li > dl,
        li > table,
        li > blockquote,
        li > pre {
          margin-bottom: 4px;
        }
        p + ul,
        p + ol,
        p + dl {
          margin-top: -12px;
        }
        li > p + ul,
        li > p + ol,
        li > p + dl {
          margin-top: 0px;
        }
        .wide li {
          margin-top: 8px;
        }
      `}</style>
    </div>
  );
}

export default MyApp;
