import { useState } from 'react';
import { BLOCK_LABELS, BLOCK_TYPES, createBlock } from '../blocks';
import { LIMITS, type Block, type BlockType } from '../schema';
import type { FieldErrors } from '../types';
import { BlockFields } from './BlockFields';

interface Props {
  blocks: Block[];
  errors: FieldErrors;
  onChange: (next: Block[]) => void;
}

export function BlocksEditor({ blocks, errors, onChange }: Props) {
  const [newType, setNewType] = useState<BlockType>('text');
  const atLimit = blocks.length >= LIMITS.maxBlocks;

  const replace = (index: number, next: Block) => onChange(blocks.map((b, i) => (i === index ? next : b)));
  const remove = (index: number) => onChange(blocks.filter((_, i) => i !== index));
  const move = (index: number, delta: -1 | 1) => {
    const target = index + delta;
    if (target < 0 || target >= blocks.length) return;
    const next = [...blocks];
    const a = next[index];
    const b = next[target];
    if (!a || !b) return;
    next[index] = b;
    next[target] = a;
    onChange(next);
  };

  return (
    <div className="pg-stack">
      {errors['blocks'] && <p className="pg-error">{errors['blocks']}</p>}
      {blocks.length === 0 && <p className="pg-empty">No content yet. Add a heading, text or any block below.</p>}
      <ol className="pg-block-list">
        {blocks.map((block, index) => (
          <li key={block.id} className="pg-block">
            <div className="pg-block-head">
              <strong>{BLOCK_LABELS[block.type]}</strong>
              <span className="pg-block-tools">
                <button type="button" className="pg-btn pg-btn-sm" onClick={() => move(index, -1)} disabled={index === 0} aria-label={`Move ${BLOCK_LABELS[block.type]} block up`}>Up</button>
                <button type="button" className="pg-btn pg-btn-sm" onClick={() => move(index, 1)} disabled={index === blocks.length - 1} aria-label={`Move ${BLOCK_LABELS[block.type]} block down`}>Down</button>
                <button type="button" className="pg-btn pg-btn-sm pg-btn-danger" onClick={() => remove(index)} aria-label={`Remove ${BLOCK_LABELS[block.type]} block`}>Remove</button>
              </span>
            </div>
            <BlockFields block={block} path={`blocks.${index}`} errors={errors} onChange={(next) => replace(index, next)} />
          </li>
        ))}
      </ol>
      <div className="pg-add-row">
        <label htmlFor="pg-new-block" className="pg-label">Add block</label>
        <select id="pg-new-block" className="pg-input pg-input-auto" value={newType} onChange={(e) => setNewType(e.target.value as BlockType)} disabled={atLimit}>
          {BLOCK_TYPES.map((t) => (
            <option key={t} value={t}>{BLOCK_LABELS[t]}</option>
          ))}
        </select>
        <button type="button" className="pg-btn" onClick={() => onChange([...blocks, createBlock(newType)])} disabled={atLimit}>Add</button>
        {atLimit && <span className="pg-hint">Limit of {LIMITS.maxBlocks} blocks reached.</span>}
      </div>
    </div>
  );
}
