import Card from '../../../components/ui/Card';

export default function TopCategories({ items }) {
  return (
    <Card title="Top categories">
      {items.map((c, i) => (
        <div key={c.name} className={`tw-flex tw-justify-between tw-py-[11px] ${i ? 'tw-border-0 tw-border-t tw-border-solid tw-border-hair' : ''}`}>
          <span>{c.name}</span><b>{c.pct}%</b>
        </div>
      ))}
    </Card>
  );
}
