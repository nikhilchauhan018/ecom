import { useState } from 'react';
import { ImageUploader } from './ImageUploader';
import { SelectField, TextAreaField, TextField } from './ui';
import type { FieldErrors } from '../types';
import { newId } from '../utils';
import { LIMITS, type PostBlock, type PostBlockType } from '../schema';

const LABELS: Record<PostBlockType, string> = { heading: 'Heading', text: 'Paragraph', quote: 'Quote', image: 'Image' };
const TYPES = Object.keys(LABELS) as PostBlockType[];

function createBlock(type: PostBlockType): PostBlock {
  const id = newId();
  switch (type) {
    case 'heading':
      return { id, type, text: '', level: 2 };
    case 'text':
      return { id, type, text: '' };
    case 'quote':
      return { id, type, text: '', cite: '' };
    case 'image':
      return { id, type, url: '', alt: '' };
  }
}

interface FieldsProps {
  block: PostBlock;
  path: string;
  errors: FieldErrors;
  onChange: (next: PostBlock) => void;
}

function BlockFields({ block, path, errors, onChange }: FieldsProps) {
  const err = (field: string) => errors[`${path}.${field}`];
  switch (block.type) {
    case 'heading':
      return (
        <div className="bl-grid-2">
          <TextField label="Heading text" required value={block.text} error={err('text')} onChange={(e) => onChange({ ...block, text: e.target.value })} />
          <SelectField label="Level" value={String(block.level)} options={[{ value: '2', label: 'Large (H2)' }, { value: '3', label: 'Medium (H3)' }]} onChange={(e) => onChange({ ...block, level: e.target.value === '3' ? 3 : 2 })} />
        </div>
      );
    case 'text':
      return <TextAreaField label="Paragraph" required rows={6} value={block.text} counter={{ value: block.text.length, max: LIMITS.text }} hint="Plain text. Press Enter twice to start a new paragraph." error={err('text')} onChange={(e) => onChange({ ...block, text: e.target.value })} />;
    case 'quote':
      return (
        <div className="bl-stack">
          <TextAreaField label="Quote" required rows={3} value={block.text} counter={{ value: block.text.length, max: LIMITS.quote }} error={err('text')} onChange={(e) => onChange({ ...block, text: e.target.value })} />
          <TextField label="Who said it (optional)" value={block.cite} error={err('cite')} onChange={(e) => onChange({ ...block, cite: e.target.value })} />
        </div>
      );
    case 'image':
      return (
        <div className="bl-stack">
          <ImageUploader value={block.url} error={err('url')} onChange={(url) => onChange({ ...block, url })} />
          <TextField label="Image description (for screen readers)" required value={block.alt} counter={{ value: block.alt.length, max: LIMITS.alt }} error={err('alt')} onChange={(e) => onChange({ ...block, alt: e.target.value })} />
        </div>
      );
  }
}

interface Props {
  blocks: PostBlock[];
  errors: FieldErrors;
  onChange: (next: PostBlock[]) => void;
}

export function PostBlocksEditor({ blocks, errors, onChange }: Props) {
  const [newType, setNewType] = useState<PostBlockType>('text');
  const atLimit = blocks.length >= LIMITS.maxBlocks;
  const replace = (index: number, next: PostBlock) => onChange(blocks.map((b, i) => (i === index ? next : b)));
  const move = (index: number, delta: -1 | 1) => {
    const a = blocks[index];
    const b = blocks[index + delta];
    if (!a || !b) return;
    const next = [...blocks];
    next[index] = b;
    next[index + delta] = a;
    onChange(next);
  };

  return (
    <div className="bl-stack">
      {errors['blocks'] && <p className="bl-error">{errors['blocks']}</p>}
      {blocks.length === 0 && <p className="bl-empty">Nothing here yet. Add a paragraph, heading, quote or image.</p>}
      <ol className="bl-block-list">
        {blocks.map((block, index) => (
          <li key={block.id} className="bl-block">
            <div className="bl-block-head">
              <strong>{LABELS[block.type]}</strong>
              <span className="bl-block-tools">
                <button type="button" className="bl-btn bl-btn-sm" onClick={() => move(index, -1)} disabled={index === 0} aria-label={`Move ${LABELS[block.type]} block up`}>Up</button>
                <button type="button" className="bl-btn bl-btn-sm" onClick={() => move(index, 1)} disabled={index === blocks.length - 1} aria-label={`Move ${LABELS[block.type]} block down`}>Down</button>
                <button type="button" className="bl-btn bl-btn-sm bl-btn-danger" onClick={() => onChange(blocks.filter((_, i) => i !== index))} aria-label={`Remove ${LABELS[block.type]} block`}>Remove</button>
              </span>
            </div>
            <BlockFields block={block} path={`blocks.${index}`} errors={errors} onChange={(next) => replace(index, next)} />
          </li>
        ))}
      </ol>
      <div className="bl-add-row">
        <label htmlFor="blog-new-block" className="bl-label">Add block</label>
        <select id="blog-new-block" className="bl-input bl-input-auto" value={newType} onChange={(e) => setNewType(e.target.value as PostBlockType)} disabled={atLimit}>
          {TYPES.map((t) => (
            <option key={t} value={t}>{LABELS[t]}</option>
          ))}
        </select>
        <button type="button" className="bl-btn" onClick={() => onChange([...blocks, createBlock(newType)])} disabled={atLimit}>Add</button>
        {atLimit && <span className="bl-hint">Limit of {LIMITS.maxBlocks} blocks reached.</span>}
      </div>
    </div>
  );
}
