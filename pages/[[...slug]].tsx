import Bib, { BibProps } from '@/components/Bib';
import Note, { NoteProps } from '@/components/Note';
import { getAllPosts, getPostBySlug } from '@/lib/api';
import { bibEntries } from '@/lib/bib';
import orgToHtml from '@/lib/orgToHtml';
import Head from 'next/head';

type PageProps = ({ type: 'org' } & NoteProps) | ({ type: 'bib' } & BibProps);

const Page = ({ type, ...props }: PageProps) => {
  const Component: any = type === 'org' ? Note : Bib;

  return (
    <>
      <Head>
        <title>{props.title}</title>
      </Head>
      <Component {...props} />
    </>
  );
};
export default Page;

export const getStaticPaths = async () => {
  const res = getAllPosts().map((post) => `/${post.slug}`);
  res.push('/');

  return {
    paths: res,
    fallback: false,
  };
};

interface Params {
  params: {
    slug?: string[];
  };
}

export const getStaticProps = async ({ params }: Params) => {
  const slug = params.slug || ['20210108102745'];
  const post = getPostBySlug(slug);
  if (post.type === 'org') {
    const { title, html } = await orgToHtml(post.file);
    return {
      props: {
        type: 'org',
        title,
        html,
      },
    };
  } else if (post.type === 'bib') {
    const entries = bibEntries(post.file);
    const title = slug[slug.length - 1];
    return {
      props: {
        type: 'bib',
        title,
        entries,
      },
    };
  }
};
