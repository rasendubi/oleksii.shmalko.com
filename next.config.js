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
    config.output.assetModuleFilename = 'static/resources/[hash]/[name][ext]';
    config.output.publicPath = '/_next/';

    config.plugins.push(
      new options.webpack.IgnorePlugin({
        checkResource(resource) {
          return (
            resource.startsWith('./posts/life/') ||
            resource.startsWith('./posts/ring/') ||
            resource.startsWith('./posts/biblio/files/') ||
            resource.match(/\.(org|bib|md)$/)
          );
        },
      })
    );

    // Requires webpack 5.
    config.module.rules.push({
      test: /\.(svg|png|jpe?g|gif|mp4|pdf|txt|sh|zip)$/i,
      type: 'asset/resource',
    });

    return config;
  },
};
