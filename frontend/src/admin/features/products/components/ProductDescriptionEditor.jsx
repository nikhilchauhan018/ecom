import Form from 'react-bootstrap/Form';

export default function ProductDescriptionEditor({ value, onChange }) {
  return <Form.Control as="textarea" rows={6} maxLength={5000} value={value} onChange={(event) => onChange(event.target.value)} aria-label="Product description" />;
}
