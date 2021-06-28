const path = require('path');

module.exports = {
  future: {
    webpack5: true,
  },

  trailingSlash: true,

  async redirects() {
    return [
      {
        source: '/biblio/:slug(\\.bib)',
        destination: '/biblio/:slug',
        permanent: true,
      },
    ];
  },

  webpack: (config, options) => {
    // Requires webpack 5.
    config.output.assetModuleFilename = 'static/resources/[hash]/[name][ext]';
    config.output.publicPath = '/_next/';
    config.module.rules.push({
      include: [
        path.resolve(__dirname, 'posts/life'),
        path.resolve(__dirname, 'posts/ring'),
      ],
      use: [{ loader: 'ignore-loader' }],
    });
    config.module.rules.push({
      test: /\.(org|bib|md)$/,
      use: [{ loader: 'ignore-loader' }],
    });
    config.module.rules.push({
      test: /\.(svg|png|jpe?g|gif|mp4|pdf|txt|sh|zip)$/i,
      type: 'asset/resource',
    });

    return config;
  },
};
