import type { Block } from '../schema';
import { LIMITS } from '../schema';
import type { FieldErrors } from '../types';
import { SelectField, TextAreaField, TextField } from './fields';

interface Props {
  block: Block;
  /** Prefix for this block's keys in the errors map, e.g. "blocks.2". */
  path: string;
  errors: FieldErrors;
  onChange: (next: Block) => void;
}

export function BlockFields({ block, path, errors, onChange }: Props) {
  const err = (field: string) => errors[`${path}.${field}`];

  switch (block.type) {
    case 'heading':
      return (
        <div className="pg-grid-2">
          <TextField label="Heading text" required value={block.text} maxLength={LIMITS.heading + 50} error={err('text')} onChange={(e) => onChange({ ...block, text: e.target.value })} />
          <SelectField
            label="Level"
            value={String(block.level)}
            options={[{ value: '2', label: 'Large (H2)' }, { value: '3', label: 'Medium (H3)' }]}
            onChange={(e) => onChange({ ...block, level: e.target.value === '3' ? 3 : 2 })}
          />
        </div>
      );
    case 'text':
      return (
        <TextAreaField
          label="Text"
          required
          rows={5}
          value={block.text}
          counter={{ value: block.text.length, max: LIMITS.blockText }}
          hint="Plain text. Press Enter twice to start a new paragraph."
          error={err('text')}
          onChange={(e) => onChange({ ...block, text: e.target.value })}
        />
      );
    case 'map':
      return <TextField label="Shop address" required value={block.address} error={err('address')} onChange={(e) => onChange({ ...block, address: e.target.value })} />;
    case 'contactInfo':
      return (
        <div className="pg-grid-3">
          <TextField label="Title" required value={block.title} error={err('title')} onChange={(e) => onChange({ ...block, title: e.target.value })} />
          <TextField label="Phone" type="tel" inputMode="tel" autoComplete="off" value={block.phone} error={err('phone')} onChange={(e) => onChange({ ...block, phone: e.target.value })} />
          <TextField label="Email" type="email" autoComplete="off" value={block.email} error={err('email')} onChange={(e) => onChange({ ...block, email: e.target.value })} />
        </div>
      );
    case 'contactForm':
      return <TextField label="Message shown after sending" required value={block.successMessage} error={err('successMessage')} onChange={(e) => onChange({ ...block, successMessage: e.target.value })} />;
    case 'productCollection':
      return (
        <div className="pg-grid-2">
          <TextField label="Collection permalink" required value={block.collectionSlug} hint="Example: new-arrivals" error={err('collectionSlug')} onChange={(e) => onChange({ ...block, collectionSlug: e.target.value.toLowerCase() })} />
          <TextField
            label="Number of products"
            required
            type="number"
            inputMode="numeric"
            min={1}
            max={LIMITS.maxProductsInCollection}
            step={1}
            value={Number.isFinite(block.limit) ? block.limit : ''}
            error={err('limit')}
            onChange={(e) => {
              const n = Number(e.target.value);
              onChange({ ...block, limit: e.target.value === '' || !Number.isFinite(n) ? 0 : Math.trunc(n) });
            }}
          />
        </div>
      );
    case 'sizeGuide':
      return (
        <div className="pg-grid-2">
          <TextField label="Title" required value={block.title} error={err('title')} onChange={(e) => onChange({ ...block, title: e.target.value })} />
          <SelectField
            label="Measurement unit"
            value={block.unit}
            options={[{ value: 'cm', label: 'Centimetres' }, { value: 'inch', label: 'Inches' }]}
            onChange={(e) => onChange({ ...block, unit: e.target.value === 'inch' ? 'inch' : 'cm' })}
          />
        </div>
      );
    case 'newsletter':
      return <TextField label="Heading" required value={block.heading} error={err('heading')} onChange={(e) => onChange({ ...block, heading: e.target.value })} />;
  }
}
