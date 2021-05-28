import { VFile } from 'vfile';
import h from 'hastscript';

import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remark2rehype from 'remark-rehype';
import remarkSmartypants from '@silvenon/remark-smartypants';
import remarkFrontmatter from 'remark-frontmatter';
import remarkExtractFrontmatter from 'remark-extract-frontmatter';
import { parse as yamlParse } from 'yaml';
import remarkFootnotes from 'remark-footnotes';
import { matches, select } from 'hast-util-select';

import json from '@/lib/unified-json';

const processor = json()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkFrontmatter)
  .use(remarkExtractFrontmatter, { yaml: yamlParse })
  .use(remarkFootnotes)
  .use(remarkSmartypants, { dashes: 'oldschool' })
  .use(remark2rehype, { allowDangerousHtml: true })
  .use(reformatFootnotesBlock);

export default async function mdToHtml(file: VFile): Promise<VFile> {
  return await processor.process(file);
}

function reformatFootnotesBlock() {
  return transformer;

  function transformer(hast: any) {
    const footnotes = select('div.footnotes', hast);
    if (footnotes) {
      // drop <hr />
      footnotes.children = footnotes.children.filter(
        (c: any) => !matches('hr', c)
      );

      footnotes.children.unshift(h('h1', 'Footnotes'));
    }
  }
}
