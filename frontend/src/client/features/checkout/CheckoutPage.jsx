import React, { useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { Link } from 'react-router-dom';
import { getProductsByIds } from '../../services/catalog.js';
import { listAddresses, saveAddress } from '../../services/account';
import { cartStore } from '../../stores/cartStore';
import { useAuth } from '../../hooks/useAuth';
import { useSettings } from '../../hooks/useSettings';
import { useT } from '../../hooks/useT';
import { ROUTES } from '../../config/constants';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { Notice } from '../../components/ui/Notice';
import { AddAddressDialog } from './components/AddAddressDialog';
import { ChoiceCard } from './components/ChoiceCard';
import { OrderSummary } from './components/OrderSummary';
import {
  buildLines,
  calculateTotals,
  formatCheckoutAddress,
  formatCheckoutPhone,
  mergeAddresses,
  resolveSelectedId,
} from './checkoutUtils.js';
import { addLocalAddress, readLocalAddresses, updateLocalAddress } from './localAddresses.js';
import '../../styles/checkout.css';

/**
 * Checkout preview. Address validation and persistence use the existing account flows;
 * an order or payment is never reported as successful without backend support.
 */
export function CheckoutPage() {
  const settings = useSettings();
  const { t } = useT();
  const { isAuthenticated, status: authStatus } = useAuth();

  const items = useSyncExternalStore(cartStore.subscribe, cartStore.getSnapshot, cartStore.getServerSnapshot);
  const [catalog, setCatalog] = useState({ items: null, products: [], error: false });
  const [catalogRetry, setCatalogRetry] = useState(0);
  useEffect(() => {
    let active = true;
    getProductsByIds(items.map((item) => item.id))
      .then((products) => { if (active) setCatalog({ items, products, error: false }); })
      .catch(() => { if (active) setCatalog({ items, products: [], error: true }); });
    return () => { active = false; };
  }, [items, catalogRetry]);

  const productsReady = catalog.items === items;
  const lines = useMemo(() => buildLines(items, catalog.products), [items, catalog.products]);
  const totals = useMemo(() => calculateTotals(lines), [lines]);
  const hasUnavailableItems = productsReady && lines.length < items.length;

  const [addresses, setAddresses] = useState([]);
  const [addressStatus, setAddressStatus] = useState('loading');
  const [reloadKey, setReloadKey] = useState(0);
  useEffect(() => {
    if (authStatus === 'loading') return undefined;
    const local = readLocalAddresses();
    if (!isAuthenticated) {
      setAddresses(local);
      setAddressStatus('ready');
      return undefined;
    }

    let active = true;
    setAddressStatus('loading');
    listAddresses()
      .then((account) => {
        if (active) {
          setAddresses(mergeAddresses(account, local));
          setAddressStatus('ready');
        }
      })
      .catch(() => {
        if (active) {
          setAddresses(local);
          setAddressStatus('error');
        }
      });
    return () => { active = false; };
  }, [isAuthenticated, authStatus, reloadKey]);

  const [selectedId, setSelectedId] = useState(null);
  const activeId = resolveSelectedId(addresses, selectedId);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [addressDraft, setAddressDraft] = useState(null);
  const [payment, setPayment] = useState('cash');
  const [notice, setNotice] = useState(null);

  const chooseAddress = (id) => { setSelectedId(id); setNotice(null); };
  const choosePayment = (method) => { setPayment(method); setNotice(null); };

  const openAddressDialog = (address = null) => {
    setAddressDraft(address);
    setDialogOpen(true);
  };
  const closeAddressDialog = () => {
    setDialogOpen(false);
    setAddressDraft(null);
  };

  const handleSaveAddress = async (values) => {
    let savedAddress;
    if (isAuthenticated) {
      savedAddress = await saveAddress(values, addressDraft?.id);
      try {
        setAddresses(mergeAddresses(await listAddresses(), readLocalAddresses()));
      } catch {
        setAddresses((current) => (
          addressDraft
            ? current.map((address) => (address.id === savedAddress.id ? savedAddress : address))
            : [...current, savedAddress]
        ));
      }
    } else if (addressDraft) {
      savedAddress = updateLocalAddress(addressDraft.id, values);
      setAddresses((current) => current.map((address) => (address.id === savedAddress.id ? savedAddress : address)));
    } else {
      savedAddress = addLocalAddress(values);
      setAddresses((current) => [
        ...(savedAddress.isDefault ? current.map((address) => ({ ...address, isDefault: false })) : current),
        savedAddress,
      ]);
    }
    setSelectedId(savedAddress.id);
    setNotice(null);
    closeAddressDialog();
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!lines.length) return;
    if (!activeId) {
      setNotice({ tone: 'error', text: t('checkout.addressRequired') });
      return;
    }
    setNotice({
      tone: 'warning',
      text: payment === 'online' ? t('checkout.onlineUnavailable') : t('checkout.demoNotice'),
    });
  };

  const updateQuantity = (id, quantity) => {
    if (quantity >= 1) cartStore.updateQuantity(id, quantity);
  };

  if (!productsReady) {
    return <div className="sf-checkout-page"><p role="status" className="sf-checkout-hint">{t('common.loading')}</p></div>;
  }

  if (catalog.error) {
    return (
      <div className="sf-checkout-page">
        <h1 className="sf-checkout-title">{t('checkout.title')}</h1>
        <Notice tone="error" className="sf-checkout-notice">
          <span>{t('checkout.productsError')}</span>{' '}
          <Button variant="outline" size="sm" onClick={() => setCatalogRetry((key) => key + 1)}>{t('common.retry')}</Button>
        </Notice>
      </div>
    );
  }

  if (!lines.length) {
    return (
      <div className="sf-checkout-page">
        <h1 className="sf-checkout-title">{t('checkout.title')}</h1>
        <EmptyState
          icon="package"
          title={t('cart.emptyTitle')}
          body={hasUnavailableItems ? t('checkout.unavailableItems') : t('cart.emptyBody')}
          actionLabel={t('cart.continueShopping')}
          actionTo={ROUTES.SHOP}
        />
      </div>
    );
  }

  return (
    <div className="sf-checkout-page">
      <header className="sf-checkout-header">
        <div>
          <p className="sf-checkout-eyebrow">{t('checkout.eyebrow')}</p>
          <h1 className="sf-checkout-title">{t('checkout.title')}</h1>
        </div>
        <p className="sf-checkout-secure"><span aria-hidden="true">✓</span> {t('checkout.secureNote')}</p>
      </header>

      <nav className="sf-checkout-progress" aria-label={t('checkout.progressLabel')}>
        <ol>
          <li className="is-complete">
            <Link to={ROUTES.CART}>
              <span className="sf-progress-dot">✓</span><span>{t('checkout.stepCart')}</span>
            </Link>
          </li>
          <li className={activeId ? 'is-complete' : 'is-current'} aria-current={!activeId ? 'step' : undefined}>
            <span className="sf-progress-content">
              <span className="sf-progress-dot">{activeId ? '✓' : '2'}</span>
              <span>{t('checkout.stepAddress')}</span>
            </span>
          </li>
          <li className={activeId ? 'is-current' : ''} aria-current={activeId ? 'step' : undefined}>
            <span className="sf-progress-content">
              <span className="sf-progress-dot">3</span>
              <span>{t('checkout.stepPayment')}</span>
            </span>
          </li>
        </ol>
      </nav>

      <form className="sf-checkout-layout" onSubmit={handleSubmit} noValidate>
        <div className="sf-checkout-main">
          <fieldset className="sf-checkout-section">
            <legend><span className="sf-section-step">1</span>{t('checkout.deliveryAddress')}</legend>
            <p className="sf-checkout-section-hint">{t('checkout.addressHint')}</p>
            {addressStatus === 'loading' && (
              <p role="status" className="sf-checkout-hint">{t('checkout.loadingAddresses')}</p>
            )}
            {addressStatus === 'error' && (
              <Notice tone="error" className="sf-checkout-notice">
                <span>{t('checkout.addressesError')}</span>{' '}
                <Button variant="outline" size="sm" onClick={() => setReloadKey((key) => key + 1)}>
                  {t('common.retry')}
                </Button>
              </Notice>
            )}
            <div className="sf-choice-list">
              {addresses.map((address) => (
                <ChoiceCard
                  key={address.id}
                  name="address"
                  value={address.id}
                  checked={activeId === address.id}
                  onChange={() => chooseAddress(address.id)}
                >
                  <span className="sf-choice-title">
                    {address.fullName}
                    <span className="sf-choice-tag">{t(`addresses.labels.${address.label}`)}</span>
                    {address.isDefault && <span className="sf-choice-tag is-faint">{t('addresses.defaultBadge')}</span>}
                  </span>
                  <span className="sf-choice-line">{formatCheckoutAddress(address)}</span>
                  <span className="sf-choice-line">{t('checkout.mobile', { phone: formatCheckoutPhone(address.phone) })}</span>
                </ChoiceCard>
              ))}
              <ChoiceCard
                dashed
                name="address"
                value="new"
                checked={dialogOpen && !addressDraft}
                onChange={() => openAddressDialog()}
              >
                <span className="sf-choice-title">{t('checkout.addNewAddress')}</span>
                <span className="sf-choice-line">{t('checkout.addNewAddressHint')}</span>
              </ChoiceCard>
            </div>
            {activeId && (
              <Button
                variant="ghost"
                size="sm"
                className="sf-checkout-edit-address"
                onClick={() => openAddressDialog(addresses.find((address) => address.id === activeId))}
              >
                {t('checkout.editSelectedAddress')}
              </Button>
            )}
          </fieldset>

          <fieldset className="sf-checkout-section">
            <legend><span className="sf-section-step">2</span>{t('checkout.payment')}</legend>
            <p className="sf-checkout-section-hint">{t('checkout.paymentHint')}</p>
            <div className="sf-choice-list">
              <ChoiceCard name="payment" value="cash" checked={payment === 'cash'} onChange={() => choosePayment('cash')}>
                <span className="sf-choice-title">{t('checkout.cash')}</span>
                <span className="sf-choice-line">{t('checkout.cashHint')}</span>
              </ChoiceCard>
              <ChoiceCard name="payment" value="online" checked={payment === 'online'} onChange={() => choosePayment('online')}>
                <span className="sf-choice-title">{t('checkout.online')}</span>
                <span className="sf-choice-line">{t('checkout.onlineHint')}</span>
              </ChoiceCard>
            </div>
          </fieldset>
        </div>

        <aside className="sf-checkout-side">
          {hasUnavailableItems && (
            <Notice tone="warning" className="sf-checkout-notice">{t('checkout.unavailableItems')}</Notice>
          )}
          <OrderSummary
            lines={lines}
            total={totals.total}
            itemCount={totals.itemCount}
            settings={settings}
            onQuantityChange={updateQuantity}
            onRemove={(id) => cartStore.removeItem(id)}
          />
          {notice && <Notice tone={notice.tone} className="sf-checkout-notice">{notice.text}</Notice>}
          <button type="submit" className="sf-place-order">{t('checkout.placeOrder')}</button>
          <p className="sf-checkout-preview-note">{t('checkout.previewOnly')}</p>
          <Link className="sf-checkout-back" to={ROUTES.CART}>{t('checkout.backToCart')}</Link>
        </aside>
      </form>

      <AddAddressDialog
        open={dialogOpen}
        onClose={closeAddressDialog}
        onSubmit={handleSaveAddress}
        initial={addressDraft || undefined}
        editing={Boolean(addressDraft)}
      />
    </div>
  );
}

export default CheckoutPage;
