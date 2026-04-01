export default {
  data: {
    layout: 'gallery',
    permalink: function ({ cat }) {
      return `${this.slugify(cat.name)}/index.html`;
    },
    tags: ['category'],
    pagination: {
      data: 'categories',
      size: 1,
      alias: 'cat',
      addAllPagesToCollections: true,
    },
    eleventyComputed: {
      title: ({ cat }) => cat.label,
    },
  },
};
