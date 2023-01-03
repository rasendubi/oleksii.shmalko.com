import bibtexParse from 'bibtex-parse';

export default function bib({
  frontmatter = (_id, _entries) => {
    return {};
  },
} = {}) {
  return {
    name: '@uniorgjs/astro',
    hooks: {
      'astro:config:setup': async ({ updateConfig, addPageExtension }) => {
        addPageExtension('.bib');

        updateConfig({
          vite: {
            plugins: [
              {
                enforce: 'pre',
                name: 'rollup-bib',
                transform: async (code, id) => {
                  if (!id.endsWith('.bib')) {
                    return;
                  }

                  const fileId = id.split('?')[0];

                  const entries = bibtexParse.entries(code);

                  return [
                    `export const file = ${JSON.stringify(fileId)};`,
                    `export const frontmatter = ${JSON.stringify(
                      await frontmatter(id, entries)
                    )};`,
                    `export const entries = ${JSON.stringify(entries)};`,
                  ].join('\n');
                },
              },
            ],
          },
        });
      },
    },
  };
}
