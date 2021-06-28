import * as path from 'path';
import moment from 'moment';

import { getAllPaths, getPostBySlug } from '@/lib/api';
import Note, { NoteProps } from '@/components/Note';
import pageSymbol from '@/lib/pageSymbol';

interface PostProps extends NoteProps {}

const Post = ({ ...props }: PostProps) => {
  return <Note {...props} />;
};
export default Post;

export const getStaticPaths = async () => {
  const paths = await getAllPaths();

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
  const slug = params.slug ? '/' + path.join(...params.slug) + '/' : '/';
  const post = (await getPostBySlug(slug))!;
  const data = post.data;
  const backlinks = await Promise.all([...data.backlinks].map(getPostBySlug));
  // console.log(post.result);
  return {
    props: {
      slug: post.path,
      icon: data.icon ?? pageSymbol(data.pageType),
      title: data.title,
      isodate: data.date ? moment(data.date).format('YYYY-MM-DD') : null,
      date: data.date ? moment(data.date).format('MMMM D, YYYY') : null,
      lastModifiedIso: data.last_modified
        ? moment(data.last_modified).format('YYYY-MM-DD')
        : null,
      lastModified: data.last_modified
        ? moment(data.last_modified).format('MMMM D, YYYY')
        : null,
      images: data.images,
      hast: post.result,
      backlinks: backlinks.map((b) => ({
        slug: b!.path,
        title: b!.data.title,
        // html: b!.data.excerpt,
      })),
      description: data.description || null,
    },
  };
};
