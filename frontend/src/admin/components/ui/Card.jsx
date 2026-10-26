export default function Card({ title, children, className = '', as: Tag = 'div' }) {
  return (
    <Tag className={`tw-min-w-0 tw-rounded-card tw-border tw-border-solid tw-border-line tw-bg-card tw-p-5 ${className}`}>
      {title && <h2 className="tw-mb-[14px] tw-text-[15px] tw-font-semibold">{title}</h2>}
      {children}
    </Tag>
  );
}
