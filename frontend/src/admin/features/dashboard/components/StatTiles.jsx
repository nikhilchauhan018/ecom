export default function StatTiles({ tiles }) {
  const trendClass = {
    up: 'tw-bg-[#dff5ea] tw-text-[#14573f]',
    down: 'tw-bg-[#fbe4e1] tw-text-[#8a2217]',
  };

  return (
    <section aria-label="Key numbers" className="tw-grid tw-grid-cols-1 tw-gap-5 sm:tw-grid-cols-2 xl:tw-grid-cols-4">
      {tiles.map((t) => (
        <div key={t.label} className="tw-flex tw-min-h-[150px] tw-flex-col tw-justify-between tw-rounded-card tw-p-5 tw-text-white shadow-sm" style={{ background: t.color }}>
          <div className="tw-flex tw-items-start tw-justify-between tw-gap-3">
            <div>
              <div className="tw-text-sm tw-font-medium tw-text-white/90">{t.label}</div>
              <div className="tw-mt-4 tw-text-3xl tw-font-semibold tw-leading-none sm:tw-text-4xl">{t.value}</div>
            </div>
            <span className={`tw-inline-flex tw-items-center tw-rounded-full tw-px-2 tw-py-1 tw-text-[11px] tw-font-semibold ${trendClass[t.trend] || 'tw-bg-white/15 tw-text-white'}`}>
              {t.delta}
            </span>
          </div>
          <div className="tw-flex tw-items-center tw-justify-between tw-gap-3 tw-text-[12px] tw-text-white/85">
            <span>{t.subtitle}</span>
            <span className="tw-inline-flex tw-items-center tw-gap-1">
              <span aria-hidden="true">{t.trend === 'down' ? '↓' : '↑'}</span>
            </span>
          </div>
        </div>
      ))}
    </section>
  );
}
