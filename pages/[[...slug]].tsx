import Note, { NoteProps } from '@/components/Note';
import { getAllPosts, getPostBySlug } from '@/lib/api';
import orgToHtml from '@/lib/orgToHtml';
import Head from 'next/head';

interface PageProps extends NoteProps {}

const Page = (props: PageProps) => {
  return (
    <>
      <Head>
        <title>{props.title}</title>
      </Head>
      <Note {...props} />
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
  const slug = params.slug || ['index'];
  const post = getPostBySlug(slug);
  const { title, html } = await orgToHtml(post.path, post.content || '');

  return {
    props: {
      title,
      html,
    },
  };
};
