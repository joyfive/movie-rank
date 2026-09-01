import { COPY } from '@/lib/site';
import { formatTargetDate, toIsoDate } from '@/lib/date';

interface HeroProps {
  targetDate: string;
}

export default function Hero({ targetDate }: HeroProps) {
  return (
    <section className="px-4 pt-8 pb-6">
      <h1 className="text-2xl leading-snug font-extrabold tracking-tight text-fg sm:text-3xl">
        {COPY.heroTitle}
      </h1>

      <p className="mt-3 text-sm text-fg-muted">
        <time dateTime={toIsoDate(targetDate)} className="tabular">
          {formatTargetDate(targetDate)}
        </time>{' '}
        {COPY.heroSubSuffix}
      </p>

      <p className="mt-2 text-xs leading-relaxed text-fg-subtle">{COPY.indicatorDescription}</p>
    </section>
  );
}
