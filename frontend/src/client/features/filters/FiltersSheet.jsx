import React, { useEffect, useState } from 'react';
import { useSettings } from '../../hooks/useSettings';
import { searchProducts } from '../../services/catalog.js';
import { currencyAffix, formatMoney, fromMinor, toMinor } from '../../utils/money.js';
import { niceStep } from '../../utils/niceStep.js';
import { useT } from '../../hooks/useT';

const toggle = (values = [], value) => values.includes(value) ? values.filter((item) => item !== value) : [...values, value];

function Section({ title, children, expanded = true }) {
  const [open, setOpen] = useState(expanded);
  const id = `filter-${title.toLowerCase().replace(/\s+/g, '-')}`;
  return <section className="sf-filter-section"><button type="button" className="sf-section-button" aria-expanded={open} aria-controls={id} onClick={() => setOpen(!open)}><strong>{title}</strong><span aria-hidden="true">{open ? '⌃' : '⌄'}</span></button>{open && <div id={id} className="sf-section-content">{children}</div>}</section>;
}

function ChoiceList({ options, selected, onToggle, limit = 0 }) {
  const { t } = useT();
  const [expanded, setExpanded] = useState(false);
  const visible = limit && options.length > limit ? options.slice(0, limit) : options;
  const items = expanded ? options : visible;
  return <div className="sf-choice-list">{items.map((option) => <label className="sf-choice" key={option.value}><input type="checkbox" checked={selected.includes(option.value)} onChange={() => onToggle(option.value)} /><span>{option.label}</span><small>{option.count}</small></label>)}{limit && options.length > limit && <button type="button" className="sf-see-more" onClick={() => setExpanded(!expanded)}>{expanded ? t('filters.seeLess') : t('filters.seeMore')}</button>}</div>;
}

/**
 * Mobile filter dialog and reusable desktop filter content.
 * @param {{open: boolean, draft: object, facets: object, onChange: Function, onApply: Function, onClose: Function, onClear: Function, resultCount: number, asSidebar?: boolean}} props
 */
export function FiltersSheet({ open, draft, facets, onChange, onApply, onClose, onClear, resultCount, asSidebar = false }) {
  const { t } = useT();
  const settings = useSettings();
  const [min, setMin] = useState(draft.price?.[0] ?? facets.price.min);
  const [max, setMax] = useState(draft.price?.[1] ?? facets.price.max);
  const [liveCount, setLiveCount] = useState(resultCount);

  useEffect(() => { setMin(draft.price?.[0] ?? facets.price.min); setMax(draft.price?.[1] ?? facets.price.max); }, [draft.price, facets.price.min, facets.price.max]);

  useEffect(() => {
    if (!open || asSidebar) return undefined;
    const controller = new AbortController();
    const timer = setTimeout(() => searchProducts(draft, { signal: controller.signal }).then((result) => setLiveCount(result.meta.total)).catch(() => {}), 250);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [open, asSidebar, draft, resultCount]);
  useEffect(() => { if (!open || asSidebar) return undefined; const close = (event) => event.key === 'Escape' && onClose(); document.addEventListener('keydown', close); return () => document.removeEventListener('keydown', close); }, [open, asSidebar, onClose]);
  if (!open && !asSidebar) return null;
  const active = facets;
  const range = Math.max(1, active.price.max - active.price.min);
  const rangeStart = `${Math.max(0, Math.min(100, ((min - active.price.min) / range) * 100))}%`;
  const rangeEnd = `${Math.max(0, Math.min(100, ((max - active.price.min) / range) * 100))}%`;
  const updateList = (key, value) => onChange({ ...draft, [key]: toggle(draft[key], value), page: 1 });
  const updatePrice = (nextMin, nextMax) => { const safeMin = Math.min(nextMin, nextMax); const safeMax = Math.max(nextMin, nextMax); setMin(safeMin); setMax(safeMax); onChange({ ...draft, price: [safeMin, safeMax], page: 1 }); };
  const content = <div className="sf-filter-content">
    <div className="sf-applied"><strong>{t('filters.selected')}</strong><button type="button" onClick={onClear}>{t('filters.clear')}</button></div>
    <Section title={t('filters.shopFor')}><div className="sf-chip-grid">{active.gender.map((option) => <button type="button" key={option.value} className={`sf-chip ${draft.gender?.includes(option.value) ? 'is-selected' : ''}`} aria-pressed={draft.gender?.includes(option.value) || false} onClick={() => updateList('gender', option.value)}>{option.label}</button>)}</div></Section>
    <Section title={t('filters.category')}><ChoiceList options={active.categories} selected={draft.category || []} onToggle={(value) => updateList('category', value)} limit={4} /></Section>
    <Section title={t('filters.price')}><div className="sf-range-label"><span>{formatMoney(min, settings)}</span><span>{formatMoney(max, settings)}</span></div><div className="sf-dual-range" style={{ '--range-start': rangeStart, '--range-end': rangeEnd }}><span className="sf-range-track" aria-hidden="true" /><label className="sf-visually-hidden">{t('filters.minimum')}<input type="range" min={active.price.min} max={active.price.max} step={niceStep(active.price.min, active.price.max)} value={min} onChange={(event) => updatePrice(Number(event.target.value), max)} aria-valuetext={formatMoney(min, settings)} /></label><label className="sf-visually-hidden">{t('filters.maximum')}<input type="range" min={active.price.min} max={active.price.max} step={niceStep(active.price.min, active.price.max)} value={max} onChange={(event) => updatePrice(min, Number(event.target.value))} aria-valuetext={formatMoney(max, settings)} /></label></div><div className="sf-price-fields"><label><span>{currencyAffix(settings).value}</span><input value={fromMinor(min, settings.currency)} inputMode="decimal" aria-label={t('filters.minimum')} onChange={(event) => updatePrice(toMinor(event.target.value, settings.currency) || active.price.min, max)} /></label><span aria-hidden="true">to</span><label><span>{currencyAffix(settings).value}</span><input value={fromMinor(max, settings.currency)} inputMode="decimal" aria-label={t('filters.maximum')} onChange={(event) => updatePrice(min, toMinor(event.target.value, settings.currency) || active.price.max)} /></label></div></Section>
    <Section title={t('filters.size')}><div className="sf-chip-grid">{active.sizes.map((option) => <button type="button" key={option.value} className={`sf-chip ${draft.size?.includes(option.value) ? 'is-selected' : ''}`} aria-pressed={draft.size?.includes(option.value) || false} disabled={!option.count} onClick={() => updateList('size', option.value)}>{option.label}</button>)}</div><p className="sf-hint">{t('filters.kidsHint')}</p></Section>
    <Section title={t('filters.colour')}><div className="sf-colors">{active.colors.map((option) => <button type="button" key={option.value} className={`sf-color ${draft.color?.includes(option.value) ? 'is-selected' : ''}`} style={{ '--swatch': option.hex }} aria-pressed={draft.color?.includes(option.value) || false} onClick={() => updateList('color', option.value)}><span aria-hidden="true" />{option.label}</button>)}</div></Section>
    <Section title={t('filters.rating')}><ChoiceList options={active.ratings.map((item) => ({ value: String(item.min), label: t('filters.andUp', { rating: item.min }), count: item.count }))} selected={draft.rating ? [String(draft.rating)] : []} onToggle={(value) => onChange({ ...draft, rating: Number(value), page: 1 })} /></Section>
    <Section title={t('filters.discount')}><div className="sf-chip-grid">{active.discounts.map((option) => <button type="button" key={option.min} className={`sf-chip ${draft.discount === option.min ? 'is-selected' : ''}`} aria-pressed={draft.discount === option.min} onClick={() => onChange({ ...draft, discount: option.min, page: 1 })}>{t('filters.discountPlus', { discount: option.min })}</button>)}</div></Section>
    <Section title={t('filters.fabric')}><div className="sf-chip-grid">{active.fabrics.map((option) => <button type="button" key={option.value} className={`sf-chip ${draft.fabric?.includes(option.value) ? 'is-selected' : ''}`} aria-pressed={draft.fabric?.includes(option.value) || false} onClick={() => updateList('fabric', option.value)}>{option.label}</button>)}</div></Section>
    <Section title={t('filters.inStock')}><label className="sf-switch"><input type="checkbox" role="switch" checked={draft.inStock || false} onChange={(event) => onChange({ ...draft, inStock: event.target.checked, page: 1 })} /><span>{t('filters.inStock')}</span></label></Section>
  </div>;
  if (asSidebar) return <aside className="sf-filter-sidebar" aria-label={t('filters.title')}>{content}</aside>;
  return <div className="sf-sheet-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><div className="sf-filter-sheet" role="dialog" aria-modal="true" aria-labelledby="filters-title"><header className="sf-sheet-header"><button type="button" onClick={onClose} aria-label={t('filters.close')}>×</button><h2 id="filters-title">{t('filters.title')}</h2><button type="button" onClick={onClear}>{t('filters.clear')}</button></header>{content}<p className="sf-live-region" aria-live="polite">{t('filters.countAnnouncement', { count: liveCount })}</p><footer className="sf-filter-footer"><button type="button" className="sf-clear-button" onClick={onClear}>{t('filters.clear')}</button><button type="button" className="sf-apply-button" disabled={!liveCount} onClick={onApply}>{liveCount ? t('filters.showResults', { count: liveCount }) : t('filters.noResults')}</button></footer></div></div>;
}

export default FiltersSheet;