import BsButton from 'react-bootstrap/Button';

// Bootstrap's button engine (focus, disabled, a11y) + the design's colours via its CSS variables.
const VARIANTS = {
  primary: { '--bs-btn-bg': 'var(--c-btn-bg)', '--bs-btn-border-color': 'var(--c-btn-bg)', '--bs-btn-color': 'var(--c-btn-fg)', '--bs-btn-hover-bg': 'var(--c-btn-hover)', '--bs-btn-hover-border-color': 'var(--c-btn-hover)', '--bs-btn-hover-color': 'var(--c-btn-fg)', '--bs-btn-active-bg': 'var(--c-btn-hover)', '--bs-btn-active-color': 'var(--c-btn-fg)', '--bs-btn-active-border-color': 'var(--c-btn-hover)', '--bs-btn-border-radius': '10px' },
  brandOutline: { '--bs-btn-bg': 'var(--c-card)', '--bs-btn-border-color': '#1f7a62', '--bs-btn-color': '#1f7a62', '--bs-btn-hover-bg': '#1f7a62', '--bs-btn-hover-border-color': '#1f7a62', '--bs-btn-hover-color': '#fff', '--bs-btn-active-bg': '#17614e', '--bs-btn-active-color': '#fff', '--bs-btn-active-border-color': '#17614e', '--bs-btn-border-radius': '8px' },
};

export default function Button({ variant = 'primary', className = '', style, ...props }) {
  return (
    <BsButton type="button" variant="" className={`tw-h-11 tw-px-[18px] tw-text-sm tw-font-medium ${className}`}
      style={{ ...VARIANTS[variant], ...style }} {...props} />
  );
}
