import React from 'react';
import { useT } from '../../../hooks/useT';
import { formatMoney } from '../../../utils/formatMoney';
import { Image } from '../../../components/ui/Image';
import { Icon } from '../../../components/ui/Icon';

/**
 * Order summary with live cart quantity controls. Delivery and tax remain unpriced until supported.
 * @param {{ lines: { id: string, name: string, quantity: number, lineTotal: number, image?: object, variant?: string }[], total: number, itemCount: number, settings: object, onQuantityChange: (id: string, quantity: number) => void, onRemove: (id: string) => void }} props
 */
export function OrderSummary({ lines, total, itemCount, settings, onQuantityChange, onRemove }) {
  const { t } = useT();
  return (
    <section className="sf-summary" aria-labelledby="sf-summary-title">
      <div className="sf-summary-heading">
        <h2 id="sf-summary-title">{t('checkout.orderSummary')}</h2>
        <span>{t(itemCount === 1 ? 'checkout.itemCountOne' : 'checkout.itemCount', { count: itemCount })}</span>
      </div>
      <ul className="sf-summary-lines">
        {lines.map((line) => (
          <li key={line.id}>
            <Image
              className="sf-summary-image"
              src={line.image?.src}
              alt={line.image?.alt || line.name}
              color={line.image?.color}
              placeholderText=" "
            />
            <div className="sf-summary-product">
              <span className="sf-summary-name">{line.name}</span>
              {line.variant && <span className="sf-summary-variant">{line.variant}</span>}
              <div className="sf-summary-quantity" aria-label={t('cart.quantity', { name: line.name })}>
                <button
                  type="button"
                  aria-label={t('cart.decrease', { name: line.name })}
                  onClick={() => onQuantityChange(line.id, line.quantity - 1)}
                  disabled={line.quantity <= 1}
                >
                  <Icon name="minus" size={14} />
                </button>
                <span aria-live="polite">{line.quantity}</span>
                <button
                  type="button"
                  aria-label={t('cart.increase', { name: line.name })}
                  onClick={() => onQuantityChange(line.id, line.quantity + 1)}
                  disabled={line.quantity >= 10}
                >
                  <Icon name="plus" size={14} />
                </button>
              </div>
            </div>
            <div className="sf-summary-line-end">
              <strong className="sf-summary-price">{formatMoney(line.lineTotal, settings)}</strong>
              <button
                type="button"
                className="sf-summary-remove"
                aria-label={t('cart.remove', { name: line.name })}
                onClick={() => onRemove(line.id)}
              >
                {t('cart.removeShort')}
              </button>
            </div>
          </li>
        ))}
      </ul>
      <dl className="sf-summary-breakdown">
        <div><dt>{t('cart.subtotal')}</dt><dd>{formatMoney(total, settings)}</dd></div>
        <div><dt>{t('cart.delivery')}</dt><dd>{t('checkout.notCalculated')}</dd></div>
        <div><dt>{t('checkout.tax')}</dt><dd>{t('checkout.notCalculated')}</dd></div>
        <div className="sf-summary-total"><dt>{t('cart.total')}</dt><dd>{formatMoney(total, settings)}</dd></div>
      </dl>
      <p className="sf-summary-note">{t('checkout.priceNote')}</p>
    </section>
  );
}

export default OrderSummary;
