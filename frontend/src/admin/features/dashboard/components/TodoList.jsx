import Card from '../../../components/ui/Card';

export default function TodoList({ items }) {
  return (
    <Card title="To do today">
      {items.map((t, i) => (
        <div key={t.label} className={`tw-flex tw-justify-between tw-py-[11px] ${i ? 'tw-border-0 tw-border-t tw-border-solid tw-border-hair' : ''}`}>
          <span>{t.label}</span><b>{t.count}</b>
        </div>
      ))}
    </Card>
  );
}
