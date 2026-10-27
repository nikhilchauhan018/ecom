import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Card from '../../components/ui/Card';
import { formatMoney } from '../../utils/formatMoney';
import {
  adjustStock,
  bulkUpdateInventory,
  getInventoryCategories,
  getInventorySettings,
  getInventorySummary,
  getInventoryVariantIds,
  getStockMovements,
  importInventory,
  listInventory,
  updateInventorySettings,
} from '../../services/api/inventory';
import {
  exportInventoryCsv,
  parseInventoryCsv,
  STOCK_ADJUSTMENT_REASONS,
  validateInventoryImport,
} from './inventoryUtils';

const STATUS_LABELS = {
  in_stock: 'In stock',
  low: 'Low stock',
  out_of_stock: 'Out of stock',
  backorder: 'Backorder',
};

const DEFAULT_SUMMARY = {
  totalSkus: 0,
  lowStockCount: 0,
  outOfStockCount: 0,
  inventoryValue: 0,
};

const DEFAULT_SETTINGS = {
  lowStockThreshold: 5,
  allowBackorders: false,
};

const DEFAULT_ADJUSTMENT = {
  mode: 'delta',
  value: '',
  reason: 'received',
  note: '',
};

function downloadCsv(rows) {
  const url = URL.createObjectURL(new Blob([exportInventoryCsv(rows)], { type: 'text/csv;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = 'inventory.csv';
  link.click();
  URL.revokeObjectURL(url);
}

function SummaryCards({ summary }) {
  const cards = [
    ['Total SKUs', summary.totalSkus],
    ['Low stock', summary.lowStockCount],
    ['Out of stock', summary.outOfStockCount],
    ['Inventory value', formatMoney(summary.inventoryValue)],
  ];

  return (
    <div className="tw-grid tw-gap-4 sm:tw-grid-cols-2 lg:tw-grid-cols-4">
      {cards.map(([label, value]) => (
        <Card title={label} key={label}>
          <strong className="tw-text-2xl">{value}</strong>
        </Card>
      ))}
    </div>
  );
}

function InventoryFilters({ search, status, category, categories, onQueryChange, onExport, onImport, hasRows }) {
  return (
    <div className="tw-flex tw-flex-wrap tw-gap-3">
      <label className="tw-flex-1">
        <span className="visually-hidden">Search inventory</span>
        <input
          className="form-control tw-h-11"
          value={search}
          onChange={(event) => onQueryChange('search', event.target.value)}
          placeholder="Search product, variant or SKU..."
        />
      </label>
      <select className="form-select tw-h-11 tw-max-w-[200px]" aria-label="Filter inventory status" value={status} onChange={(event) => onQueryChange('status', event.target.value)}>
        <option value="">All statuses</option>
        {Object.entries(STATUS_LABELS).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
      </select>
      <select className="form-select tw-h-11 tw-max-w-[200px]" aria-label="Filter inventory category" value={category} onChange={(event) => onQueryChange('category', event.target.value)}>
        <option value="">All categories</option>
        {categories.map((item) => <option key={item} value={item}>{item}</option>)}
      </select>
      <button type="button" className="btn btn-outline-secondary" onClick={onExport} disabled={!hasRows}>Export CSV</button>
      <label className="btn btn-outline-secondary mb-0">
        Import CSV
        <input type="file" accept=".csv,text/csv" className="tw-hidden" onChange={onImport} />
      </label>
    </div>
  );
}

function BulkThresholdBar({ count, value, onChange, onApply }) {
  if (!count) return null;
  return (
    <div className="tw-mt-4 tw-flex tw-flex-wrap tw-items-end tw-gap-3 tw-rounded-lg tw-bg-page tw-p-3">
      <label>
        Set threshold
        <input type="number" min="0" className="form-control" value={value} onChange={(event) => onChange(event.target.value)} />
      </label>
      <button type="button" className="btn btn-primary" onClick={onApply} disabled={value === ''}>Apply to {count} selected</button>
    </div>
  );
}

function InventoryTable({ rows, selected, onToggleAll, onToggle, onAdjust, loading }) {
  if (loading) return <div role="status" aria-label="Loading inventory" className="tw-mt-5 tw-h-48 tw-animate-pulse tw-rounded tw-bg-page" />;

  return (
    <div className="tw-overflow-x-auto">
      <table className="admin-table tw-mt-5 tw-min-w-[1100px]">
        <caption className="visually-hidden">Product inventory by variant</caption>
        <thead>
          <tr>
            <th><input type="checkbox" aria-label="Select all inventory rows" checked={rows.length > 0 && selected.length === rows.length} onChange={(event) => onToggleAll(event.target.checked)} /></th>
            {['Product', 'Variant', 'SKU', 'On hand', 'Reserved', 'Available', 'Threshold', 'Status', 'Operations'].map((heading) => <th scope="col" key={heading} className="tw-text-xs tw-uppercase tw-text-muted">{heading}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <td><input type="checkbox" aria-label={`Select ${row.sku}`} checked={selected.includes(row.id)} onChange={() => onToggle(row.id)} /></td>
              <td className="tw-font-medium">{row.productName}</td>
              <td>{row.variant}</td>
              <td className="tw-text-muted">{row.sku}</td>
              <td>{row.onHand}</td>
              <td>{row.reserved}</td>
              <td>{row.available}</td>
              <td>{row.threshold}</td>
              <td><span className={`status-pill status-${row.status}`}>{STATUS_LABELS[row.status]}</span></td>
              <td><button type="button" className="link-brand tw-border-0 tw-bg-transparent tw-p-0" onClick={() => onAdjust(row)}>Adjust stock</button></td>
            </tr>
          ))}
        </tbody>
      </table>
      {!rows.length && <p className="tw-py-8 tw-text-center tw-text-muted">No inventory found.</p>}
    </div>
  );
}

function ImportFeedback({ errors, message, rows, onApply }) {
  return (
    <>
      {errors.length > 0 && <div role="alert" className="tw-mt-4 tw-rounded-lg tw-bg-[var(--c-danger-bg)] tw-p-4 tw-text-[var(--c-danger-ink)]">{errors.map((item) => <div key={`${item.row}-${item.column}`}>Row {item.row}, {item.column}: {item.message}</div>)}</div>}
      {message && <div role="status" className="tw-mt-4 tw-rounded-lg tw-bg-[var(--c-success-bg)] tw-p-4 tw-text-[var(--c-success-ink)]">{message}</div>}
      {rows.length > 0 && <div className="tw-mt-4 tw-flex tw-items-center tw-justify-between tw-rounded-lg tw-bg-page tw-p-3"><span>Ready to import {rows.length} rows.</span><button type="button" className="btn btn-primary" onClick={onApply}>Apply import</button></div>}
    </>
  );
}

function AdjustmentPanel({ row, adjustment, movements, onChange, onSave, onCancel }) {
  if (!row) return null;
  return (
    <Card title={`Adjust ${row.sku}`} className="tw-mt-5">
      <form onSubmit={onSave} className="tw-grid tw-gap-3 sm:tw-grid-cols-2">
        <label>Mode<select className="form-select" value={adjustment.mode} onChange={(event) => onChange({ ...adjustment, mode: event.target.value })}><option value="delta">Increase/decrease</option><option value="set">Set balance</option></select></label>
        <label>{adjustment.mode === 'delta' ? 'Change' : 'Balance'}<input required type="number" className="form-control" value={adjustment.value} onChange={(event) => onChange({ ...adjustment, value: event.target.value })} /></label>
        <label>Reason<select className="form-select" value={adjustment.reason} onChange={(event) => onChange({ ...adjustment, reason: event.target.value })}>{STOCK_ADJUSTMENT_REASONS.map((reason) => <option key={reason} value={reason}>{reason}</option>)}</select></label>
        <label>Note<input className="form-control" value={adjustment.note} onChange={(event) => onChange({ ...adjustment, note: event.target.value })} /></label>
        <div className="tw-flex tw-gap-3 sm:tw-col-span-2"><button type="submit" className="btn btn-primary">Save adjustment</button><button type="button" className="btn btn-outline-secondary" onClick={onCancel}>Cancel</button></div>
      </form>
      {movements.length > 0 && <div className="tw-mt-5 tw-overflow-x-auto"><h3 className="tw-text-base tw-font-semibold">Movement history</h3><table className="admin-table tw-mt-2"><thead><tr><th>Type</th><th>Change</th><th>Balance</th><th>Note</th><th>Date</th></tr></thead><tbody>{movements.map((movement) => <tr key={movement.id}><td>{movement.type}</td><td>{movement.change}</td><td>{movement.balanceAfter}</td><td>{movement.note || '-'}</td><td>{new Date(movement.date).toLocaleString()}</td></tr>)}</tbody></table></div>}
    </Card>
  );
}

function SettingsPanel({ settings, onChange, onSave }) {
  return (
    <Card title="Inventory settings" className="tw-mt-5">
      <form onSubmit={onSave} className="tw-flex tw-flex-wrap tw-items-end tw-gap-3">
        <label>Low-stock threshold<input type="number" min="0" className="form-control" value={settings.lowStockThreshold} onChange={(event) => onChange({ ...settings, lowStockThreshold: event.target.value })} /></label>
        <label className="tw-flex tw-items-center tw-gap-2"><input type="checkbox" checked={settings.allowBackorders} onChange={(event) => onChange({ ...settings, allowBackorders: event.target.checked })} /> Allow backorders</label>
        <button type="submit" className="btn btn-outline-secondary">Save settings</button>
      </form>
    </Card>
  );
}

export default function ProductInventoryPage() {
  const [params, setParams] = useSearchParams();
  const search = params.get('search') || '';
  const status = params.get('status') || '';
  const category = params.get('category') || '';
  const [rows, setRows] = useState([]);
  const [summary, setSummary] = useState(DEFAULT_SUMMARY);
  const [selected, setSelected] = useState([]);
  const [bulkThreshold, setBulkThreshold] = useState('');
  const [categories, setCategories] = useState([]);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [adjusting, setAdjusting] = useState(null);
  const [adjustment, setAdjustment] = useState(DEFAULT_ADJUSTMENT);
  const [movements, setMovements] = useState([]);
  const [importRows, setImportRows] = useState([]);
  const [importErrors, setImportErrors] = useState([]);
  const [importMessage, setImportMessage] = useState('');

  const refresh = useCallback(async () => {
    const [inventory, totals] = await Promise.all([listInventory({ search, status, category }), getInventorySummary()]);
    setRows(inventory.data);
    setSummary(totals);
    setSelected([]);
  }, [category, search, status]);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        await refresh();
      } catch (loadError) {
        if (active) setError(loadError.message || 'Unable to load inventory.');
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => { active = false; };
  }, [refresh]);

  useEffect(() => {
    Promise.all([getInventoryCategories(), getInventorySettings()]).then(([availableCategories, currentSettings]) => { setCategories(availableCategories); setSettings(currentSettings); }).catch((loadError) => setError(loadError.message || 'Unable to load inventory settings.'));
  }, []);

  const setQuery = (key, value) => setParams((current) => { if (value) current.set(key, value); else current.delete(key); return current; });
  const openAdjustment = async (row) => { setAdjusting(row); setAdjustment(DEFAULT_ADJUSTMENT); setMovements(await getStockMovements(row.id)); };
  const saveAdjustment = async (event) => { event.preventDefault(); const result = await adjustStock(adjusting.id, adjustment.mode === 'delta' ? { delta: adjustment.value, reason: adjustment.reason, note: adjustment.note } : { set: adjustment.value, reason: adjustment.reason, note: adjustment.note }); if (!result.updated) { setError(result.error); return; } setAdjusting(null); await refresh(); };
  const applyBulkThreshold = async () => { if (!selected.length || bulkThreshold === '') return; await bulkUpdateInventory(selected.map((variantId) => ({ variantId, threshold: bulkThreshold }))); setBulkThreshold(''); await refresh(); };
  const handleImport = async (event) => { const file = event.target.files?.[0]; if (!file) return; const parsed = parseInventoryCsv(await file.text()); const validIds = await getInventoryVariantIds(); const errors = validateInventoryImport(parsed, new Set(validIds)); setImportErrors(errors); setImportRows(errors.length ? [] : parsed); setImportMessage(''); };
  const applyImport = async () => { const result = await importInventory(importRows); setImportRows([]); setImportMessage(`Imported ${result.updated} row(s).${result.skipped ? ` Skipped ${result.skipped} unknown variant(s).` : ''}`); await refresh(); };
  const saveSettings = async (event) => { event.preventDefault(); const next = await updateInventorySettings(settings); setSettings(next); await refresh(); };

  return (
    <div className="tw-flex tw-flex-col tw-gap-5">
      <header><div className="tw-text-xs tw-uppercase tw-tracking-[0.12em]"><a href="/" className="link-brand">Dashboard</a><span className="tw-mx-2 tw-text-muted">/</span><span className="tw-text-muted">Ecommerce</span></div><h1 className="tw-mt-2 tw-text-2xl tw-font-semibold">Product inventory</h1></header>
      <SummaryCards summary={summary} />
      <Card>
        <InventoryFilters search={search} status={status} category={category} categories={categories} onQueryChange={setQuery} onExport={() => downloadCsv(rows)} onImport={handleImport} hasRows={rows.length > 0} />
        <ImportFeedback errors={importErrors} message={importMessage} rows={importRows} onApply={applyImport} />
        <BulkThresholdBar count={selected.length} value={bulkThreshold} onChange={setBulkThreshold} onApply={applyBulkThreshold} />
        {error && <div role="alert" className="tw-mt-4 tw-rounded-lg tw-bg-[var(--c-danger-bg)] tw-p-4 tw-text-[var(--c-danger-ink)]">{error}</div>}
        <InventoryTable rows={rows} selected={selected} loading={loading} onToggleAll={(checked) => setSelected(checked ? rows.map((row) => row.id) : [])} onToggle={(id) => setSelected((current) => current.includes(id) ? current.filter((value) => value !== id) : [...current, id])} onAdjust={openAdjustment} />
        <AdjustmentPanel row={adjusting} adjustment={adjustment} movements={movements} onChange={setAdjustment} onSave={saveAdjustment} onCancel={() => setAdjusting(null)} />
        <SettingsPanel settings={settings} onChange={setSettings} onSave={saveSettings} />
      </Card>
    </div>
  );
}
