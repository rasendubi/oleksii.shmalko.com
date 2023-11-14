import rss from '@astrojs/rss';

import { allPages, pubDate } from '@/lib/posts';
import comparePages from '@/lib/comparePages';

export const GET = async () => {
  const posts = allPages
    .filter((p) => p.frontmatter.pageType === 'post')
    .sort(comparePages({ preferLastmod: false }));
  return rss({
    title: 'Oleksii Shmalko Posts',
    description: '',
    site: import.meta.env.SITE,
    items: posts.map((p) => ({
      link: p.frontmatter.slug,
      title: p.frontmatter.icon + ' ' + p.frontmatter.title,
      pubDate: pubDate(p) ?? new Date('1970-01-01T00:00:00Z'),
      description: p.frontmatter.description,
    })),
  });
};
