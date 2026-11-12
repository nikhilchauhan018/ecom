import { LIMITS, type PageInput } from '../schema';
import type { FieldErrors } from '../types';
import { CheckboxField, TextAreaField, TextField } from './fields';

interface Props {
  value: PageInput;
  errors: FieldErrors;
  onChange: (patch: Partial<PageInput>) => void;
}

export function SeoPanel({ value, errors, onChange }: Props) {
  const title = value.seoTitle.trim() || value.name.trim() || 'Untitled page';
  const description = value.seoDescription.trim() || value.description.trim();
  return (
    <div className="pg-stack">
      <div className="pg-serp" aria-label="Search result preview">
        <div className="pg-serp-url">yoursite.com › {value.slug || '…'}</div>
        <div className="pg-serp-title">{title}</div>
        <div className="pg-serp-desc">{description || 'Add a short description so people know what this page is about.'}</div>
      </div>
      <TextField label="SEO title" value={value.seoTitle} counter={{ value: value.seoTitle.length, max: LIMITS.seoTitle }} hint="Leave empty to use the page name." error={errors['seoTitle']} onChange={(e) => onChange({ seoTitle: e.target.value })} />
      <TextAreaField label="SEO description" rows={3} value={value.seoDescription} counter={{ value: value.seoDescription.length, max: LIMITS.seoDescription }} hint="Leave empty to use the page description." error={errors['seoDescription']} onChange={(e) => onChange({ seoDescription: e.target.value })} />
      <CheckboxField label="Hide this page from search engines" checked={value.noindex} onChange={(e) => onChange({ noindex: e.target.checked })} />
    </div>
  );
}
