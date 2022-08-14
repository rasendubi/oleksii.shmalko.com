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
        checkResource(resource, context) {
          if (context !== __dirname) {
            return false;
          }

          if (
            !resource.startsWith('./') ||
            resource.startsWith('./node_modules/')
          ) {
            return false;
          }

          if (resource.match(/\.(org|org_archive|bib|md)$/)) {
            return true;
          }

          return !(
            resource.startsWith('./posts/images/') ||
            resource.startsWith('./posts/assets/') ||
            resource.startsWith('./posts/posts/') ||
            (resource.startsWith('./posts/biblio/') &&
              !resource.startsWith('./posts/biblio/files/'))
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
