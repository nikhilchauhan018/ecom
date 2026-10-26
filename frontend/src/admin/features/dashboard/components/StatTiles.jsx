export default function StatTiles({ tiles }) {
  return (
    <section aria-label="Key numbers" className="tw-grid tw-grid-cols-1 tw-gap-5 sm:tw-grid-cols-2 lg:tw-grid-cols-4">
      {tiles.map((t) => (
        <div key={t.label} className="tw-min-h-[140px] tw-rounded-lg tw-p-6 tw-text-white" style={{ background: t.color }}>
          <div className="tw-text-base tw-font-medium">{t.label}</div>
          <div className="tw-mt-5 tw-text-5xl tw-font-semibold tw-leading-none">{t.value}</div>
        </div>
      ))}
    </section>
  );
}
