/**
 * @typedef {Object} HeroImage
 * @property {string|null} src
 * @property {string} alt
 * @property {number} width
 * @property {number} height
 * @property {string} color
 */

/**
 * @typedef {Object} HeroSection
 * @property {string} eyebrow
 * @property {string} title
 * @property {string} ctaLabel
 * @property {string} ctaUrl
 * @property {HeroImage} image
 */

/**
 * @typedef {Object} Category
 * @property {string|number} id
 * @property {string} name
 * @property {string} slug
 * @property {{ src: string|null, alt: string, color: string }} image
 */

/**
 * @typedef {Object} Season
 * @property {string|number} id
 * @property {string} name
 * @property {string} description
 * @property {string} slug
 * @property {{ src: string|null, alt: string, color: string }} image
 */

/**
 * @typedef {Object} Product
 * @property {string|number} id
 * @property {string} slug
 * @property {string} name
 * @property {number} price
 * @property {number|null} compareAtPrice
 * @property {string|null} badge
 * @property {{ src: string|null, alt: string, color: string }} image
 * @property {boolean} inStock
 * @property {boolean} lowStock
 */

/**
 * @typedef {Object} HomeData
 * @property {HeroSection} hero
 * @property {Category[]} categories
 * @property {Season[]} seasons
 * @property {Product[]} newArrivals
 */

export {};
