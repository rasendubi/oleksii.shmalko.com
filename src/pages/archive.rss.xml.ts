import rss from '@astrojs/rss';

import { allPages } from '@/lib/posts';
import comparePages from '@/lib/comparePages';

export const get = async () => {
  const posts = (await allPages).sort(comparePages({ preferLastmod: true }));
  return rss({
    title: 'Alexey Shmalko',
    site: import.meta.env.SITE,
    items: posts.map((p) => ({
      link: p.frontmatter.slug,
      title: p.frontmatter.icon + ' ' + p.frontmatter.title,
      pubDate: p.frontmatter.date,
    })),
  });
};
