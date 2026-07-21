type BeforeAfterCardProps = {
  title: string;
  before: string;
  after: string;
};

export function BeforeAfterCard({ title, before, after }: BeforeAfterCardProps) {
  return (
    <article className="before-after-card">
      <h3>{title}</h3>
      <div className="before-after-card__row">
        <span className="before-after-card__label">Before</span>
        <p>{before}</p>
      </div>
      <div className="before-after-card__row">
        <span className="before-after-card__label">After</span>
        <p>{after}</p>
      </div>
    </article>
  );
}
