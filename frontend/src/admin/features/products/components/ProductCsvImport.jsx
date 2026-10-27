import { useState } from 'react';
import Form from 'react-bootstrap/Form';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import { importProducts } from '../../../services/api/products';
import { validateCsvLimits, validateProductRows } from '../productUtils';
import { PRODUCT_CSV_MAX_ROWS } from '../productConstants';

const headers = ['name', 'slug', 'sku', 'price', 'salePrice', 'status', 'category', 'barcode', 'size', 'color', 'cost', 'stock'];

export default function ProductCsvImport({ categories, onClose, onImported }) {
  const [rows, setRows] = useState([]);
  const [errors, setErrors] = useState([]);
  const [fileError, setFileError] = useState('');
  const [validOnly, setValidOnly] = useState(true);
  const [busy, setBusy] = useState(false);

  const downloadTemplate = () => {
    const csv = `${headers.join(',')}\nExample Shirt,example-shirt,SKU-EXAMPLE,1000,800,published,Shirts,BARCODE,S, Navy,450,10\n`;
    const link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    link.download = 'products-template.csv';
    link.click();
    URL.revokeObjectURL(link.href);
  };
  const parseFile = async (file) => {
    setFileError('');
    setRows([]);
    setErrors([]);
    if (!file) return;
    const sizeErrors = validateCsvLimits(file.size, 0);
    if (sizeErrors.length) {
      setFileError(sizeErrors[0]);
      return;
    }
    const Papa = (await import('papaparse')).default;
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        const rowErrors = validateCsvLimits(file.size, result.data.length);
        if (rowErrors.length) {
          setFileError(rowErrors[0]);
          return;
        }
        const parsedRows = result.data.map((row) => Object.fromEntries(headers.map((header) => [header, String(row[header] ?? '').trim()])));
        setRows(parsedRows);
        setErrors(validateProductRows(parsedRows, categories));
      },
      worker: file.size > 1024 * 1024,
      error: (parseError) => setFileError(parseError.message || 'Unable to parse CSV.'),
    });
  };
  const importValid = async () => {
    const invalidRows = new Set(errors.map((error) => error.row - 2));
    const importRows = validOnly ? rows.filter((_, index) => !invalidRows.has(index)) : rows;
    if (!importRows.length || (!validOnly && errors.length)) return;
    setBusy(true);
    await importProducts(importRows);
    setBusy(false);
    onImported();
    onClose();
  };
  return <Card title="Import products" className="tw-mt-5">
    <div className="tw-flex tw-flex-wrap tw-items-center tw-justify-between tw-gap-2"><p className="tw-text-muted">CSV only, maximum 5 MB and {PRODUCT_CSV_MAX_ROWS} rows.</p><Button type="button" variant="brandOutline" onClick={downloadTemplate}>Download template</Button></div>
    <Form.Group className="tw-mt-3"><Form.Label htmlFor="product-csv">Choose CSV file</Form.Label><Form.Control id="product-csv" type="file" accept=".csv,text/csv" onChange={(event) => parseFile(event.target.files?.[0])} /></Form.Group>
    {fileError && <p role="alert" className="tw-mt-3 tw-text-[var(--c-danger-ink)]">{fileError}</p>}
    {rows.length > 0 && <><div className="tw-mt-4 tw-overflow-x-auto"><table className="admin-table tw-min-w-[800px]"><thead><tr>{headers.slice(0, 7).map((header) => <th key={header} className="tw-text-xs tw-uppercase tw-text-muted">{header}</th>)}</tr></thead><tbody>{rows.slice(0, 5).map((row, index) => <tr key={`${row.sku}-${index}`}>{headers.slice(0, 7).map((header) => <td key={header}>{row[header]}</td>)}</tr>)}</tbody></table></div><p className="tw-mt-3 tw-text-muted">Previewing first {Math.min(rows.length, 5)} of {rows.length} rows.</p></>}
    {errors.length > 0 && <div className="tw-mt-4 tw-overflow-x-auto"><h3 className="tw-text-base tw-font-semibold">Validation errors ({errors.length})</h3><table className="admin-table tw-min-w-[500px]"><thead><tr><th>Row</th><th>Column</th><th>Message</th></tr></thead><tbody>{errors.map((error, index) => <tr key={`${error.row}-${error.column}-${index}`}><td>{error.row}</td><td>{error.column}</td><td>{error.message}</td></tr>)}</tbody></table></div>}
    {rows.length > 0 && <div className="tw-mt-4 tw-flex tw-flex-wrap tw-items-center tw-justify-between tw-gap-3"><Form.Check type="checkbox" label="Import valid rows only" checked={validOnly} onChange={(event) => setValidOnly(event.target.checked)} /><div className="tw-flex tw-gap-2"><Button type="button" variant="brandOutline" onClick={onClose}>Cancel</Button><Button type="button" onClick={importValid} disabled={busy || !rows.length || (!validOnly && errors.length > 0)}>{busy ? 'Importing...' : `Import ${validOnly ? rows.length - new Set(errors.map((error) => error.row)).size : rows.length} rows`}</Button></div></div>}
  </Card>;
}
