import Badge from 'react-bootstrap/Badge';

const TONES = {
  ok: 'tw-bg-[#e1f3ea] tw-text-[#14573f]',
  wait: 'tw-bg-[#fbefd5] tw-text-[#6b4a00]',
  bad: 'tw-bg-[#fbe4e1] tw-text-[#8a2217]',
};

export default function Pill({ tone = 'ok', children }) {
  return (
    <Badge pill bg="" className={`tw-px-[10px] tw-py-[3px] tw-text-xs tw-font-medium ${TONES[tone]}`}>
      {children}
    </Badge>
  );
}
