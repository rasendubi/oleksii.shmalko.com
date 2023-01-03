import { PluggableList, Processor, unified } from 'unified';
import uniorgParse from 'uniorg-parse';
import uniorgRehype from 'uniorg-rehype';
import { toEstree } from 'hast-util-to-estree';
import { toJs, jsx } from 'estree-util-to-js';

import { recmaDocument } from './plugin/recma-document';
import { recmaJsxBuild } from './plugin/recma-jsx-build';

type ProcessorOptions = {
  uniorgPlugins: PluggableList;
  rehypePlugins: PluggableList;
  recmaPlugins: PluggableList;
};

export function createProcessor(options: Partial<ProcessorOptions> = {}) {
  const { uniorgPlugins = [], rehypePlugins = [], recmaPlugins = [] } = options;

  const pipeline = unified()
    .use(uniorgParse)
    .use(uniorgPlugins)
    .use(uniorgRehype)
    .use(rehypePlugins)
    .use(rehypeRecma)
    .use(recmaDocument, options)
    .use(recmaJsxBuild)
    .use(recmaPlugins)
    .use([recmaStringify]);

  return pipeline;
}

function rehypeRecma() {
  return (tree) => toEstree(tree);
}

function recmaStringify(this: Processor, options = {}) {
  this.Compiler = compiler;

  function compiler(tree, file) {
    const result = toJs(tree, { handlers: jsx });
    file.map = result.map;
    console.log(
      'compiled to',
      JSON.stringify(tree, null, 2),
      'to',
      result.value
    );
    return result.value;
  }
}
