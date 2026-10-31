import Table from 'react-bootstrap/Table';
import Card from '../../../components/ui/Card';
import Pill from '../../../components/ui/Pill';
import { formatMoney } from '../../../utils/formatMoney';

const th = 'tw-text-[11px] tw-font-semibold tw-uppercase tw-tracking-[0.06em] tw-text-muted';
const td = 'tw-whitespace-nowrap tw-align-middle';

export default function RecentOrders({ orders }) {
  return (
    <Card title="Recent orders">
      <Table responsive className="admin-table tw-mb-0 tw-min-w-[560px]">
        <thead>
          <tr>{['#', 'Customer', 'Items', 'Total', 'Payment', 'Status'].map((h) => <th key={h} className={th}>{h}</th>)}</tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.id}>
              <td className={td}>#{o.id}</td>
              <td className={td}>{o.customer}</td>
              <td className={td}>{o.items}</td>
              <td className={td}>{formatMoney(o.total)}</td>
              <td className={td}>{o.payment}</td>
              <td className={td}><Pill tone={o.tone}>{o.status}</Pill></td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Card>
  );
}
