import { uniorgSlug } from 'uniorg-slug';
import retext from 'retext';
import smartypants from 'retext-smartypants';
import rehypeRaw from 'rehype-raw';
import { visit } from 'unist-util-visit';
import 'katex/dist/contrib/mhchem.js';
import katex from 'rehype-katex';
import prism from '@mapbox/rehype-prism';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import minify from 'rehype-preset-minify';
import h from 'hastscript';
import { matches, selectAll } from 'hast-util-select';
import toString from 'hast-util-to-string';
import { visitParents } from 'unist-util-visit-parents';

import { pathToFrontmatter } from './path-to-frontmatter.js';
import { bibliography } from './bibliography.js';

import { refractor } from 'refractor';

function alpha(Prism) {
  Prism.languages.alpha = {
    comment: /#.*/,
    keyword: /\b(type|fn|let|quote|macro)\b/,
    punctuation: /[[\],;.:{}()]/,
    string: {
      pattern: /"(?:[^\\"]|\\(?:\S|\s+\\))*"/,
      greedy: true,
    },
    'class-name': /\b([A-Z]\w*|i64|f64|i32|f32|bool)\b/,
    builtin: /\b(integer|float|abstract)\b/,
  };
}
alpha.displayName = 'alpha';
alpha.aliases = [];
refractor.register(alpha);

export default {
  uniorgPlugins: [
    slugify,
    uniorgRemoveCards,
    saveRoamRefs,
    [uniorgSmartypants, { oldschool: true }],
    uniorgCiteFormat,
    uniorgSlug,
  ],
  rehypePlugins: [
    rehypeRaw,
    bibtexInfo,
    demoteHeadings,
    [
      prism,
      {
        ignoreMissing: true,
        alias: {
          lisp: ['common-lisp'],
          jsx: ['astro'],
        },
      },
    ],
    katex,
    collectLinks,
    [rehypeAutolinkHeadings, { behavior: 'wrap' }],
    minify,
    // minify removes extra spaces within paragraphs, so description
    // should preferrably be used after minify.
    description,
    saveImages,
  ],
};

function slugify() {
  return async (_tree, file) => {
    file.data.astro.frontmatter = {
      ...(await pathToFrontmatter(file.path)),
      ...file.data.astro.frontmatter,
    };
  };
}

function uniorgRemoveCards() {
  return transformer;

  function transformer(tree) {
    tree.children = tree.children.filter((child) => {
      return !(
        child.type === 'section' &&
        child.children[0].rawValue.toLowerCase() === 'cards'
      );
    });
  }
}

function uniorgSmartypants(options) {
  const processor = retext().use(smartypants, options);
  return transformer;

  function transformer(tree) {
    visit(tree, 'text', (node) => {
      node.value = String(processor.processSync(node.value));
    });
  }
}

function uniorgCiteFormat() {
  return transformer;

  async function transformer(tree) {
    const bib = await bibliography;
    visit(tree, { type: 'link', linkType: 'cite' }, (link, index, parent) => {
      const cite = link.path.replace(/^@/, '');
      const e = bib.get(cite);
      if (!e) {
        return new Error(`bibliography does not exist: ${cite}`);
      }

      const authors = e.AUTHOR?.split(/,? and /) ?? [];
      const lastName = (author) =>
        author?.replace(/^(.*),.*$/, '$1').replace(/^.* (.*)$/, '$1');

      parent.children[index] = {
        type: 'link',
        format: 'bracket',
        linkType: 'cite',
        rawLink: link.rawLink,
        path: cite,
        data: {
          ...link.data,
          hProperties: {
            ...link.data?.hProperties,
            title: e.TITLE,
          },
        },
        children: [
          ...(authors.length === 0
            ? [{ type: 'text', value: e.key }]
            : authors.length === 1
            ? [{ type: 'text', value: lastName(authors[0]) }]
            : authors.length === 2
            ? [
                {
                  type: 'text',
                  value: `${lastName(authors[0])} & ${lastName(authors[1])}`,
                },
              ]
            : [{ type: 'text', value: lastName(authors[0]) + '…' }]),
          ...(e.YEAR
            ? [
                {
                  type: 'subscript',
                  children: [{ type: 'text', value: String(e.YEAR) }],
                },
              ]
            : []),
          ...(link.children.length
            ? [{ type: 'text', value: ', ' }, ...link.children]
            : []),
        ],
      };
    });
  }
}

function demoteHeadings() {
  return transformer;

  function transformer(tree) {
    visit(tree, (node) => {
      if (node.type !== 'element') return;
      switch (node.tagName) {
        case 'h1':
          node.tagName = 'h2';
          break;
        case 'h2':
          node.tagName = 'h3';
          break;
        case 'h3':
          node.tagName = 'h4';
          break;
        case 'h4':
          node.tagName = 'h5';
          break;
        case 'h5':
          node.tagName = 'h6';
          break;
        case 'h6':
          node.tagName = 'p';
          break;
      }
    });
  }
}

// Extract description from the first paragraph.
function description() {
  return transformer;

  function transformer(node, file) {
    const data = file.data.astro.frontmatter;
    if (data.description) {
      return;
    }

    const fakeRoot = h('div', { class: 'root' }, node.children);
    const p = selectAll(
      '.root > p, .root > ul > li > p, .root > ol > li > p',
      fakeRoot
    ).filter(
      // filter out image-only elements
      (p) => p.children.filter((c) => !matches('img', c)).length
    )[0];

    if (p) {
      const description = toString(p);

      data.description = description;
    }
  }
}

function saveImages() {
  return transformer;

  function transformer(tree, file) {
    const images = selectAll('img', tree).map((img) => img.properties.src);
    if (!file.data.astro.frontmatter.images) {
      file.data.astro.frontmatter.images = images;
    }
  }
}

function collectLinks() {
  return transformer;

  function transformer(node, file) {
    const links = selectAll('a', node).map((a) => a.properties.href);
    file.data.astro.frontmatter.links = links;
  }
}

function saveRoamRefs() {
  return transformer;

  function transformer(tree, file) {
    const astro = file.data.astro;
    const ids = astro.ids || (astro.ids = {});

    visitRoamRefs(tree, (/** @type string */ value, node) => {
      let anchor = '';
      if (node.type === 'org-data') {
        anchor = '';
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

        anchor = '#' + data?.hProperties?.id;
      }

      const refs = value.split(/\s+/).filter((x) => !!x);
      refs.forEach((ref) => {
        ids[ref] = anchor;
      });
    });
  }
}

function visitRoamRefs(tree, f) {
  visitParents(
    tree,
    { type: 'node-property', key: 'ROAM_REFS' },
    (property, ancestors) => {
      const value = property.value;

      let parent = ancestors.pop();
      while (
        parent &&
        parent.type !== 'section' &&
        parent.type !== 'org-data'
      ) {
        parent = ancestors.pop();
      }

      if (parent) {
        f(value, parent);
      }
    }
  );
}

// fill more information for bibliographic notes.
function bibtexInfo() {
  return transformer;

  async function transformer(tree, file) {
    const cite = Object.keys(file.data.astro.ids).find((id) =>
      id.startsWith('cite:')
    );
    const url = Object.keys(file.data.astro.ids).find((id) =>
      id.match(/https?:/)
    );
    if (!cite && !url) return;

    let dl = tree.children[0];
    if (dl?.tagName !== 'dl') {
      dl = h('dl', []);
      tree.children.unshift(dl);
    }
    if (cite) {
      const key = cite.slice('cite:'.length);
      const bib = (await bibliography).get(key);

      const author = bib.AUTHOR
        ? [h('dt', 'authors'), h('dd', bib.AUTHOR)]
        : [];
      const year = bib.YEAR ? [h('dt', 'year'), h('dd', '' + bib.YEAR)] : [];
      const url = bib.URL
        ? [h('dt', 'url'), h('dd', h('a', { href: bib.URL }, bib.URL))]
        : [];
      dl.children.push(...author, ...year, ...url);
    } else {
      dl.children.push(h('dt', 'url'), h('dd', [h('a', { href: url }, url)]));
    }
  }
}
