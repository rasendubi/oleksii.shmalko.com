import '../styles/globals.css';
import '@/code-highlight.css';
import { AppProps } from 'next/app';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <div className="root">
      <Component {...pageProps} />

      <style jsx>{`
        .root {
          font-size: 16px;
          line-height: 1.5;
          margin-top: 24px;

          max-width: 600px;
          margin: 0 auto;
          margin: 24px auto 40px;
          padding: 0 16px;
        }
      `}</style>
      <style jsx global>{`
        h1 {
          font-size: 20px;
          font-weight: 700;
          margin-top: 24px;
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
        table {
          margin-bottom: 16px;
        }
        dt {
          float: left;
          display: list-item;
          list-style-type: disc;
          margin-left: 24px;
          font-weight: 700;
        }
        dt::after {
          content: '::';
          margin: 0 4px;
        }
        dd {
          margin-left: 24px;
        }
        li > p,
        li > ul,
        li > ol,
        li > table {
          margin-bottom: 4px;

          // & + ul, & + ol {
          //     margin-top: 0px;
          // }
        }
        p + ul,
        p + ol {
          margin-top: -12px;
        }
        li > p + ul,
        li > p + ol {
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
