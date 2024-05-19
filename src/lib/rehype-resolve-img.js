import { visit } from 'unist-util-visit';
import path from 'path';

export const rehypeResolveImg = () => {
  return (tree, file) => {
    const imported = new Map();
    const imports = [];

    visit(
      tree,
      [{ tagName: 'a' }, { tagName: 'link' }, { tagName: 'img' }],
      (node, index, parent) => {
        let propertyName = 'href';
        switch (node.tagName) {
          case 'link':
          case 'a':
            propertyName = 'href';
            break;
          case 'img':
            propertyName = 'src';
            break;
        }

        let url = node.properties[propertyName];
        let u;
        try {
          u = new URL(url, 'file://' + file.path);
        } catch {
          return;
        }
        if (u.protocol !== 'file:') {
          return;
        }

        const ext = path.extname(u.pathname);
        const resourceExts = ['.txt', '.sh', '.pdf', '.gif', '.asc'];
        const isResource = resourceExts.includes(ext);

        const isImg = node.tagName === 'img';
        const importUrl = u.pathname + (isResource ? '?url' : '');

        // if (/^https?:/.test(url)) {
        //   return;
        // }
        if (!/^\.\.?\//.test(url) && !/^file:/.test(url)) {
          // not relative import
          return;
          // url = `./${url}`;
        }

        let name = imported.get(url);
        if (!name) {
          name = `__${imported.size}_${url.replace(/\W/g, '_')}__`;

          imports.push({
            type: 'mdxjsEsm',
            value: '',
            data: {
              estree: {
                type: 'Program',
                sourceType: 'module',
                body: [
                  {
                    type: 'ImportDeclaration',
                    source: {
                      type: 'Literal',
                      value: importUrl,
                      raw: JSON.stringify(importUrl),
                    },
                    specifiers: [
                      isImg || isResource
                        ? {
                            type: 'ImportDefaultSpecifier',
                            local: { type: 'Identifier', name },
                          }
                        : {
                            type: 'ImportSpecifier',
                            imported: {
                              type: 'Identifier',
                              name: 'frontmatter',
                            },
                            local: { type: 'Identifier', name },
                          },
                    ],
                  },
                ],
              },
            },
          });

          imported.set(url, name);
        }

        parent.children[index] = {
          type: 'mdxJsxTextElement',
          name: node.tagName,
          children: node.children,
          attributes: [
            ...Object.entries(node.properties).flatMap(([property, value]) =>
              property === propertyName
                ? []
                : [
                    {
                      type: 'mdxJsxAttribute',
                      name: property,
                      value: Array.isArray(value) ? value.join(' ') : value,
                    },
                  ]
            ),
            {
              type: 'mdxJsxAttribute',
              name: propertyName,
              value: {
                type: 'mdxJsxAttributeValueExpression',
                value: name,
                data: {
                  estree: {
                    type: 'Program',
                    sourceType: 'module',
                    comments: [],
                    body: [
                      {
                        type: 'ExpressionStatement',
                        expression:
                          isImg || isResource
                            ? { type: 'Identifier', name }
                            : {
                                type: 'MemberExpression',
                                object: { type: 'Identifier', name },
                                property: { type: 'Identifier', name: 'slug' },
                                computed: false,
                              },
                      },
                    ],
                  },
                },
              },
            },
          ],
        };
      }
    );

    tree.children.unshift(...imports);
  };
};
