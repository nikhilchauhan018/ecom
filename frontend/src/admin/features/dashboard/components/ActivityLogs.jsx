import Card from '../../../components/ui/Card';
import { site } from '../../../config/site';
import { formatMoney } from '../../../utils/formatMoney';

export default function ActivityLogs({ items }) {
  return (
    <Card title="Activity logs">
      {items.map((a, i) => {
        const owner = a.actor === 'owner';
        return (
          <div key={i} className={`tw-grid tw-grid-cols-[40px_1fr] tw-gap-3 tw-py-[14px] ${i ? 'tw-border-0 tw-border-t tw-border-solid tw-border-hair' : ''}`}>
            <div className={`tw-grid tw-h-10 tw-w-10 tw-place-items-center tw-rounded-md tw-font-semibold ${owner ? 'tw-bg-gold tw-text-gold-ink' : 'tw-bg-[#e6e8ee] tw-text-[#4a4c50]'}`}>{owner ? 'O' : 'S'}</div>
            <div>
              {owner ? <a href="#" className="link-brand">{site.owner.name}</a> : <b>System</b>} {a.text} {a.amount !== undefined && formatMoney(a.amount)}{' '}
              {a.ref && <a href="#" className="link-brand">{a.ref}</a>}
              <br /><small className="tw-text-[13px] tw-text-muted">{a.when}</small>
            </div>
          </div>
        );
      })}
      <p className="tw-mb-0 tw-mt-3 tw-text-[13px] tw-text-muted">Showing 1 to {items.length} of {items.length} records</p>
    </Card>
  );
}
