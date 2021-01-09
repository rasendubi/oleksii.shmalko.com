import React from 'react';

import Link from '@/components/Link';

export interface BacklinkProps {
  slug: string;
  title: string;
}

const Backlink = ({ slug, title }: BacklinkProps) => {
  return <Link href={slug}>{title}</Link>;
};

export default Backlink;
