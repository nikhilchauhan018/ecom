import Card from '../../../components/ui/Card';

export default function SalesChart({ data }) {
  const top = data.reduce((a, b) => (b.pct > a.pct ? b : a));

  return (
    <Card title="Sales by day">
      <div className="tw-mb-4 tw-flex tw-items-center tw-justify-between tw-text-[12px] tw-text-muted">
        <span>Weekly revenue</span>
        <span className="tw-font-medium tw-text-ink">Peak: {top.day}</span>
      </div>
      <div role="img" aria-label={`Bar chart of daily sales, highest on ${top.day}`} className="tw-flex tw-h-[190px] tw-items-end tw-gap-[12px] tw-rounded-md tw-bg-[#f9f9f7] tw-p-3 tw-pb-2">
        {data.map((d) => (
          <div key={d.day} className="tw-flex tw-h-full tw-flex-1 tw-flex-col tw-items-center tw-justify-end tw-gap-2 tw-text-[11px] tw-text-muted">
            <div className="tw-flex tw-w-full tw-items-end tw-justify-center tw-rounded-t-md tw-bg-gradient-to-t tw-from-[#0f4c3d] tw-to-[#54b996]" style={{ height: `${Math.min(100, Math.max(8, d.pct))}%` }} title={`${d.day}: ${d.pct}%`} />
            <span>{d.day}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
