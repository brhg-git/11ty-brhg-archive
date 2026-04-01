export default {
  data: {
    layout: 'slide',
    tags: ['gallery-slide'],
    pagination: {
      data: 'files',
      size: 1,
      alias: 'file',
      addAllPagesToCollections: true,
    },
    permalink: ({ page, file }) => `${page.filePathStem}/${file.filename}.html`,
    eleventyComputed: {
      previousSlide: ({ pagination }) =>
        pagination.previousPageHref ? `${pagination.previousPageHref}#slide-image` : '#',
      nextSlide: ({ pagination }) =>
        pagination.nextPageHref ? `${pagination.nextPageHref}#slide-image` : '#',
    },
  },
};
