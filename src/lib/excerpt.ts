import { VFile } from 'vfile';
import unified from 'unified';
import truncate from 'rehype-truncate';
import toHtml from 'rehype-stringify';

const processor = unified().use(truncate, { maxChars: 128 }).use(toHtml);

function excerpt() {
  return transformer;

  async function transformer(node: any, file: VFile) {
    // truncate plugin modifies input node. Deep-copy node so that
    // original post in not modified.
    const nodeCopy = JSON.parse(JSON.stringify(node));
    const excerpt = await processor.run(nodeCopy);
    const html = processor.stringify(excerpt);
    (file.data as any).excerpt = html;
  }
}

export default excerpt;
