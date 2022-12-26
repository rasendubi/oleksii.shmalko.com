import moment from 'moment';
import { Page } from '../lib/api';

export type Options = {
  preferLastmod?: boolean;
};

export default ({ preferLastmod = true }: Options = {}) =>
  (a: Page, b: Page) => {
    // new notes on top, but bibliography on bottom (notes with
    // non-numeric path)

    const isodate = (p: Page) => {
      const format = (s: string) => moment(s).format('YYYYMMDD');

      if (preferLastmod && p.data.last_modified) {
        return format(p.data.last_modified);
      }

      if (p.data.date) {
        return format(p.data.date);
      }
      if (p.data.last_modified) {
        return format(p.data.last_modified);
      }
      return null;
    };

    const aIsodate = isodate(a);
    const bIsodate = isodate(b);

    const aNumeric = !!a.path.match(/^\/\d/) || !!aIsodate;
    const bNumeric = !!b.path.match(/^\/\d/) || !!bIsodate;
    if (aNumeric != bNumeric) {
      return aNumeric < bNumeric ? 1 : -1;
    }

    if (!aNumeric) {
      return a.path < b.path ? -1 : 1;
    }

    return (aIsodate || a.path.slice(1)) < (bIsodate || b.path.slice(1))
      ? 1
      : -1;
  };
