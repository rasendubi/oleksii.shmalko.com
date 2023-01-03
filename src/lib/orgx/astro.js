import { orgPlugin } from './rollup.js';
import { extractKeywords } from 'uniorg-extract-keywords';
import { rehypeExportFrontmatter } from './plugin/rehype-export-frontmatter.js';
import { uniorgSlug } from 'uniorg-slug';
import { visitIds } from 'orgast-util-visit-ids';
import { rehypeResolveImg } from './rehype-resolve-img.js';

export default function org(options = {}) {
  return {
    name: '@uniorgjs/astro',
    hooks: {
      'astro:config:setup': async ({ updateConfig, addPageExtension }) => {
        addPageExtension('.org');

        updateConfig({
          vite: {
            plugins: [
              {
                enforce: 'pre',
                ...orgPlugin({
                  ...options,
                  uniorgPlugins: [
                    initFrontmatter,
                    [extractKeywords, { name: 'keywords' }],
                    keywordsToFrontmatter,
                    uniorgSlug,
                    saveIds,
                    ...(options.uniorgPlugins ?? []),
                  ],
                  rehypePlugins: [
                    ...(options.rehypePlugins ?? []),
                    rehypeResolveImg,
                    rehypeExportFrontmatter,
                  ],
                  jsxImportSource: 'astro',
                }),
              },
              {
                name: '@uniorgjs/astro-postprocess',
                transform: (code, id) => {
                  if (!id.endsWith('.org')) {
                    return;
                  }

                  const fileId = id.split('?')[0];

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

function initFrontmatter() {
  return transformer;

  function transformer(tree, file) {
    if (!file.data.astro) {
      file.data.astro = { frontmatter: {} };
    }
  }
}

function keywordsToFrontmatter() {
  return transformer;

  function transformer(tree, file) {
    file.data.astro.frontmatter = {
      ...file.data.astro.frontmatter,
      ...file.data.keywords,
    };
  }
}

function saveIds() {
  return transformer;

  function transformer(tree, file) {
    const astro = file.data.astro;
    const ids = astro.ids || (astro.ids = {});

    visitIds(tree, (id, node) => {
      if (node.type === 'org-data') {
        ids['id:' + id] = '';
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

        ids['id:' + id] = '#' + data?.hProperties?.id;
      }
    });
  }
}
