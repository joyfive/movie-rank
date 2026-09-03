import { COPY } from '@/lib/site';
import { formatTargetDate, toIsoDate } from '@/lib/date';

interface HeroProps {
  targetDate: string;
}

export default function Hero({ targetDate }: HeroProps) {
  return (
    <section className="gutter relative overflow-hidden pt-9 pb-7 lg:pt-16 lg:pb-10">
      {/* 레드 글로우. 포스터 없이도 화면 상단에 무게를 준다. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 -left-28 h-72 w-72 rounded-full bg-accent opacity-[0.07] blur-3xl lg:h-[32rem] lg:w-[32rem]"
      />

      <div className="relative">
        <p className="mb-3 flex items-center gap-2 text-xs tracking-widest text-fg-subtle uppercase">
          <span className="inline-block h-3 w-1 bg-accent" aria-hidden="true" />
          Daily Box Office
        </p>

        <h1 className="font-display text-[2.1rem] leading-[1.12] text-fg sm:text-5xl lg:text-6xl xl:text-7xl">
          오늘 극장가,
          <br />
          <span className="text-accent-text">뭐가 뜨고</span> 있을까?
        </h1>

        <p className="mt-5 text-sm text-fg-muted lg:text-base">
          <time dateTime={toIsoDate(targetDate)} className="tabular font-semibold text-fg">
            {formatTargetDate(targetDate)}
          </time>{' '}
          {COPY.heroSubSuffix}
        </p>

        <p className="mt-2 text-xs leading-relaxed text-fg-subtle">{COPY.indicatorDescription}</p>
      </div>
    </section>
  );
}
