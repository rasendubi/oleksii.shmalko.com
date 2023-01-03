import { VFile } from 'vfile';
import { createFilter } from 'rollup-pluginutils';
import { compile } from '@uniorgjs/orgx';

export const orgPlugin = (options = {}) => {
  const { include, exclude } = options;

  const filter = createFilter(include, exclude);

  return {
    name: 'rollup-plugin-org',
    transform: async (value, path) => {
      const file = new VFile({ value, path });
      if (file.extname === '.org' && filter(file.path)) {
        const compiled = await compile(file, options);
        // console.log('compiled', String(compiled.value));
        return { code: String(compiled.value), map: compiled.map };
      }
    },
  };
};
