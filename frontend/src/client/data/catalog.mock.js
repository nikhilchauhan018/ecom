const genders = ['women', 'men', 'girls', 'boys', 'unisex'];
const categories = ['kurtis', 'dresses', 'tops', 'bottoms', 'shirts', 'outerwear'];
const sizes = ['xs', 's', 'm', 'l', 'xl', 'xxl'];
const colors = [
  ['black', 'Black', '#17181a'], ['white', 'White', '#ffffff'], ['olive', 'Olive', '#708238'],
  ['navy', 'Navy', '#23395d'], ['maroon', 'Maroon', '#812f3c'], ['beige', 'Beige', '#d8c49c'],
  ['pink', 'Pink', '#e7a0b0'], ['blue', 'Blue', '#4e82b5'],
];
const fabrics = ['cotton', 'linen', 'denim', 'rayon'];
const names = ['Everyday', 'Relaxed', 'Textured', 'Classic', 'Lightweight', 'Soft'];

/** @type {import('../types/home').Product[]} */
export const catalogProducts = Array.from({ length: 72 }, (_, index) => {
  const gender = genders[index % genders.length];
  const category = categories[index % categories.length];
  const color = colors[index % colors.length];
  const priceMinor = 1800 + ((index * 1375) % 7200);
  const compareAtMinor = index % 3 === 0 ? priceMinor + 1800 : null;
  return {
    id: `catalog-${index + 1}`,
    slug: `catalog-${index + 1}`,
    name: `${names[index % names.length]} ${category} ${index + 1}`,
    price: priceMinor / 100,
    compareAtPrice: compareAtMinor ? compareAtMinor / 100 : null,
    priceMinor,
    compareAtMinor,
    badge: compareAtMinor ? 'Sale' : null,
    image: { src: null, alt: `${names[index % names.length]} ${category}`, color: color[2] },
    inStock: index % 9 !== 0,
    lowStock: index % 7 === 0,
    gender,
    category,
    size: sizes[index % sizes.length],
    color: color[0],
    colorLabel: color[1],
    colorHex: color[2],
    rating: 2 + (index % 4),
    discount: compareAtMinor ? Math.round((1 - priceMinor / compareAtMinor) * 100) : 0,
    fabric: fabrics[index % fabrics.length],
    createdAt: 72 - index,
  };
});

export default catalogProducts;