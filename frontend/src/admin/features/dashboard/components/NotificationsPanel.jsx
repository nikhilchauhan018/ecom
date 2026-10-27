import Card from '../../../components/ui/Card';
import { formatMoney } from '../../../utils/formatMoney';

export default function NotificationsPanel({ items }) {
  return (
    <Card title="Notifications">
      {items.map((n, i) => (
        <div key={n.text} className={`tw-flex tw-justify-between tw-gap-3 tw-py-3 ${i ? 'tw-border-0 tw-border-t tw-border-solid tw-border-hair' : ''}`}>
          <span>{n.text} {n.amount !== undefined && formatMoney(n.amount)}</span><small className="tw-whitespace-nowrap tw-text-[13px] tw-text-muted">{n.when}</small>
        </div>
      ))}
    </Card>
  );
}
