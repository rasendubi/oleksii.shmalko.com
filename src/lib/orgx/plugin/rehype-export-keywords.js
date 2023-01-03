import { parse } from 'acorn';

export const rehypeExportKeywords = () => {
  return (tree, file) => {
    const keywords = file.data?.keywords;
    const code = `export const keywords = ${JSON.stringify(
      keywords
    )};\nexport const frontmatter = keywords;`;

    tree.children.push(jsToTreeNode(code));
  };
};

function jsToTreeNode(
  jsString,
  acornOpts = {
    ecmaVersion: 'latest',
    sourceType: 'module',
  }
) {
  return {
    type: 'mdxjsEsm',
    value: '',
    data: {
      estree: {
        body: [],
        ...parse(jsString, acornOpts),
        type: 'Program',
        sourceType: 'module',
      },
    },
  };
}
