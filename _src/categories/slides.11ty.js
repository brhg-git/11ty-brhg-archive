export default {
  data: {
    layout: 'slide',
    tags: 'category-slide',
    pagination: {
      data: 'collections.categoriesAllItems',
      size: 1,
      alias: 'file',
    },
    eleventyComputed: {
      previousSlide: ({ file }) =>
        file.previousSlide ? `${file.previousSlide}.html#slide-image` : '#',
      nextSlide: ({ file }) => (file.nextSlide ? `${file.nextSlide}.html#slide-image` : '#'),
      title: ({ file }) => file.slideCatLabel,
    },
    permalink: function ({ file }) {
      return `${file.slideCat}/slides/${file.filename}.html`;
    },
  },
};
