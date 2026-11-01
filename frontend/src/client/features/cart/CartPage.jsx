import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getProductsByIds } from '../../services/catalog.js';
import { cartStore } from '../../stores/cartStore';
import { CART_CONFIG } from '../../data/cart.mock';
import { useSettings } from '../../hooks/useSettings';
import { useT } from '../../hooks/useT';
import { formatMoney } from '../../utils/formatMoney';
import { Image } from '../../components/ui/Image';
import { Icon } from '../../components/ui/Icon';
import '../../styles/cart.css';

/** Responsive storefront cart with a desktop products and summary split. */
export function CartPage() {
  const navigate = useNavigate();
  const settings = useSettings();
  const { t } = useT();
  const [items, setItems] = useState(() => cartStore.getSnapshot());
  const [products, setProducts] = useState([]);
  const [couponInput, setCouponInput] = useState('');
  const [coupon, setCoupon] = useState(null);

  useEffect(() => cartStore.subscribe(() => setItems(cartStore.getSnapshot())), []);
  useEffect(() => { getProductsByIds(items.map((item) => item.id)).then(setProducts); }, [items]);

  const lines = useMemo(() => items.map((item) => ({ item, product: products.find((product) => String(product.id) === String(item.id)) })).filter((line) => line.product), [items, products]);
  const subtotal = lines.reduce((total, line) => total + line.product.price * (line.item.quantity || 1), 0);
  const discount = coupon ? Math.round(subtotal * coupon.percent / 100) : 0;
  const delivery = lines.length ? CART_CONFIG.deliveryMinor / 100 : 0;
  const total = subtotal - discount + delivery;
  const updateQuantity = (id, quantity) => { if (quantity < 1) cartStore.removeItem(id); else cartStore.updateQuantity(id, quantity); };
  const applyCoupon = () => { const match = CART_CONFIG.coupons.find((item) => item.code === couponInput.trim().toUpperCase()); setCoupon(match || null); };

  if (!lines.length) return <div className="sf-cart-page sf-cart-empty"><h1>{t('cart.emptyTitle')}</h1><p>{t('cart.emptyBody')}</p><Link className="sf-cart-continue" to="/shop">{t('cart.continueShopping')}</Link></div>;

  return (
    <div className="sf-cart-page">
      <header className="sf-cart-header"><button type="button" className="sf-cart-back" onClick={() => navigate(-1)} aria-label={t('cart.back')}><Icon name="chevron-left" size={21} /></button><h1>{t('cart.title')} ({items.reduce((sum, item) => sum + (item.quantity || 1), 0)})</h1></header>
      <main className="sf-cart-layout">
        <section className="sf-cart-lines" aria-label={t('cart.title')}>
          {lines.map(({ item, product }) => {
            const quantity = item.quantity || 1;
            const color = item.color || product.colors?.[0]?.label || 'Olive';
            const size = item.size || product.availableSizes?.[0] || 'M';
            return <article className="sf-cart-line" key={product.id}><Link to={`/product/${product.slug}`} className="sf-cart-image"><Image src={product.image?.src} alt={product.image?.alt || product.name} color={product.image?.color} placeholderText="Photo" /></Link><div className="sf-cart-line-info"><Link to={`/product/${product.slug}`} className="sf-cart-name">{product.name}</Link><span className="sf-cart-variant">{size} / {color}</span><div className="sf-quantity-control"><button type="button" onClick={() => updateQuantity(product.id, quantity - 1)} aria-label={t('cart.decrease', { name: product.name })}><Icon name="minus" size={15} /></button><span>{quantity}</span><button type="button" onClick={() => updateQuantity(product.id, quantity + 1)} aria-label={t('cart.increase', { name: product.name })}><Icon name="plus" size={15} /></button></div></div><strong className="sf-cart-line-price">{formatMoney(product.price * quantity, settings)}</strong><button type="button" className="sf-cart-remove-icon" onClick={() => cartStore.removeItem(product.id)} aria-label={t('cart.remove', { name: product.name })}><Icon name="x" size={20} /></button></article>;
          })}
        </section>
        <aside className="sf-cart-summary"><div className="sf-coupon"><input value={couponInput} onChange={(event) => setCouponInput(event.target.value)} placeholder={t('cart.couponPlaceholder')} aria-label={t('cart.couponPlaceholder')} /><button type="button" onClick={applyCoupon}>{t('cart.apply')}</button></div><dl><div><dt>{t('cart.subtotal')}</dt><dd>{formatMoney(subtotal, settings)}</dd></div>{coupon && <div className="sf-cart-discount"><dt>{t('cart.discount', { code: coupon.code })}</dt><dd>-{formatMoney(discount, settings)}</dd></div>}<div><dt>{t('cart.delivery')}</dt><dd>{formatMoney(delivery, settings)}</dd></div><div className="sf-cart-total"><dt>{t('cart.total')}</dt><dd>{formatMoney(total, settings)}</dd></div></dl><button type="button" className="sf-cart-checkout" onClick={() => navigate('/checkout')}>{t('cart.checkout')}</button></aside>
      </main>
    </div>
  );
}

export default CartPage;
