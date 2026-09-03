'use client';

import { useId, useState } from 'react';
import MovieDetail from '@/components/MovieDetail';
import Poster from '@/components/Poster';
import StatusBadge from '@/components/StatusBadge';
import { track } from '@/lib/analytics';
import { formatOpenDate } from '@/lib/date';
import { formatAudience, formatHeat, formatPercent, formatRankDelta } from '@/lib/format';
import type { RankedMovie } from '@/types/movie';

/**
 * 1위 영화를 크게 다루는 피처 카드.
 * 포스터를 가장 크게 노출해 화면 상단의 시각적 앵커로 삼는다.
 */
export default function FeatureCard({
  movie,
  posterUrl,
}: {
  movie: RankedMovie;
  posterUrl: string | null;
}) {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  const delta = formatRankDelta(movie.rankDelta, movie.isNew);
  const openDate = formatOpenDate(movie.openDate);

  const toggle = () => {
    const next = !open;
    setOpen(next);
    if (next) track('movie_detail_open', { movie_code: movie.movieCode, title: movie.title });
  };

  return (
    <li className="overflow-hidden rounded-card border border-border bg-surface shadow-[0_1px_2px_rgba(16,16,20,0.04)]">
      <div className="flex gap-4 px-4 pt-4">
        <Poster
          src={posterUrl}
          alt={`${movie.title} 포스터`}
          rank={movie.rank}
          priority
          className="w-[38%] max-w-[150px] min-w-[96px]"
        />

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-center gap-2">
            <span className="rounded bg-accent px-1.5 py-0.5 text-[0.65rem] font-semibold tracking-wider text-white">
              TODAY #1
            </span>
            <span className="text-[0.65rem] text-fg-subtle">출처 KOBIS</span>
          </div>

          <h2 className="font-display mt-2 text-xl leading-tight break-keep text-fg">
            <span className="sr-only">1위 </span>
            {movie.title}
          </h2>

          <div className="mt-2 flex flex-wrap items-center gap-2">
            <StatusBadge status={movie.status} />
            <span className="font-display tabular text-2xl leading-none text-accent-text">
              {formatHeat(movie.heatScore)}
            </span>
            <span className="text-xs font-semibold text-fg-muted">{movie.heatLabel}</span>
          </div>

          <div
            className="mt-2 h-1 w-full max-w-[160px] overflow-hidden rounded-full bg-surface-muted"
            role="img"
            aria-label={`흥행 온도 100점 만점에 ${movie.heatScore}점, ${movie.heatLabel}`}
          >
            <div
              className="h-full rounded-full bg-gradient-to-r from-accent to-new"
              style={{ width: `${movie.heatScore}%` }}
            />
          </div>

        </div>
      </div>

      {/* 통계는 카드 전체 폭을 쓴다. 320px 에서도 관객수가 잘리지 않아야 한다. */}
      <dl className="mt-3 space-y-0.5 px-4 text-[0.82rem]">
        <Row label="순위 변화" value={delta.text} srValue={delta.label} />
        <Row label="어제 관객" value={formatAudience(movie.audienceToday)} />
        <Row label="누적 관객" value={formatAudience(movie.audienceTotal)} />
        <Row label="관객 변화" value={formatPercent(movie.audienceChange)} />
        {openDate ? <Row label="개봉" value={openDate} /> : null}
      </dl>

      <div className="px-4 pt-3 pb-4">
        <button
          type="button"
          onClick={toggle}
          aria-expanded={open}
          aria-controls={panelId}
          className="w-full rounded-md bg-accent px-3 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          {open ? '정보 닫기' : '정보 보기'}
          <span className="sr-only"> — {movie.title}</span>
        </button>
      </div>

      <div id={panelId} hidden={!open}>
        {open ? <MovieDetail movie={movie} /> : null}
      </div>
    </li>
  );
}

function Row({ label, value, srValue }: { label: string; value: string; srValue?: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="shrink-0 text-fg-subtle">{label}</dt>
      <dd className="tabular min-w-0 truncate text-right font-semibold text-fg">
        {value}
        {srValue ? <span className="sr-only"> {srValue}</span> : null}
      </dd>
    </div>
  );
}
