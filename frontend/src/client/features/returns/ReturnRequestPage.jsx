import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AccountShell } from '../account/components/AccountShell';
import { AsyncState } from '../../components/ui/AsyncState';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { Field } from '../../components/ui/Field';
import { Icon } from '../../components/ui/Icon';
import { Notice } from '../../components/ui/Notice';
import { createReturn, listOrders, listReturns } from '../../services/account';
import { useResource } from '../../hooks/useResource';
import { useSettings } from '../../hooks/useSettings';
import { useT } from '../../hooks/useT';
import { ROUTES, returnRequestRoute } from '../../config/constants';
import { getErrorMessage } from '../../utils/errors';
import { formatDate } from '../../utils/format';
import { formatMoney } from '../../utils/formatMoney';
import { RETURN_REASONS, getReturnDeadline, isReturnEligible } from '../../utils/orders';
import { LIMITS } from '../../utils/validators';

function ReturnForm({ order, settings }) {
  const { t } = useT();
  const [selected, setSelected] = useState({});
  const [reason, setReason] = useState('');
  const [comment, setComment] = useState('');
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [busy, setBusy] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const refund = order.items.reduce((sum, item) => sum + (selected[item.id] || 0) * item.price, 0);

  const toggleItem = (item, checked) => {
    setErrors((prev) => ({ ...prev, items: undefined }));
    setSelected((prev) => {
      const next = { ...prev };
      if (checked) next[item.id] = item.qty;
      else delete next[item.id];
      return next;
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (busy) return;

    const nextErrors = {};
    if (Object.keys(selected).length === 0) nextErrors.items = t('returns.selectOne');
    if (!RETURN_REASONS.includes(reason)) nextErrors.reason = t('validation.required');
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setBusy(true);
    setFormError('');
    try {
      await createReturn({
        orderId: order.id,
        reason,
        comment,
        items: Object.entries(selected).map(([itemId, qty]) => ({ itemId, qty })),
      });
      setSubmitted(true);
    } catch (error) {
      setFormError(getErrorMessage(t, error));
    } finally {
      setBusy(false);
    }
  };

  if (submitted) {
    return (
      <div className="tw-flex tw-flex-col tw-items-center tw-gap-3 tw-rounded-2xl tw-border tw-border-[var(--c-line)] tw-px-6 tw-py-10 tw-text-center">
        <span className="tw-flex tw-h-14 tw-w-14 tw-items-center tw-justify-center tw-rounded-full tw-bg-[var(--c-success-tint)] tw-text-[var(--c-success)]">
          <Icon name="check" size={26} />
        </span>
        <h2 className="tw-m-0 tw-text-lg tw-font-semibold tw-text-ink">{t('returns.successTitle')}</h2>
        <p role="status" className="tw-m-0 tw-max-w-sm tw-text-sm tw-text-[var(--c-muted)]">{t('returns.successBody')}</p>
        <Link
          to={ROUTES.RETURNS}
          className="touch-target tw-mt-2 tw-rounded-full tw-bg-[var(--brand)] tw-px-6 tw-text-sm tw-font-medium tw-text-[var(--brand-contrast)]"
        >
          {t('returns.title')}
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="tw-flex tw-flex-col tw-gap-5 tw-rounded-2xl tw-border tw-border-[var(--c-line)] tw-p-4 lg:tw-p-6">
      <p className="tw-m-0 tw-text-sm tw-text-[var(--c-muted)]">
        {t('returns.orderRef', { id: order.id })} · {t('orders.returnBy', { date: formatDate(getReturnDeadline(order), settings.locale) })}
      </p>

      <fieldset className="tw-m-0 tw-min-w-0 tw-border-0 tw-p-0">
        <legend className="tw-mb-2 tw-w-auto tw-p-0 tw-text-[13px] tw-font-medium tw-text-ink">{t('returns.selectItems')}</legend>
        <ul className="tw-m-0 tw-list-none tw-overflow-hidden tw-rounded-xl tw-border tw-border-[var(--c-line)] tw-p-0 tw-divide-y tw-divide-[var(--c-hair)]">
          {order.items.map((item) => {
            const checked = item.id in selected;
            return (
              <li key={item.id}>
                <label className="tw-m-0 tw-flex tw-cursor-pointer tw-items-center tw-gap-3 tw-px-3 tw-py-3">
                  <input type="checkbox" checked={checked} onChange={(event) => toggleItem(item, event.target.checked)} className="tw-h-4 tw-w-4" />
                  <span aria-hidden="true" className="tw-h-10 tw-w-10 tw-shrink-0 tw-rounded-lg" style={{ backgroundColor: item.color }} />
                  <span className="tw-min-w-0 tw-flex-1">
                    <span className="tw-block tw-truncate tw-text-sm tw-font-medium tw-text-ink">{item.name}</span>
                    <span className="tw-block tw-text-xs tw-text-[var(--c-muted)]">{item.variant}</span>
                  </span>
                  {checked && item.qty > 1 ? (
                    <select
                      aria-label={`${t('returns.selectItems')}: ${item.name}`}
                      value={selected[item.id]}
                      onChange={(event) => setSelected((prev) => ({ ...prev, [item.id]: Number(event.target.value) }))}
                      className="tw-h-9 tw-rounded-lg tw-border tw-border-[var(--c-line)] tw-bg-[var(--c-page)] tw-px-2 tw-text-sm"
                    >
                      {Array.from({ length: item.qty }, (_, index) => index + 1).map((qty) => (
                        <option key={qty} value={qty}>
                          {qty}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <span className="tw-text-sm tw-font-semibold tw-text-ink">{formatMoney(item.price, settings)}</span>
                  )}
                </label>
              </li>
            );
          })}
        </ul>
        {errors.items && (
          <p role="alert" className="tw-m-0 tw-mt-1.5 tw-text-xs tw-font-medium tw-text-[var(--c-danger)]">
            {errors.items}
          </p>
        )}
      </fieldset>

      <Field
        as="select"
        label={t('returns.reason')}
        name="reason"
        value={reason}
        onChange={(event) => {
          setReason(event.target.value);
          setErrors((prev) => ({ ...prev, reason: undefined }));
        }}
        error={errors.reason}
        required
      >
        <option value="">{t('returns.reasonPlaceholder')}</option>
        {RETURN_REASONS.map((value) => (
          <option key={value} value={value}>
            {t(`returns.reasons.${value}`)}
          </option>
        ))}
      </Field>

      <Field
        as="textarea"
        label={t('returns.comment')}
        name="comment"
        hint={`${t('returns.commentHint')} (${comment.length}/${LIMITS.comment})`}
        maxLength={LIMITS.comment}
        value={comment}
        onChange={(event) => setComment(event.target.value)}
      />

      <div className="tw-flex tw-items-center tw-justify-between tw-text-sm">
        <span className="tw-text-[var(--c-muted)]">{t('returns.refund')}</span>
        <strong className="tw-text-ink">{formatMoney(refund, settings) || formatMoney(0, settings)}</strong>
      </div>

      {formError && <Notice tone="error">{formError}</Notice>}

      <Button type="submit" size="lg" fullWidth loading={busy}>
        {t('returns.submit')}
      </Button>
    </form>
  );
}

function OrderPicker({ orders, settings }) {
  const { t } = useT();

  return (
    <ul className="tw-m-0 tw-grid tw-list-none tw-gap-3 tw-p-0">
      {orders.map((order) => (
        <li key={order.id}>
          <Link
            to={returnRequestRoute(order.id)}
            className="tw-flex tw-items-center tw-justify-between tw-gap-3 tw-rounded-2xl tw-border tw-border-[var(--c-line)] tw-p-4 tw-text-ink hover:tw-bg-[var(--c-card)]"
          >
            <span>
              <span className="tw-block tw-font-semibold">{t('returns.orderRef', { id: order.id })}</span>
              <span className="tw-block tw-text-xs tw-text-[var(--c-muted)]">
                {t('orders.returnBy', { date: formatDate(getReturnDeadline(order), settings.locale) })}
              </span>
            </span>
            <Icon name="chevron-right" size={18} className="tw-text-[var(--c-muted)]" />
          </Link>
        </li>
      ))}
    </ul>
  );
}

/** `/returns/new?order=ID`. Eligibility is re-checked by the server on submit. */
export function ReturnRequestPage() {
  const { t } = useT();
  const settings = useSettings();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('order');

  const { data, loading, error, reload } = useResource(async () => {
    const [orders, returns] = await Promise.all([listOrders(), listReturns()]);
    return orders.filter((order) => isReturnEligible(order, returns));
  }, []);

  const order = orderId && data ? data.find((item) => item.id === orderId) : null;

  return (
    <AccountShell title={t('returns.requestTitle')} fallbackTo={ROUTES.RETURNS} desktopBackTo={ROUTES.RETURNS}>
      <AsyncState loading={loading} error={error} onRetry={reload}>
        {data && data.length === 0 && <EmptyState icon="undo" title={t('returns.noEligible')} />}
        {data && data.length > 0 && orderId && !order && <Notice tone="error">{t('errors.not_returnable')}</Notice>}
        {data && data.length > 0 && !orderId && <OrderPicker orders={data} settings={settings} />}
        {order && <ReturnForm order={order} settings={settings} />}
      </AsyncState>
    </AccountShell>
  );
}

export default ReturnRequestPage;
