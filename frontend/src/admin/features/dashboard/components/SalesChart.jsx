import Card from '../../../components/ui/Card';

export default function SalesChart({ data }) {
  const top = data.reduce((a, b) => (b.pct > a.pct ? b : a));
  return (
    <Card title="Sales by day">
      <div role="img" aria-label={`Bar chart of daily sales, highest on ${top.day}`} className="tw-flex tw-h-[180px] tw-items-end tw-gap-[14px]">
        {data.map((d) => (
          <div key={d.day} className="tw-flex tw-h-full tw-flex-1 tw-flex-col tw-items-center tw-justify-end tw-gap-2 tw-text-xs tw-text-muted">
            <i className="tw-block tw-w-full tw-rounded-t-md tw-bg-brand-chart" style={{ height: `${Math.min(100, Math.max(0, d.pct))}%` }} />
            {d.day}
          </div>
        ))}
      </div>
    </Card>
  );
}
