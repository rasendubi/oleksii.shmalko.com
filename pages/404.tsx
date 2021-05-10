import Link from '@/components/Link';

export default function Page404() {
  return (
    <div className="root">
      <h1>{'404'}</h1>
      <p>{'This page is private or does not exist.'}</p>
      <p>
        {'Go to:'}
        <ul>
          <li>
            <Link href="/">{'Home page'}</Link>
          </li>
          <li>
            <Link href="/archive">{'Search'}</Link>
          </li>
        </ul>
      </p>

      <style jsx>{`
        .root {
          flex-grow: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }
        h1 {
          margin-bottom: 4px;
        }
        p {
          text-align: center;
        }
        ul {
          padding: 0;
        }
      `}</style>
    </div>
  );
}
