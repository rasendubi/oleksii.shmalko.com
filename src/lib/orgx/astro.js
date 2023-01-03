import { orgPlugin } from './rollup.js';
import { extractKeywords } from 'uniorg-extract-keywords';
import { rehypeExportKeywords } from './plugin/rehype-export-keywords.js';
import { uniorgSlug } from 'uniorg-slug';
import { visitIds } from 'orgast-util-visit-ids';
// import { rehypeResolveImg } from './rehype-resolve-img';

export default function org(options = {}) {
  return {
    name: '@uniorgjs/astro',
    hooks: {
      'astro:config:setup': async ({
        updateConfig,
        config,
        addPageExtension,
        command,
      }) => {
        addPageExtension('.org');

        updateConfig({
          vite: {
            plugins: [
              {
                enforce: 'pre',
                ...orgPlugin({
                  ...options,
                  uniorgPlugins: [
                    [extractKeywords, { name: 'keywords' }],
                    uniorgSlug,
                    saveIds,
                    ...(options.uniorgPlugins ?? []),
                  ],
                  rehypePlugins: [
                    ...(options.rehypePlugins ?? []),
                    rehypeExportKeywords,
                  ],
                  // rehypePlugins: [rehypeResolveImg],
                  jsxImportSource: 'astro',
                }),
              },
              {
                name: '@uniorgjs/astro-postprocess',
                transform: (code, id) => {
                  if (!id.endsWith('.org')) {
                    return;
                  }

                  let url = undefined;
                  try {
                    url = new URL(`file://${id}`);
                  } catch {}

                  const fileId = id.split('?')[0];

                  code += `\nexport const url = ${JSON.stringify(url)};`;
                  code += `\nexport const file = ${JSON.stringify(fileId)};`;

                  return code;
                },
              },
            ],
          },
        });
      },
    },
  };
}

function saveIds() {
  return transformer;

  function transformer(tree, file) {
    const data = file.data || (file.data = {});
    const keywords = data.keywords || (data.keywords = {});
    const ids = keywords.ids || (keywords.ids = {});

    visitIds(tree, (id, node) => {
      if (node.type === 'org-data') {
        ids[id] = '';
      } else if (node.type === 'section') {
        const headline = node.children[0];
        const data = (headline.data = headline.data || {});
        if (!data?.hProperties?.id) {
          // The headline doesn't have an html id assigned.
          //
          // Assign an html id property based on org id property, so
          // the links are not broken.
          data.hProperties = data.hProperties || {};
          data.hProperties.id = id;
        }

        ids[id] = '#' + data?.hProperties?.id;
      }
    });
  }
}
