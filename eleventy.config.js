import path from 'node:path';
import * as sass from 'sass';
import { HtmlBasePlugin } from '@11ty/eleventy';
import { imageSizeFromFile } from 'image-size/fromFile';
import categories from './_src/_data/categories.json' with { type: 'json' };

const lightboxPath = './node_modules/lightbox2/dist/';
const lightboxImgPath = lightboxPath + 'images';

export default function (eleventyConfig) {
  /****************************************************************************
   * Global data
   ***************************************************************************/

  eleventyConfig.addGlobalData('mainSiteReturnURL', 'https://brh.org.uk/site/');
  eleventyConfig.addGlobalData('imageDir', 'archive-images');
  eleventyConfig.addGlobalData('layout', 'template.njk');
  eleventyConfig.addGlobalData('lightboxPath', lightboxPath);
  eleventyConfig.addGlobalData('thisYear', () => new Date().getFullYear());

  /****************************************************************************
   * Collections
   ***************************************************************************/

  /**
   * Ordered galleries for front page
   */
  eleventyConfig.addCollection('orderedGalleries', function (collectionsApi) {
    const galleries = collectionsApi.getFilteredByTag('gallery');
    return galleries;
  });

  /**
   * Category collections x 2
   *
   * All items with a category set and items with categories set grouped into categories
   */
  const makeCategoryList = (items) => {
    const filteredGallerySlideData = items
      .map((gallery) => gallery.data.files)
      .flat()
      .filter((item) => 'categories' in item);

    // Make a new item for each of and existing item's categories; e.g. ['posters', 'festivals'] makes 2 new items
    const categorySlideData = filteredGallerySlideData.reduce((acc, item) => {
      item.categories.forEach((cat) => {
        // Deep copy just in case
        let newItem = structuredClone(item);
        let newItemCat = categories.find((el) => el.name === cat);

        newItem.slideCat = newItemCat?.name ?? 'missing_category';
        newItem.slideCatLabel = newItemCat?.label ?? 'Category not in data file!';

        acc = [...acc, newItem];
      });
      return acc;
    }, []);

    // Order by category name
    categorySlideData.sort((a, b) => a.slideCat.localeCompare(b.slideCat));

    return categorySlideData;
  };

  // A collection of items grouped by category
  eleventyConfig.addCollection('categories', async (collectionsApi) => {
    const categorySlideData = makeCategoryList(collectionsApi.getFilteredByTag('gallery'));

    return Object.groupBy(categorySlideData, (item) => item.slideCat);
  });

  // A collection of all items with categories
  eleventyConfig.addCollection('categoriesAllItems', async (collectionsApi) => {
    const categorySlideData = makeCategoryList(collectionsApi.getFilteredByTag('gallery'));

    const paginatedCategorySlideData = categorySlideData.map((item, i) => {
      // Next slide
      if (i + 1 in categorySlideData && categorySlideData[i + 1].slideCat === item.slideCat) {
        item.nextSlide = categorySlideData[i + 1].filename;
      } else {
        item.nextSlide = '';
      }

      // Previous slide
      if (i - 1 in categorySlideData && categorySlideData[i - 1].slideCat === item.slideCat) {
        item.previousSlide = categorySlideData[i - 1].filename;
      } else {
        item.previousSlide = '';
      }
      return item;
    });

    return paginatedCategorySlideData;
  });

  /****************************************************************************
   * Shortcodes
   ***************************************************************************/

  /**
   * Generate the image tags
   */
  eleventyConfig.addAsyncShortcode(
    'generateImgTag',
    async function ({ filename, extension, folder, item }, type = '', classname = '') {
      // All thumbs are JPEGs
      const typeExt = type === 'thumb' ? '_thumb.jpg' : '.' + extension;

      const imagePath = path.resolve(
        path.join('_src', this.ctx.imageDir, folder, type, filename + typeExt),
      );

      const { width, height } = await imageSizeFromFile(imagePath);

      const imgSrc = [this.ctx.imageDir, folder, type, filename].join('/') + `${typeExt}`;

      return `<img 
          src="/${imgSrc}" 
          class="${classname} ${width > height ? 'landscape' : 'portrait'}" 
          alt="${item}"
          width="${width}"
          height="${height}"
          loading="${type === 'thumb' ? 'lazy' : 'eager'}"
        >`;
    },
  );

  /**
   * Construct the links from galleries to slide pages
   * A shortcode is used here because it is simpler than trying to construct the link URLs in Nunjucks.
   */
  eleventyConfig.addShortcode('slideLink', function ({ filename, folder, slideCat = '' }) {
    if (Array.isArray(this.ctx.tags)) {
      return this.ctx.tags.some((item) => ['gallery', 'gallery-slide'].includes(item))
        ? `${this.ctx.page.fileSlug}/slides/${filename}.html`
        : `${slideCat}/slides/${filename}.html`;
    }

    return '';
  });

  /**
   * Make an email link
   */
  eleventyConfig.addAsyncShortcode('emailLink', async function (linkText) {
    return `<span class="email" data-link-text="${linkText}"></span>`;
  });

  /**
   * Construct the path to an image file
   */
  eleventyConfig.addAsyncShortcode(
    'imagePath',
    async function ({ filename, extension, folder }, type = '') {
      // Import 11ty HTML Base filter
      const htmlBaseUrl = eleventyConfig.getFilter('htmlBaseUrl');

      const typeStr = type === 'thumb' ? '_thumb' : '';
      // All thumbs are JPEGs
      const typeExt = type === 'thumb' ? 'jpg' : extension;

      return [this.ctx.imageDir, folder, type, filename].join('/') + `${typeStr}.${typeExt}`;
    },
  );

  /****************************************************************************
   * Layout alias
   ***************************************************************************/
  eleventyConfig.addLayoutAlias('gallery', 'thumb-gallery.njk');
  eleventyConfig.addLayoutAlias('gallery-slide', 'gallery-slide.11ty.js');
  eleventyConfig.addLayoutAlias('slide', 'slide-page.njk');

  /****************************************************************************
   * Copy through
   ***************************************************************************/
  eleventyConfig.addPassthroughCopy('**/large');
  eleventyConfig.addPassthroughCopy('**/thumb');
  eleventyConfig.addPassthroughCopy('_src/images/favicons');
  eleventyConfig.addPassthroughCopy('_src/images/letters');
  // Lightbox button images
  eleventyConfig.addPassthroughCopy({
    [lightboxImgPath]: 'images',
  });

  /**
   * Path prefix. Uses pathPrefix, see returned object below.
   */
  eleventyConfig.addPlugin(HtmlBasePlugin);

  /****************************************************************************
   * Add SCSS
   * @link https://www.11ty.dev/docs/languages/sass/
   ***************************************************************************/
  eleventyConfig.addTemplateFormats('scss');
  eleventyConfig.addExtension('scss', {
    outputFileExtension: 'css',
    useLayouts: false,

    compile: async function (inputContent, inputPath) {
      let parsed = path.parse(inputPath);

      if (parsed.name.startsWith('_')) {
        return;
      }

      let result = sass.compileString(inputContent, {
        loadPaths: [parsed.dir || '.', this.config.dir.includes],
      });

      this.addDependencies(inputPath, result.loadedUrls);

      return async (data) => {
        return result.css;
      };
    },
  });

  /****************************************************************************
   * Settings
   ***************************************************************************/
  return {
    dir: {
      input: '_src',
      output: '_dist',
    },
    markdownTemplateEngine: 'njk',
    htmlTemplateEngine: 'njk',
    pathPrefix: '/site/brhg-archive/',
  };
}
