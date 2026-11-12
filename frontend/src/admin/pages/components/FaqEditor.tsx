import { LIMITS, type Faq } from '../schema';
import type { FieldErrors } from '../types';
import { newId } from '../utils/id';
import { TextAreaField, TextField } from './fields';

interface Props {
  faqs: Faq[];
  errors: FieldErrors;
  onChange: (next: Faq[]) => void;
}

export function FaqEditor({ faqs, errors, onChange }: Props) {
  const atLimit = faqs.length >= LIMITS.maxFaqs;
  return (
    <div className="pg-stack">
      {errors['faqs'] && <p className="pg-error">{errors['faqs']}</p>}
      {faqs.length === 0 && <p className="pg-empty">No questions yet. Questions added here also help your page appear as an FAQ result on Google.</p>}
      {faqs.map((faq, index) => (
        <div key={faq.id} className="pg-block">
          <div className="pg-block-head">
            <strong>Question {index + 1}</strong>
            <button type="button" className="pg-btn pg-btn-sm pg-btn-danger" onClick={() => onChange(faqs.filter((f) => f.id !== faq.id))} aria-label={`Remove question ${index + 1}`}>Remove</button>
          </div>
          <TextField label="Question" required value={faq.question} error={errors[`faqs.${index}.question`]} onChange={(e) => onChange(faqs.map((f) => (f.id === faq.id ? { ...f, question: e.target.value } : f)))} />
          <TextAreaField label="Answer" required rows={3} value={faq.answer} counter={{ value: faq.answer.length, max: LIMITS.answer }} error={errors[`faqs.${index}.answer`]} onChange={(e) => onChange(faqs.map((f) => (f.id === faq.id ? { ...f, answer: e.target.value } : f)))} />
        </div>
      ))}
      <div>
        <button type="button" className="pg-btn" disabled={atLimit} onClick={() => onChange([...faqs, { id: newId(), question: '', answer: '' }])}>Add question</button>
        {atLimit && <span className="pg-hint"> Limit of {LIMITS.maxFaqs} questions reached.</span>}
      </div>
    </div>
  );
}
