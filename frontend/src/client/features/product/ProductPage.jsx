import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getProductBySlug, getRelatedProducts } from '../../services/catalog.js';
import { useSettings } from '../../hooks/useSettings';
import { useWishlist } from '../../hooks/useWishlist';
import { cartStore } from '../../stores/cartStore';
import { Image } from '../../components/ui/Image';
import { Icon } from '../../components/ui/Icon';
import { ProductCard } from '../../components/ui/ProductCard';
import { formatMoney } from '../../utils/formatMoney';
import { useT } from '../../hooks/useT';
import '../../styles/product.css';

/** Mobile-first product detail route with related products. */
export function ProductPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const settings = useSettings();
  const { t } = useT();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('olive');
  const [message, setMessage] = useState('');
  const { inWishlist, toggleWishlist } = useWishlist(product?.id);

  useEffect(() => {
    let active = true;
    Promise.all([getProductBySlug(slug), getRelatedProducts(slug)]).then(([data, related]) => {
      if (active) {
        setProduct(data);
        setRelatedProducts(related);
        setSelectedSize(data?.availableSizes?.[0] || '');
      }
    });
    return () => { active = false; };
  }, [slug]);

  useEffect(() => {
    if (!message) return undefined;
    const timer = setTimeout(() => setMessage(''), 3000);
    return () => clearTimeout(timer);
  }, [message]);

  if (!product) return <div className="sf-product-loading" aria-live="polite">{t('shop.loading')}</div>;

  const discount = product.compareAtPrice ? Math.round((1 - product.price / product.compareAtPrice) * 100) : 0;
  const price = formatMoney(product.price, settings);
  const compareAt = product.compareAtPrice ? formatMoney(product.compareAtPrice, settings) : '';
  const addToCart = () => {
    if (!selectedSize) {
      setMessage(t('product.selectSize'));
      return;
    }
    cartStore.addItem(product.id, 1, { size: selectedSize, color: selectedColor });
    setMessage(t('product.addedToCart', { name: product.name }));
  };

  return (
    <div className="sf-product-page">
      <header className="sf-product-topbar">
        <button type="button" className="sf-icon-button" onClick={() => navigate(-1)} aria-label={t('product.back')}>
          <Icon name="arrow-left" size={20} />
        </button>
        <div className="sf-product-actions">
          <button type="button" className="sf-icon-button" onClick={toggleWishlist} aria-pressed={inWishlist} aria-label={inWishlist ? t('product.removeFromWishlist', { name: product.name }) : t('product.addToWishlist', { name: product.name })}>
            <Icon name="heart" size={19} filled={inWishlist} />
          </button>
          <button type="button" className="sf-icon-button" onClick={() => navigate('/cart')} aria-label={t('nav.cart')}>
            <Icon name="shopping-bag" size={19} />
          </button>
        </div>
      </header>
      <main>
        <section className="sf-product-gallery" aria-label={t('product.swipePhotos', { current: 1, total: 1 })}>
          <Image src={product.image?.src} alt={product.image?.alt || product.name} color={product.image?.color} placeholderText={t('product.swipePhotos', { current: 1, total: 1 })} />
        </section>
        <section className="sf-product-info">
          <h1>{product.name}</h1>
          <div className="sf-product-price"><strong>{price}</strong>{compareAt && <del>{compareAt}</del>}{discount > 0 && <span>{discount}% off</span>}</div>
          <div className="sf-product-option">
            <div className="sf-option-heading"><strong>{t('product.size')}</strong><button type="button">{t('product.sizeChart')}</button></div>
            <div className="sf-size-list">{product.sizes.map((size) => { const available = product.availableSizes.includes(size); return <button type="button" key={size} disabled={!available} className={selectedSize === size ? 'is-selected' : ''} aria-pressed={selectedSize === size} onClick={() => { setSelectedSize(size); setMessage(''); }}>{size}</button>; })}</div>
            {product.lowStock && <p className="sf-stock-note">{t('product.lowStock', { count: 3, size: selectedSize || product.availableSizes[0] })}</p>}
          </div>
          <div className="sf-product-option"><strong>{t('product.colour')}: {product.colors.find((color) => color.value === selectedColor)?.label || product.colors[0].label}</strong><div className="sf-color-list">{product.colors.map((color) => <button type="button" key={color.value} className={selectedColor === color.value ? 'is-selected' : ''} style={{ '--swatch': color.hex }} aria-label={color.label} aria-pressed={selectedColor === color.value} onClick={() => setSelectedColor(color.value)}><span aria-hidden="true" /></button>)}</div></div>
          <p className="sf-delivery-note">{t('product.cod')} · {t('product.delivery', { days: product.deliveryDays })}</p>
          <div className="sf-product-accordions"><details open><summary>{t('product.description')}</summary><p>{product.description || t('product.defaultDescription')}</p></details><details><summary>{t('product.deliveryReturns')}</summary><p>{t('product.delivery', { days: product.deliveryDays })}</p></details></div>
          <footer className="sf-product-footer"><button type="button" className="sf-whatsapp-button">WA</button><button type="button" className="sf-add-button" onClick={addToCart}>{t('product.addToCart')} · {price}</button></footer>
        </section>
      </main>
      {relatedProducts.length > 0 && <section className="sf-recommendations" aria-labelledby="product-recommendations"><h2 id="product-recommendations">{t('product.recommendations')}</h2><div className="sf-recommendation-grid">{relatedProducts.map((item) => <ProductCard key={item.id} product={item} />)}</div></section>}
      {message && <p className="sf-product-message" role="status" aria-live="polite">{message}</p>}
    </div>
  );
}

export default ProductPage;
