import { useState } from 'react';
import Form from 'react-bootstrap/Form';
import Button from '../../../components/ui/Button';
import { validateFilters } from '../incompleteOrderQuery';

/**
 * Filter panel. It keeps its own draft until Apply is pressed. The parent gives it a `key` that changes when the applied
 * filters change, so the draft restarts from the URL values (Reset, Back button, chip removed).
 */
export default function IncompleteOrderFilters({ initial, onApply, onReset }) {
  const [draft, setDraft] = useState(initial);
  const [error, setError] = useState('');
  const change = (key, value) => setDraft((current) => ({ ...current, [key]: value }));
  const submit = (event) => {
    event.preventDefault();
    const problem = validateFilters(draft);
    setError(problem);
    if (!problem) onApply(draft);
  };
  return (
    <form onSubmit={submit} noValidate className="tw-mt-4 tw-grid tw-grid-cols-1 tw-gap-3 tw-border-0 tw-border-t tw-border-solid tw-border-hair tw-pt-4 sm:tw-grid-cols-2 lg:tw-grid-cols-4">
      <Form.Group><Form.Label htmlFor="incomplete-from">Created from</Form.Label><Form.Control id="incomplete-from" type="date" value={draft.dateFrom} onChange={(event) => change('dateFrom', event.target.value)} /></Form.Group>
      <Form.Group><Form.Label htmlFor="incomplete-to">Created to</Form.Label><Form.Control id="incomplete-to" type="date" value={draft.dateTo} onChange={(event) => change('dateTo', event.target.value)} /></Form.Group>
      <Form.Group><Form.Label htmlFor="incomplete-min">Amount minimum</Form.Label><Form.Control id="incomplete-min" type="number" min="0" inputMode="decimal" value={draft.amountMin} onChange={(event) => change('amountMin', event.target.value)} /></Form.Group>
      <Form.Group><Form.Label htmlFor="incomplete-max">Amount maximum</Form.Label><Form.Control id="incomplete-max" type="number" min="0" inputMode="decimal" value={draft.amountMax} onChange={(event) => change('amountMax', event.target.value)} /></Form.Group>
      {error && <p role="alert" className="tw-m-0 tw-text-sm tw-text-danger sm:tw-col-span-2 lg:tw-col-span-4">{error}</p>}
      <div className="tw-flex tw-items-end tw-gap-2"><Button type="submit">Apply</Button><Button type="button" variant="brandOutline" onClick={onReset}>Reset</Button></div>
    </form>
  );
}
