import * as path from 'path';

import Head from 'next/head';

import { getAllPaths, getPostBySlug } from '@/lib/api';
import Note, { NoteProps } from '@/components/Note';

interface PostProps extends NoteProps {
  type: 'org' | 'bib';
}

const Post = ({ type, ...props }: PostProps) => {
  return (
    <>
      <Head>
        <title>{props.title}</title>
      </Head>
      <Note {...props} />
    </>
  );
};
export default Post;

export const getStaticPaths = async () => {
  const paths = await getAllPaths();
  paths.push('/');

  return {
    paths,
    fallback: false,
  };
};

interface PageParams {
  params: {
    slug?: string[];
  };
}

export const getStaticProps = async ({ params }: PageParams) => {
  const slug = params.slug || ['index'];
  const post = (await getPostBySlug('/' + path.join(...slug)))!;
  const data = post.data;
  const backlinks = await Promise.all(data.backlinks.map(getPostBySlug));
  return {
    props: {
      type: data.type,
      slug: post.path,
      title: data.title as string,
      html: post.contents,
      backlinks: backlinks.map((b) => ({
        slug: b!.path,
        title: b!.data.title,
        // html: b!.data.excerpt,
      })),
    },
  };
};
