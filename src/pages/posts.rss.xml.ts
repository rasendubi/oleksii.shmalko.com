import rss from '@astrojs/rss';

import { allPages } from '@/lib/posts';
import comparePages from '@/lib/comparePages';

export const get = async () => {
  const posts = allPages
    .filter((p) => p.frontmatter.pageType === 'post')
    .sort(comparePages({ preferLastmod: false }));
  return rss({
    title: 'Alexey Shmalko Posts',
    site: import.meta.env.SITE,
    items: posts.map((p) => ({
      link: p.frontmatter.slug,
      title: p.frontmatter.icon + ' ' + p.frontmatter.title,
      pubDate: p.frontmatter.date,
      description: p.frontmatter.description,
    })),
  });
};
