import { useLocation } from 'react-router-dom';
import Card from '../../components/ui/Card';

const titleOf = (path) => path.split('/').filter(Boolean).pop()?.replace(/-/g, ' ') ?? '';

export default function ComingSoonPage() {
  const title = titleOf(useLocation().pathname); // rendered as text only (React escapes it)
  return (
    <Card>
      <h1 className="tw-m-0 tw-text-[26px] tw-font-semibold tw-capitalize">{title}</h1>
      <p className="tw-mt-1 tw-text-muted">This section is not built yet.</p>
    </Card>
  );
}
