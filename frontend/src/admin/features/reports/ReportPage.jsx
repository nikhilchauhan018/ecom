import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Icon from '../../components/ui/Icon';
import { LoadError, LoadingBlock } from '../../components/ui/AsyncState';
import { formatMoney } from '../../utils/formatMoney';
import { getSalesReport } from '../../services/api/reports';
import { getStoreSettings } from '../../config/settings';
import { useResource } from '../../hooks/useResource';
import { useQueryState } from '../../hooks/useQueryState';

const QUERY = { range: '30d' };
const NO_REPORT = null;
const RANGE_LABELS = { '7d': 'Last 7 days', '30d': 'Last 30 days', '90d': 'Last 90 days', all: 'All time' };
const settings = getStoreSettings();

function Metric({ label, value, detail, tone = 'brand' }) {
  const tones = {
    brand: 'tw-bg-[var(--c-brand-strong)] tw-text-white',
    light: 'tw-bg-[#e8f4ef] tw-text-[var(--c-brand-strong)]',
    warm: 'tw-bg-[#fbefd5] tw-text-[var(--c-warning-ink)]',
    dark: 'tw-bg-[#22272a] tw-text-white',
  };
  return <div className={`tw-rounded-card tw-p-5 ${tones[tone]}`}><p className="tw-text-sm tw-opacity-80">{label}</p><p className="tw-mt-3 tw-text-3xl tw-font-semibold">{value}</p><p className="tw-mt-2 tw-text-xs tw-opacity-75">{detail}</p></div>;
}

function BarList({ items, valueKey = 'count', formatter = (value) => value }) {
  const maximum = Math.max(...items.map((item) => item[valueKey]), 1);
  return <div className="tw-space-y-4">{items.map((item) => <div key={item.label}><div className="tw-flex tw-justify-between tw-gap-3 tw-text-sm"><span className="tw-truncate">{item.label}</span><strong>{formatter(item[valueKey])}</strong></div><div className="tw-mt-2 tw-h-2 tw-overflow-hidden tw-rounded-full tw-bg-page"><div className="tw-h-full tw-rounded-full tw-bg-brand" style={{ width: `${Math.max(4, item[valueKey] / maximum * 100)}%` }} /></div></div>)}</div>;
}

function exportReport(report) {
  const rows = [
    ['Sales report', RANGE_LABELS[report.range]],
    [],
    ['Metric', 'Value'],
    ['Revenue', report.summary.revenue],
    ['Orders', report.summary.orders],
    ['Average order value', report.summary.averageOrderValue],
    ['Items sold', report.summary.items],
    [],
    ['Top product', 'Units', 'Revenue'],
    ...report.topProducts.map((item) => [item.name, item.units, item.revenue]),
  ];
  const csv = rows.map((row) => row.map((value) => `"${String(value ?? '').replaceAll('"', '""')}"`).join(',')).join('\n');
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = `sales-report-${report.range}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export default function ReportPage() {
  const [query, setQuery] = useQueryState(QUERY);
  const { data: report = NO_REPORT, error, loading, reload } = useResource(getSalesReport, query);
  const chartMaximum = useMemo(() => Math.max(...(report?.dailySales || []).map((item) => item.value), 1), [report]);

  return <div className="tw-flex tw-flex-col tw-gap-5">
    <header className="tw-flex tw-flex-wrap tw-items-end tw-justify-between tw-gap-4">
      <div><div className="tw-text-xs tw-uppercase tw-tracking-[0.12em]"><Link to="/ecommerce" className="link-brand">Dashboard</Link><span className="tw-mx-2 tw-text-muted">/</span><span className="tw-text-muted">Ecommerce</span></div><h1 className="tw-mt-2 tw-text-2xl tw-font-semibold">Sales report</h1><p className="tw-mt-1 tw-text-sm tw-text-muted">Track revenue, order performance, and your best-selling products.</p></div>
      <div className="print-hidden tw-flex tw-flex-wrap tw-gap-2"><select className="form-select tw-h-11 tw-min-w-[150px]" aria-label="Report date range" value={query.range} onChange={(event) => setQuery({ range: event.target.value })}>{Object.entries(RANGE_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select><Button variant="brandOutline" onClick={() => report && exportReport(report)} disabled={!report}><Icon name="download" size={16} /> Export CSV</Button><Button variant="brandOutline" onClick={() => window.print()}>Print</Button></div>
    </header>
    {error ? <LoadError message="Unable to load the sales report." onRetry={reload} /> : loading || !report ? <LoadingBlock label="Loading sales report" className="tw-h-72" /> : <>
      <section aria-label="Report summary" className="tw-grid tw-grid-cols-1 tw-gap-4 sm:tw-grid-cols-2 xl:tw-grid-cols-4">
        <Metric label="Net revenue" value={formatMoney(report.summary.revenue)} detail={RANGE_LABELS[report.range]} />
        <Metric label="Orders" value={report.summary.orders} detail={`${report.summary.items} items sold`} tone="light" />
        <Metric label="Average order value" value={formatMoney(report.summary.averageOrderValue)} detail="Per completed order" tone="warm" />
        <Metric label="Discounts given" value={formatMoney(report.summary.discounts)} detail="Across this period" tone="dark" />
      </section>
      <section className="tw-grid tw-grid-cols-1 tw-gap-5 xl:tw-grid-cols-[2fr_1fr]">
        <Card title="Revenue trend"><div className="tw-mb-5 tw-flex tw-flex-wrap tw-justify-between tw-gap-2 tw-text-xs tw-text-muted"><span>{new Intl.DateTimeFormat(settings.locale).format(new Date(report.startDate))} - {new Intl.DateTimeFormat(settings.locale).format(new Date(report.endDate))}</span><strong className="tw-text-ink">{formatMoney(report.summary.revenue)} total</strong></div><div role="img" aria-label="Revenue trend bar chart" className="tw-flex tw-h-64 tw-items-end tw-gap-1 sm:tw-gap-2">{report.dailySales.map((item) => <div key={item.label} className="tw-flex tw-min-w-0 tw-flex-1 tw-flex-col tw-items-center tw-justify-end tw-gap-2" title={`${item.label}: ${formatMoney(item.value)}`}><div className="tw-w-full tw-rounded-t-md tw-bg-gradient-to-t tw-from-[var(--c-brand-strong)] tw-to-[#59bd9d]" style={{ height: `${Math.max(4, item.value / chartMaximum * 100)}%` }} /><span className="tw-max-w-full tw-truncate tw-text-[10px] tw-text-muted">{item.label}</span></div>)}</div></Card>
        <Card title="Order status"><BarList items={report.statusCounts} /></Card>
      </section>
      <section className="tw-grid tw-grid-cols-1 tw-gap-5 lg:tw-grid-cols-2">
        <Card title="Top products"><div className="tw-overflow-x-auto"><table className="admin-table tw-w-full"><caption className="visually-hidden">Top products by revenue</caption><thead><tr><th scope="col">Product</th><th scope="col">Units</th><th scope="col">Revenue</th></tr></thead><tbody>{report.topProducts.map((item) => <tr key={item.name}><td className="tw-font-medium">{item.name}</td><td>{item.units}</td><td>{formatMoney(item.revenue)}</td></tr>)}</tbody></table></div></Card>
        <Card title="Sales by payment method"><BarList items={report.paymentCounts} /></Card>
      </section>
      <section className="tw-grid tw-grid-cols-1 tw-gap-5 lg:tw-grid-cols-2">
        <Card title="Revenue by category"><BarList items={report.categories} valueKey="value" formatter={formatMoney} /></Card>
        <Card title="Report notes"><div className="tw-space-y-3 tw-text-sm tw-text-muted"><p>Revenue excludes cancelled and returned orders.</p><p>Figures are based on the selected date range and current store data.</p><p>Use Export CSV to continue analysis in a spreadsheet.</p></div></Card>
      </section>
    </>}
  </div>;
}
