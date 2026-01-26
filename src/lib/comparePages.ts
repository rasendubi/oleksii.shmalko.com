import { format } from 'date-fns';
import type { Page } from './posts';

export type Options = {
  preferLastmod?: boolean;
};

export default ({ preferLastmod = true }: Options = {}) =>
  (a: Page, b: Page) => {
    // new notes on top, but bibliography on bottom (notes with
    // non-numeric path)
    // console.log('cmp', { a: a.frontmatter, b: b.frontmatter });

    const isodate = (p: Page) => {
      const formatDate = (s: string) => format(new Date(s), 'yyyyMMdd');

      if (preferLastmod && p.frontmatter.last_modified) {
        return formatDate(p.frontmatter.last_modified);
      }

      if (p.frontmatter.date) {
        return formatDate(p.frontmatter.date);
      }
      if (p.frontmatter.last_modified) {
        return formatDate(p.frontmatter.last_modified);
      }
      return null;
    };

    const aIsodate = isodate(a);
    const bIsodate = isodate(b);

    const aNumeric = !!a.frontmatter.slug.match(/^\/\d/) || !!aIsodate;
    const bNumeric = !!b.frontmatter.slug.match(/^\/\d/) || !!bIsodate;
    if (aNumeric !== bNumeric) {
      return aNumeric < bNumeric ? 1 : -1;
    }

    if (!aNumeric) {
      return a.frontmatter.slug < b.frontmatter.slug ? -1 : 1;
    }

    return (aIsodate || a.frontmatter.slug.slice(1)) <
      (bIsodate || b.frontmatter.slug.slice(1))
      ? 1
      : -1;
  };
