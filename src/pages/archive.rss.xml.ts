import rss from '@astrojs/rss';

import { allPages, pubDate } from '@/lib/posts';
import comparePages from '@/lib/comparePages';

export const GET = async () => {
  const posts = [...allPages].sort(comparePages({ preferLastmod: true }));
  const items = posts
    .filter((p) => p.frontmatter.pageType !== 'pulse')
    .map((p) => ({
      link: p.frontmatter.slug,
      title: p.frontmatter.icon + ' ' + p.frontmatter.title,
      pubDate: pubDate(p) ?? new Date('1970-01-01T00:00:00Z'),
    }));
  return rss({
    title: 'Oleksii Shmalko',
    description: '',
    site: import.meta.env.SITE,
    items,
  });
};
