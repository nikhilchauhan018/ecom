import Form from 'react-bootstrap/Form';
import Button from '../../../components/ui/Button';
import { PRODUCT_STATUSES } from '../productConstants';

export default function ProductFilters({ filters, categories, onChange, onApply, onReset }) {
  return <div className="tw-mt-4 tw-grid tw-grid-cols-1 tw-gap-3 tw-border-0 tw-border-t tw-border-solid tw-border-hair tw-pt-4 sm:tw-grid-cols-2 lg:tw-grid-cols-4">
    <Form.Group><Form.Label>Category</Form.Label><Form.Select value={filters.category} onChange={(event) => onChange('category', event.target.value)}><option value="">All categories</option>{categories.map((category) => <option key={category}>{category}</option>)}</Form.Select></Form.Group>
    <Form.Group><Form.Label>Status</Form.Label><Form.Select value={filters.status} onChange={(event) => onChange('status', event.target.value)}><option value="">All statuses</option>{Object.entries(PRODUCT_STATUSES).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</Form.Select></Form.Group>
    <Form.Group><Form.Label>Stock state</Form.Label><Form.Select value={filters.stockState} onChange={(event) => onChange('stockState', event.target.value)}><option value="">All stock states</option><option value="in_stock">In stock</option><option value="low">Low stock</option><option value="out_of_stock">Out of stock</option></Form.Select></Form.Group>
    <Form.Group><Form.Label>Price minimum</Form.Label><Form.Control type="number" min="0" value={filters.priceMin} onChange={(event) => onChange('priceMin', event.target.value)} /></Form.Group>
    <Form.Group><Form.Label>Price maximum</Form.Label><Form.Control type="number" min="0" value={filters.priceMax} onChange={(event) => onChange('priceMax', event.target.value)} /></Form.Group>
    <div className="tw-flex tw-items-end tw-gap-2"><Button onClick={onApply}>Apply</Button><Button variant="brandOutline" onClick={onReset}>Reset</Button></div>
  </div>;
}
