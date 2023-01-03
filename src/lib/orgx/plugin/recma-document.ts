import type { Program, FunctionDeclaration } from 'estree-jsx';

export const recmaDocument = (options: any = {}) => {
  const {
    pragma = 'React.createElement',
    pragmaFrag = 'React.Fragment',
    pragmaImportSource = 'react',
    jsxImportSource = 'react',
    jsxRuntime = 'automatic',
  } = options;
  return transform;

  function transform(tree, file) {
    const program = tree as Program;
    const replacement: any[] = [];

    if (!program.comments) {
      program.comments = [];
    }
    const pragmas: string[] = [];
    if (jsxRuntime) {
      pragmas.push('@jsxRuntime ' + jsxRuntime);
    }
    if (jsxRuntime === 'automatic' && jsxImportSource) {
      pragmas.push('@jsxImportSource ' + jsxImportSource);
    } else if (jsxRuntime === 'classic') {
      if (pragma) {
        pragmas.push('@jsx ' + pragma);
      }
      if (pragmaFrag) {
        pragmas.push('@jsxFrag ' + pragmaFrag);
      }
    }
    if (pragmas.length > 0) {
      program.comments.unshift({ type: 'Block', value: pragmas.join(' ') });
    }

    if (jsxRuntime === 'classic' && pragmaImportSource) {
      if (!pragma) {
        throw new Error(
          'Missing `pragma` in classic runtime with `pragmaImportSource`'
        );
      }

      replacement.push({
        type: 'ImportDeclaration',
        specifiers: [
          {
            type: 'ImportDefaultSpecifier',
            local: { type: 'Identifier', name: pragma.split('.')[0] },
          },
        ],
        source: { type: 'Literal', value: pragmaImportSource },
      });
    }

    for (const child of program.body) {
      if (
        child.type === 'ExpressionStatement' &&
        ((child.expression.type as any) === 'JSXFragment' ||
          child.expression.type === 'JSXElement')
      ) {
        replacement.push(createContent(child.expression));
      } else {
        replacement.push(child);
      }
    }

    replacement.push({
      type: 'ExportDefaultDeclaration',
      declaration: { type: 'Identifier', name: 'Content' },
    });

    program.body = replacement;
  }
};

function createContent(content): FunctionDeclaration {
  return {
    type: 'FunctionDeclaration',
    id: { type: 'Identifier', name: 'Content' },
    params: [],
    body: {
      type: 'BlockStatement',
      body: [
        {
          type: 'VariableDeclaration',
          kind: 'const',
          declarations: [
            {
              type: 'VariableDeclarator',
              id: { type: 'Identifier', name: '_content' },
              init: content || { type: 'Literal', value: null },
            },
          ],
        },
        {
          type: 'ReturnStatement',
          argument: { type: 'Identifier', name: '_content' },
        },
      ],
    },
  };
}
