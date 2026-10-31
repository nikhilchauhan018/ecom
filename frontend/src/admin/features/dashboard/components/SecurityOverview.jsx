import Card from '../../../components/ui/Card';
import Pill from '../../../components/ui/Pill';

function Row({ row, first }) {
  return (
    <div className={`tw-flex tw-items-center tw-justify-between tw-gap-3 tw-py-3 ${first ? '' : 'tw-border-0 tw-border-t tw-border-solid tw-border-hair'}`}>
      <span className="tw-text-ink">{row.label}</span>
      {row.kind === 'switch' && (
        <span role="img" aria-label="On" className="tw-relative tw-h-6 tw-w-10 tw-rounded-full tw-bg-brand-chart">
          <span className="tw-absolute tw-right-[3px] tw-top-[3px] tw-h-[18px] tw-w-[18px] tw-rounded-full tw-bg-white" />
        </span>
      )}
      {row.kind === 'pill' && <Pill tone="ok">{row.value}</Pill>}
      {row.meta && <span className="tw-text-[12px] tw-text-muted">{row.meta}</span>}
    </div>
  );
}

export default function SecurityOverview({ data }) {
  const cols = [['Access', data.access], ['Protection', data.protection], ['Audit log', data.audit]];

  return (
    <section aria-label="Security">
      <div className="tw-mb-[14px] tw-flex tw-items-center tw-gap-2">
        <h2 className="tw-text-[15px] tw-font-semibold">Security</h2>
        <span className="tw-rounded-full tw-bg-page tw-px-2 tw-py-0.5 tw-text-[11px] tw-font-medium tw-text-muted">Demo data</span>
      </div>
      <div className="tw-grid tw-grid-cols-1 tw-gap-4 lg:tw-grid-cols-3">
        {cols.map(([title, rows]) => (
          <Card key={title} title={title}>
            {rows.map((r, i) => <Row key={`${title}-${r.label}`} row={r} first={!i} />)}
          </Card>
        ))}
      </div>
    </section>
  );
}
