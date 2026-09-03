import Poster from '@/components/Poster';
import StatusBadge from '@/components/StatusBadge';
import { formatOpenDate, formatTargetDate, toIsoDate } from '@/lib/date';
import { formatAudience, formatHeat, formatNumber, formatRankDelta } from '@/lib/format';
import { COPY } from '@/lib/site';
import type { RankedMovie } from '@/types/movie';

interface HeroProps {
  targetDate: string;
  top: RankedMovie;
  posterUrl: string | null;
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-l border-ink-border pl-3">
      <dt className="text-[0.68rem] text-ink-subtle">{label}</dt>
      <dd className="tabular mt-0.5 text-sm font-semibold text-ink-fg">{value}</dd>
    </div>
  );
}

/**
 * 다크 히어로. 오늘 1위를 크게 다룬다.
 * 배경은 1위 포스터를 흐리게 깐 것이며, 포스터가 없으면 그라디언트만 남는다.
 */
export default function Hero({ targetDate, top, posterUrl }: HeroProps) {
  const delta = formatRankDelta(top.rankDelta, top.isNew);
  const openDate = formatOpenDate(top.openDate);

  return (
    <section className="relative overflow-hidden bg-ink">
      {posterUrl ? (
        <div aria-hidden="true" className="absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={posterUrl}
            alt=""
            className="h-full w-full scale-110 object-cover opacity-40 blur-xl"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/90 to-ink/40" />
        </div>
      ) : (
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(120%_90%_at_85%_15%,rgba(229,9,20,0.35),transparent_60%)]"
        />
      )}

      <div className="gutter relative py-10 lg:py-16">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:gap-14">
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-2 text-xs font-semibold text-accent-text">
              <span aria-hidden="true">👑</span> 오늘의 1위
            </p>

            <h1 className="font-display mt-3 text-[1.9rem] leading-[1.15] text-ink-fg sm:text-4xl lg:text-5xl">
              {COPY.heroTitle}
            </h1>

            <p className="font-display mt-4 text-[2.4rem] leading-[1.05] text-ink-fg sm:text-5xl lg:text-6xl">
              {top.title}
            </p>

            <p className="mt-3 text-xs text-ink-muted">
              <time dateTime={toIsoDate(targetDate)} className="tabular font-semibold text-ink-fg">
                {formatTargetDate(targetDate)}
              </time>{' '}
              {COPY.heroSubSuffix}
            </p>

            <dl className="mt-6 grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-4">
              <Meta label="순위 변동" value={delta.text} />
              <Meta label="누적 관객" value={formatAudience(top.audienceTotal)} />
              {openDate ? <Meta label="개봉일" value={openDate} /> : null}
              <Meta label="스크린" value={`${formatNumber(top.screenCount)}개`} />
            </dl>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <a
                href="#box-office"
                className="rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
              >
                박스오피스 TOP 10 보기
              </a>
              <StatusBadge status={top.status} />
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-6">
            <div className="w-[130px] sm:w-[160px] lg:w-[200px]">
              <Poster
                src={posterUrl}
                alt={`${top.title} 포스터`}
                rank={top.rank}
                priority
                className="w-full shadow-[0_12px_40px_rgba(0,0,0,0.5)]"
              />
            </div>

            {/* 원형 흥행 온도 뱃지 */}
            <div
              className="flex h-28 w-28 shrink-0 flex-col items-center justify-center rounded-full border-2 border-accent bg-ink/70 text-center shadow-[0_0_40px_rgba(229,9,20,0.45)] sm:h-32 sm:w-32"
              role="img"
              aria-label={`흥행 온도 100점 만점에 ${top.heatScore}점, ${top.heatLabel}`}
            >
              <span className="text-[0.6rem] text-ink-muted">흥행 온도</span>
              <span className="font-display tabular text-3xl leading-none text-accent-text sm:text-4xl">
                {formatHeat(top.heatScore)}
              </span>
              <span className="mt-1 text-[0.6rem] font-semibold text-accent-text">
                {top.heatLabel}
              </span>
            </div>
          </div>
        </div>

        <p className="mt-8 text-[0.68rem] text-ink-subtle">
          {COPY.indicatorDescription} · 출처 KOBIS
        </p>
      </div>
    </section>
  );
}
