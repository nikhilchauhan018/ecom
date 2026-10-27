const names = ['Linen Shirt', 'Everyday Kurta', 'Canvas Sneaker', 'Travel Tote', 'Relaxed Trousers', 'Cotton Dress', 'Wool Overshirt', 'Classic Chinos'];
const categories = ['Shirts', 'Kurtas', 'Footwear', 'Accessories', 'Trousers', 'Dresses', 'Outerwear'];
const sizes = ['S', 'M', 'L', 'XL'];
const colors = ['Navy', 'Natural', 'Black'];

function createProduct(index) {
  const name = `${names[index % names.length]} ${Math.floor(index / names.length) + 1}`;
  const basePrice = 1200 + (index * 173) % 6200;
  const variants = sizes.flatMap((size, sizeIndex) => colors.map((color, colorIndex) => {
    const variantIndex = sizeIndex * colors.length + colorIndex;
    return {
      id: `variant-${index + 1}-${variantIndex + 1}`,
      sku: `PROD-${String(index + 1).padStart(3, '0')}-${size}-${color.slice(0, 3).toUpperCase()}`,
      barcode: `890${String(index + 1).padStart(5, '0')}${String(variantIndex + 1).padStart(2, '0')}`,
      options: { size, color },
      price: basePrice,
      salePrice: index % 4 === 0 ? basePrice - 200 : null,
      cost: Math.round(basePrice * 0.45),
      stock: 8 + ((index + variantIndex) % 34),
      image: `/products/product-${index + 1}.jpg`,
    };
  }));
  return {
    id: `product-${index + 1}`,
    name,
    slug: name.toLowerCase().replaceAll(' ', '-'),
    description: `A versatile ${name.toLowerCase()} for everyday wear.`,
    category: categories[index % categories.length],
    status: index % 9 === 0 ? 'draft' : index % 7 === 0 ? 'scheduled' : 'published',
    updatedAt: new Date(Date.UTC(2026, 8, 1 + (index % 28))).toISOString(),
    variants,
    images: variants.slice(0, 3).map((variant) => variant.image),
  };
}

export const productsMock = Array.from({ length: 64 }, (_, index) => createProduct(index));
export { categories };
