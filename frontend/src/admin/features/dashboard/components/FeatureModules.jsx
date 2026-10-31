import Card from '../../../components/ui/Card';

export default function FeatureModules({ modules }) {
  return (
    <section aria-label="Feature modules" className="tw-space-y-3">
      <h2 className="tw-mb-[14px] tw-text-[15px] tw-font-semibold">Everything in the admin</h2>
      <div className="tw-grid tw-grid-cols-1 tw-gap-4 sm:tw-grid-cols-2 xl:tw-grid-cols-4">
        {modules.map(([title, text]) => (
          <Card key={title} title={title} className="tw-h-full">
            <p className="tw-leading-relaxed tw-text-soft">{text}</p>
          </Card>
        ))}
      </div>
    </section>
  );
}
