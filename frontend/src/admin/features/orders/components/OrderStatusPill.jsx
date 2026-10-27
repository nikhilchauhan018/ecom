import Icon from '../../../components/ui/Icon';
import Pill from '../../../components/ui/Pill';
import { ORDER_STATUSES } from '../orderStatus';

export default function OrderStatusPill({ status }) {
  const definition = ORDER_STATUSES[status] ?? ORDER_STATUSES.pending;
  return <Pill tone={definition.tone}><span className="tw-inline-flex tw-items-center tw-gap-1"><Icon name={definition.icon} size={13} />{definition.label}</span></Pill>;
}
