import { useState } from 'react';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/ui/Icon';

const PRESETS = [
  { name: 'Black', hex: '#111111' },
  { name: 'Natural', hex: '#e8dcc5' },
  { name: 'White', hex: '#ffffff' },
  { name: 'Beige', hex: '#d8c3a5' },
  { name: 'Grey', hex: '#8b8b8b' },
];

export const HEX_PATTERN = /^#[0-9a-fA-F]{6}$/;

function clean(value, maxLength) {
  return String(value || '').split('').filter((character) => character.charCodeAt(0) >= 32 && character.charCodeAt(0) !== 127).join('').trim().slice(0, maxLength);
}

export default function ColourManager({ colours, onChange, error }) {
  const [draft, setDraft] = useState({ name: '', hex: '#000000' });
  const add = (colour) => {
    const name = clean(colour.name, 30);
    const hex = colour.hex.toLowerCase();
    if (!name || !HEX_PATTERN.test(hex) || colours.length >= 12) return;
    if (colours.some((item) => item.name.toLowerCase() === name.toLowerCase() || item.hex.toLowerCase() === hex)) return;
    onChange([...colours, { id: `colour-${Date.now()}-${colours.length}`, name, hex }]);
  };
  const addDraft = () => { add(draft); setDraft({ name: '', hex: '#000000' }); };
  const remove = (id) => onChange(colours.filter((colour) => colour.id !== id));
  return <div>
    <div className="tw-space-y-2">
      {colours.map((colour) => <div key={colour.id} className="tw-flex tw-items-center tw-gap-2">
        <span aria-hidden="true" className="tw-h-7 tw-w-7 tw-rounded-md tw-border tw-border-solid tw-border-line" style={{ background: HEX_PATTERN.test(colour.hex) ? colour.hex : '#ffffff' }} />
        <span className="tw-flex-1 tw-text-sm">{colour.name}</span>
        <code className="tw-text-xs tw-text-muted">{colour.hex}</code>
        <button type="button" aria-label={`Delete ${colour.name} colour`} onClick={() => remove(colour.id)} className="tw-inline-flex tw-h-8 tw-w-8 tw-items-center tw-justify-center tw-rounded-md tw-border tw-border-solid tw-border-line tw-bg-card tw-text-danger hover:tw-bg-page"><Icon name="trash" size={15} /></button>
      </div>)}
    </div>
    <div className="tw-mt-3 tw-flex tw-flex-wrap tw-items-end tw-gap-2">
      <label className="tw-flex-1 tw-min-w-[150px]"><span className="tw-block tw-text-xs tw-text-muted">Colour name</span><input className="form-control tw-mt-1 tw-h-10" maxLength={30} value={draft.name} onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))} /></label>
      <label><span className="tw-block tw-text-xs tw-text-muted">Hex</span><input aria-label="Custom colour hex" type="color" className="tw-mt-1 tw-h-10 tw-w-14 tw-cursor-pointer" value={draft.hex} onChange={(event) => setDraft((current) => ({ ...current, hex: event.target.value }))} /></label>
      <Button type="button" variant="brandOutline" onClick={addDraft} disabled={colours.length >= 12}>Add colour</Button>
    </div>
    <div className="tw-mt-3 tw-flex tw-flex-wrap tw-gap-2"><span className="tw-w-full tw-text-xs tw-text-muted">Quick add</span>{PRESETS.map((preset) => <button key={preset.name} type="button" onClick={() => add(preset)} disabled={colours.length >= 12} className="tw-inline-flex tw-items-center tw-gap-1 tw-rounded-md tw-border tw-border-solid tw-border-line tw-bg-card tw-px-2 tw-py-1 tw-text-xs hover:tw-border-[var(--c-brand)]"><span aria-hidden="true" className="tw-h-3 tw-w-3 tw-rounded-full tw-border tw-border-solid tw-border-line" style={{ background: preset.hex }} />{preset.name}</button>)}</div>
    <p className="tw-mt-2 tw-text-xs tw-text-muted">{colours.length}/12 colours</p>
    {error && <p role="alert" className="tw-mt-1 tw-text-sm tw-text-danger">{error}</p>}
  </div>;
}
