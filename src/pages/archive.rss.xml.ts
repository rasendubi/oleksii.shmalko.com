import rss from '@astrojs/rss';

import { getAllPosts } from '@/lib/api';
import comparePages from '@/lib/comparePages';
import pageSymbol from '@/lib/pageSymbol';

export const get = async () => {
  const posts = Object.values(await getAllPosts()).sort(
    comparePages({ preferLastmod: true })
  );
  return rss({
    title: 'Alexey Shmalko',
    site: import.meta.env.SITE,
    items: posts.map((p) => ({
      link: p.path,
      title: (p.data.icon ?? pageSymbol(p.data.pageType)) + ' ' + p.data.title,
      pubDate: p.data.date,
    })),
  });
};
