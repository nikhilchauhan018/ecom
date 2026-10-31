import Card from '../../../components/ui/Card';

export default function TopCategories({ items }) {
  return (
    <Card title="Top categories">
      {items.map((c, i) => (
        <div key={c.name} className={`tw-flex tw-items-center tw-justify-between tw-gap-3 tw-py-[11px] ${i ? 'tw-border-0 tw-border-t tw-border-solid tw-border-hair' : ''}`}>
          <div className="tw-flex tw-items-center tw-gap-3">
            <span className="tw-grid tw-h-2.5 tw-w-2.5 tw-rounded-full tw-bg-brand" aria-hidden="true" />
            <span>{c.name}</span>
          </div>
          <b>{c.pct}%</b>
        </div>
      ))}
    </Card>
  );
}
