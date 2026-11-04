import React from 'react';
import { cn } from '../../../utils/cn';

/**
 * Radio-card: a native radio input (keyboard + screen-reader behaviour for free) inside a label,
 * styled as a bordered card. Put it inside a <fieldset> with a <legend>.
 * @param {{ name: string, value: string, checked: boolean, onChange: () => void, dashed?: boolean, children: React.ReactNode }} props
 */
export function ChoiceCard({ name, value, checked, onChange, dashed = false, children }) {
  return (
    <label className={cn('sf-choice', checked && 'is-selected', dashed && 'is-dashed')}>
      <input type="radio" className="sf-choice-radio" name={name} value={value} checked={checked} onChange={onChange} />
      <span className="sf-choice-body">{children}</span>
    </label>
  );
}

export default ChoiceCard;
