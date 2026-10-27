import Badge from 'react-bootstrap/Badge';

const TONES = {
  ok: 'tw-bg-[var(--c-success-bg)] tw-text-[var(--c-success-ink)]',
  wait: 'tw-bg-[var(--c-warning-bg)] tw-text-[var(--c-warning-ink)]',
  bad: 'tw-bg-[var(--c-danger-bg)] tw-text-[var(--c-danger-ink)]',
};

export default function Pill({ tone = 'ok', children }) {
  return (
    <Badge pill bg="" className={`tw-px-[10px] tw-py-[3px] tw-text-xs tw-font-medium ${TONES[tone]}`}>
      {children}
    </Badge>
  );
}
