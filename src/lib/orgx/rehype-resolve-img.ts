import { selectAll } from 'hast-util-select';
import { visit } from 'unist-util-visit';

export const rehypeResolveImg = () => {
  return (tree, file) => {
    const imported = new Map<string, string>();
    const imports: any[] = [];

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

        let url = node.properties[propertyName] as string;
        if (/^https?:/.test(url)) {
          return;
        }
        if (!/^\.\.?\//.test(url)) {
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
                      value: url + '?url',
                      raw: JSON.stringify(url + '?url'),
                    },
                    specifiers: [
                      {
                        type: 'ImportDefaultSpecifier',
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

        parent.children[index!] = {
          type: 'mdxJsxTextElement',
          name: node.tagName,
          children: node.children,
          attributes: [
            ...Object.entries(node.properties).flatMap(([property, value]) =>
              property === propertyName
                ? []
                : [{ type: 'mdxJsxAttribute', name: property, value }]
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
                        expression: { type: 'Identifier', name },
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
