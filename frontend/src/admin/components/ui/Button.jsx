import BsButton from 'react-bootstrap/Button';

const VARIANTS = {
  primary: { '--bs-btn-bg': 'var(--c-btn-bg)', '--bs-btn-border-color': 'var(--c-btn-bg)', '--bs-btn-color': 'var(--c-btn-fg)', '--bs-btn-hover-bg': 'var(--c-btn-hover)', '--bs-btn-hover-border-color': 'var(--c-btn-hover)', '--bs-btn-hover-color': 'var(--c-btn-fg)', '--bs-btn-active-bg': 'var(--c-btn-hover)', '--bs-btn-active-color': 'var(--c-btn-fg)', '--bs-btn-active-border-color': 'var(--c-btn-hover)', '--bs-btn-border-radius': '10px' },
  brandOutline: { '--bs-btn-bg': 'var(--c-card)', '--bs-btn-border-color': 'var(--c-brand)', '--bs-btn-color': 'var(--c-brand)', '--bs-btn-hover-bg': 'var(--c-brand)', '--bs-btn-hover-border-color': 'var(--c-brand)', '--bs-btn-hover-color': 'var(--c-brand-contrast)', '--bs-btn-active-bg': 'var(--c-brand-strong)', '--bs-btn-active-color': 'var(--c-brand-contrast)', '--bs-btn-active-border-color': 'var(--c-brand-strong)', '--bs-btn-border-radius': '8px' },
};

export default function Button({
  variant = 'primary',
  className = '',
  style,
  loading = false,
  disabled = false,
  type = 'button',
  children,
  ...props
}) {
  const variantStyle = VARIANTS[variant] ?? VARIANTS.primary;
  const isDisabled = disabled || loading;

  return (
    <BsButton
      {...props}
      type={type}
      variant=""
      disabled={isDisabled}
      aria-busy={loading || undefined}
      className={`tw-inline-flex tw-min-h-11 tw-items-center tw-justify-center tw-gap-2 tw-px-[18px] tw-text-sm tw-font-medium ${className}`}
      style={{ ...variantStyle, ...style }}
    >
      {loading && <span aria-hidden="true" className="tw-h-4 tw-w-4 tw-animate-spin tw-rounded-full tw-border-2 tw-border-current tw-border-r-transparent" />}
      {children}
    </BsButton>
  );
}
