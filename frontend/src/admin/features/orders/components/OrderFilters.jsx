import Form from 'react-bootstrap/Form';
import Button from '../../../components/ui/Button';
import { ORDER_STATUSES, PAYMENT_STATUSES } from '../orderStatus';

export default function OrderFilters({ filters, methods, onChange, onApply, onReset }) {
  return (
    <div className="tw-mt-4 tw-grid tw-grid-cols-1 tw-gap-3 tw-border-0 tw-border-t tw-border-solid tw-border-hair tw-pt-4 sm:tw-grid-cols-2 lg:tw-grid-cols-4">
      <Form.Group><Form.Label>Status</Form.Label><Form.Select value={filters.status} onChange={(e) => onChange('status', e.target.value)}><option value="">All statuses</option>{Object.entries(ORDER_STATUSES).map(([key, value]) => <option key={key} value={key}>{value.label}</option>)}</Form.Select></Form.Group>
      <Form.Group><Form.Label>Payment status</Form.Label><Form.Select value={filters.paymentStatus} onChange={(e) => onChange('paymentStatus', e.target.value)}><option value="">All payment statuses</option>{PAYMENT_STATUSES.map((key) => <option key={key} value={key}>{key.replace('_', ' ')}</option>)}</Form.Select></Form.Group>
      <Form.Group><Form.Label>Payment method</Form.Label><Form.Select value={filters.paymentMethod} onChange={(e) => onChange('paymentMethod', e.target.value)}><option value="">All methods</option>{methods.map((method) => <option key={method.code} value={method.code}>{method.label}</option>)}</Form.Select></Form.Group>
      <Form.Group><Form.Label>Customer</Form.Label><Form.Control value={filters.customer} onChange={(e) => onChange('customer', e.target.value)} placeholder="Name, email or phone" /></Form.Group>
      <Form.Group><Form.Label>Created from</Form.Label><Form.Control type="date" value={filters.dateFrom} onChange={(e) => onChange('dateFrom', e.target.value)} /></Form.Group>
      <Form.Group><Form.Label>Created to</Form.Label><Form.Control type="date" value={filters.dateTo} onChange={(e) => onChange('dateTo', e.target.value)} /></Form.Group>
      <Form.Group><Form.Label>Amount minimum</Form.Label><Form.Control type="number" min="0" value={filters.amountMin} onChange={(e) => onChange('amountMin', e.target.value)} /></Form.Group>
      <Form.Group><Form.Label>Amount maximum</Form.Label><Form.Control type="number" min="0" value={filters.amountMax} onChange={(e) => onChange('amountMax', e.target.value)} /></Form.Group>
      <div className="tw-flex tw-items-end tw-gap-2"><Button onClick={onApply}>Apply</Button><Button variant="brandOutline" onClick={onReset}>Reset</Button></div>
    </div>
  );
}
