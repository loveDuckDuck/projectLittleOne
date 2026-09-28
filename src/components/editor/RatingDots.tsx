export function RatingDots({ value }: { value: number }) {
  return <span className="rating-dots" role="img" aria-label={`${value.toLocaleString('it-IT')} su 5`}>
    {Array.from({ length: 5 }, (_, index) => {
      const fill = Math.max(0, Math.min(1, value - index)) * 100;
      return <span key={index} aria-hidden="true" className="rating-dot" style={{ background: `linear-gradient(90deg, var(--block-accent, var(--cv-accent, #315d91)) ${fill}%, #d8e0eb ${fill}%)` }} />;
    })}
  </span>;
}
