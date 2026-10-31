import Card from '../../../components/ui/Card';

export default function TodoList({ items }) {
  return (
    <Card title="To do today">
      {items.map((t, i) => (
        <div key={t.label} className={`tw-flex tw-items-center tw-justify-between tw-gap-3 tw-py-[11px] ${i ? 'tw-border-0 tw-border-t tw-border-solid tw-border-hair' : ''}`}>
          <span className="tw-text-ink">{t.label}</span>
          <span className="tw-grid tw-h-7 tw-min-w-7 tw-place-items-center tw-rounded-full tw-bg-[#edf6f2] tw-px-2 tw-text-[12px] tw-font-semibold tw-text-brand-dark">{t.count}</span>
        </div>
      ))}
    </Card>
  );
}
