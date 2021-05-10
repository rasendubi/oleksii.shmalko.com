module.exports = {
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
    config.module.rules.push({
      test: /\.(svg|png|jpe?g|gif|mp4|pdf|txt|sh|zip)$/i,
      use: [
        {
          loader: 'file-loader',
          options: {
            publicPath: '/_next',
            name: 'static/[name].[hash].[ext]',
          },
        },
      ],
    });
    // Requires webpack 5.
    // config.module.rules.push({
    //   test: /\.(svg|png|jpe?g|gif|mp4|pdf|txt)$/i,
    //   type: 'asset',
    // });

    config.module.rules.push({
      test: /\.(org|bib|md)$/,
      use: [{ loader: 'ignore-loader' }],
    });

    return config;
  },
};
