import Card from '../../../components/ui/Card';
import { formatMoney } from '../../../utils/formatMoney';

export default function NotificationsPanel({ items }) {
  return (
    <Card title="Notifications">
      {items.map((n, i) => (
        <div key={`${n.text}-${n.when}`} className={`tw-flex tw-items-start tw-justify-between tw-gap-3 tw-py-3 ${i ? 'tw-border-0 tw-border-t tw-border-solid tw-border-hair' : ''}`}>
          <div className="tw-min-w-0">
            <span className="tw-text-ink">{n.text}</span>
            {n.amount !== undefined && <span className="tw-ml-2 tw-font-medium tw-text-brand">{formatMoney(n.amount)}</span>}
          </div>
          <small className="tw-whitespace-nowrap tw-text-[12px] tw-text-muted">{n.when}</small>
        </div>
      ))}
    </Card>
  );
}
