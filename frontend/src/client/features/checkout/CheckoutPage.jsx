import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getProductsByIds } from '../../services/catalog.js';
import { listAddresses } from '../../services/account';
import { cartStore } from '../../stores/cartStore';
import { useAuth } from '../../hooks/useAuth';
import { useSettings } from '../../hooks/useSettings';
import { useT } from '../../hooks/useT';
import { formatMoney } from '../../utils/formatMoney';
import '../../styles/checkout.css';

const LOCAL_ADDRESSES_KEY = 'storefront_checkout_addresses';

/** Checkout page with reusable saved addresses and a new-address fallback. */
export function CheckoutPage() {
  const navigate = useNavigate();
  const settings = useSettings();
  const { t } = useT();
  const { isAuthenticated } = useAuth();
  const [items] = useState(() => cartStore.getSnapshot());
  const [products, setProducts] = useState([]);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState('new');
  const [saveForLater, setSaveForLater] = useState(true);
  const [payment, setPayment] = useState('cash');
  const [placed, setPlaced] = useState(false);
  const [form, setForm] = useState({ fullName: '', phone: '', address: '', city: '', postalCode: '' });

  useEffect(() => { getProductsByIds(items.map((item) => item.id)).then(setProducts); }, [items]);
  useEffect(() => {
    let active = true;
    const local = JSON.parse(localStorage.getItem(LOCAL_ADDRESSES_KEY) || '[]');
    setSavedAddresses(local);
    if (local[0]) setSelectedAddress(local[0].id);
    if (isAuthenticated) listAddresses().then((accountAddresses) => { if (!active) return; const merged = [...accountAddresses, ...local.filter((localAddress) => !accountAddresses.some((address) => address.postalCode === localAddress.postalCode && address.line1 === localAddress.line1))]; setSavedAddresses(merged); const preferred = accountAddresses.find((address) => address.isDefault) || merged[0]; if (preferred) setSelectedAddress(preferred.id); }).catch(() => {});
    return () => { active = false; };
  }, [isAuthenticated]);

  const lines = useMemo(() => items.map((item) => ({ item, product: products.find((product) => String(product.id) === String(item.id)) })).filter((line) => line.product), [items, products]);
  const subtotal = lines.reduce((total, line) => total + line.product.price * (line.item.quantity || 1), 0);
  const total = subtotal + (lines.length ? 5 : 0);
  const selectedSavedAddress = savedAddresses.find((address) => address.id === selectedAddress);
  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const selectSavedAddress = (address) => { setSelectedAddress(address.id); setForm({ fullName: address.fullName, phone: address.phone, address: [address.line1, address.line2].filter(Boolean).join(', '), city: address.city, postalCode: address.postalCode }); };
  const persistNewAddress = () => { if (!saveForLater) return; const next = { id: `local-${Date.now()}`, label: 'home', fullName: form.fullName, phone: form.phone, line1: form.address, line2: '', city: form.city, postalCode: form.postalCode, isDefault: true }; const current = JSON.parse(localStorage.getItem(LOCAL_ADDRESSES_KEY) || '[]'); localStorage.setItem(LOCAL_ADDRESSES_KEY, JSON.stringify([next, ...current.filter((address) => address.postalCode !== next.postalCode || address.line1 !== next.line1)])); };
  const placeOrder = (event) => { event.preventDefault(); if (!selectedSavedAddress && Object.values(form).some((value) => !value.trim())) return; persistNewAddress(); setPlaced(true); };

  if (placed) return <div className="sf-checkout-success"><h1>{t('checkout.success')}</h1><Link to="/shop">{t('cart.continueShopping')}</Link></div>;
  return <div className="sf-checkout-page"><header className="sf-checkout-header"><button type="button" onClick={() => navigate('/cart')} aria-label={t('checkout.backToCart')}>‹</button><h1>{t('checkout.title')}</h1></header><form className="sf-checkout-layout" onSubmit={placeOrder}><main className="sf-checkout-form">{savedAddresses.length > 0 && <fieldset><legend>{t('checkout.savedAddresses')}</legend><div className="sf-saved-addresses">{savedAddresses.map((address) => <button type="button" key={address.id} className={selectedAddress === address.id ? 'is-selected' : ''} onClick={() => selectSavedAddress(address)}><strong>{t(`addresses.labels.${address.label}`, { defaultValue: address.label })}</strong>{address.isDefault && <small>{t('addresses.defaultBadge')}</small>}<span>{address.fullName}</span><span>{address.line1}, {address.city}, {address.postalCode}</span></button>)}<button type="button" className={selectedAddress === 'new' ? 'is-selected' : ''} onClick={() => setSelectedAddress('new')}>{t('checkout.useNewAddress')}</button></div></fieldset>}{!selectedSavedAddress && <fieldset><legend>{t('checkout.deliveryAddress')}</legend><label>{t('checkout.fullName')}<input required value={form.fullName} onChange={(event) => update('fullName', event.target.value)} /></label><label>{t('checkout.phone')}<input required type="tel" value={form.phone} onChange={(event) => update('phone', event.target.value)} /></label><label>{t('checkout.address')}<input required value={form.address} onChange={(event) => update('address', event.target.value)} /></label><div className="sf-checkout-fields"><label>{t('checkout.city')}<input required value={form.city} onChange={(event) => update('city', event.target.value)} /></label><label>{t('checkout.postalCode')}<input required value={form.postalCode} onChange={(event) => update('postalCode', event.target.value)} /></label></div><label className="sf-save-address"><input type="checkbox" checked={saveForLater} onChange={(event) => setSaveForLater(event.target.checked)} />{t('checkout.saveForLater')}</label></fieldset>}<fieldset><legend>{t('checkout.payment')}</legend><label className="sf-payment-option"><input type="radio" name="payment" value="cash" checked={payment === 'cash'} onChange={() => setPayment('cash')} />{t('checkout.cash')}</label><label className="sf-payment-option"><input type="radio" name="payment" value="online" checked={payment === 'online'} onChange={() => setPayment('online')} />{t('checkout.online')}</label></fieldset></main><aside className="sf-checkout-summary"><h2>{t('checkout.orderSummary')}</h2>{lines.map(({ item, product }) => <div className="sf-checkout-line" key={product.id}><span>{product.name} × {item.quantity || 1}</span><strong>{formatMoney(product.price * (item.quantity || 1), settings)}</strong></div>)}<div className="sf-checkout-total"><span>{t('cart.total')}</span><strong>{formatMoney(total, settings)}</strong></div><button type="submit" className="sf-place-order">{t('checkout.placeOrder')}</button></aside></form></div>;
}

export default CheckoutPage;
