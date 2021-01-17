module.exports = {
  async redirects() {
    return [
      {
        source: '/biblio/:slug(\\.bib)',
        destination: '/biblio/:slug',
        permanent: true,
      },
    ];
  },
};
