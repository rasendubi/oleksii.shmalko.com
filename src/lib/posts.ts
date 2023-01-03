export const allPages = Promise.all(
  Object.values(
    import.meta.glob([
      '../../posts/*.org',
      '../../posts/posts/**/*.org',
      '../../posts/posts/**/*.md',
      '../../posts/biblio/**/*.org',
    ])
  ).map((p: any) => p())
);

const idLinks = allPages.then((posts) => {
  const ids = new Map();
  posts.forEach((p) => {
    const localIds = p.keywords?.ids;
    if (localIds) {
      Object.entries(localIds).forEach(([id, anchor]) => {
        ids.set(id, { slug: p.frontmatter.slug, anchor, post: p });
      });
    }
  });
  // console.log('ids', ids);
  return ids;
});

export const resolveId = async (id: string) => {
  const ids = await idLinks;
  const saved = ids.get(id);
  if (!saved) {
    console.warn('Unable to resolve', `id:${id}`);
    return `id:${id}`;
  }

  const { slug, anchor } = ids.get(id);
  console.log('x', './' + slug + '/' + anchor);
  const result = new URL('./' + slug + '/' + anchor, 'file:///').pathname;
  console.log('resolving', id, '->', result);
  return result;
};
