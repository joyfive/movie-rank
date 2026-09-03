'use client';

import { useId, useState } from 'react';
import MovieDetail from '@/components/MovieDetail';
import Poster from '@/components/Poster';
import StatusBadge from '@/components/StatusBadge';
import { track } from '@/lib/analytics';
import { formatOpenDate } from '@/lib/date';
import { formatAudience, formatHeat, formatPercent, formatRankDelta } from '@/lib/format';
import type { RankedMovie } from '@/types/movie';

function Stat({ label, value, srValue }: { label: string; value: string; srValue?: string }) {
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

/**
 * 2위 이하 영화 카드. 포스터를 왼쪽에 두는 가로형 행이다.
 * 카드 전체를 클릭영역으로 만들지 않고 [정보 보기] 버튼을 명시한다.
 * KOBIS 영역과 KMDb 영역의 출처를 분리해 표기한다.
 */
export default function MovieCard({
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
    <li className="overflow-hidden rounded-card border border-border bg-surface">
      <div className="flex gap-3.5 p-3.5">
        <Poster
          src={posterUrl}
          alt={`${movie.title} 포스터`}
          rank={movie.rank}
          className="w-[24%] max-w-[100px] min-w-[68px]"
        />

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-start justify-between gap-2">
            <div className="flex min-w-0 items-baseline gap-2">
              <span className="font-display tabular shrink-0 text-2xl leading-none text-accent">
                {String(movie.rank).padStart(2, '0')}
              </span>
              <h2 className="font-display min-w-0 text-[0.95rem] leading-snug break-keep text-fg">
                <span className="sr-only">{movie.rank}위 </span>
                {movie.title}
              </h2>
            </div>

            <span className="text-[0.65rem] whitespace-nowrap text-fg-subtle">출처 KOBIS</span>
          </div>

          <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1">
            <StatusBadge status={movie.status} />
            <span className="font-display tabular text-lg leading-none text-accent-text">
              {formatHeat(movie.heatScore)}
            </span>
            <span className="text-[0.7rem] text-fg-muted">{movie.heatLabel}</span>
          </div>

          <div
            className="mt-1.5 h-[3px] w-full max-w-[120px] overflow-hidden rounded-full bg-surface-muted"
            role="img"
            aria-label={`흥행 온도 100점 만점에 ${movie.heatScore}점, ${movie.heatLabel}`}
          >
            <div
              className="h-full rounded-full bg-gradient-to-r from-accent to-new"
              style={{ width: `${movie.heatScore}%` }}
            />
          </div>

          <dl className="mt-2.5 space-y-0.5 text-[0.75rem]">
            <Stat label="순위 변화" value={delta.text} srValue={delta.label} />
            <Stat label="어제 관객" value={formatAudience(movie.audienceToday)} />
            <Stat label="누적 관객" value={formatAudience(movie.audienceTotal)} />
            <Stat label="관객 변화" value={formatPercent(movie.audienceChange)} />
            {openDate ? <Stat label="개봉" value={openDate} /> : null}
          </dl>
        </div>
      </div>

      <div className="px-3.5 pb-3.5">
        <button
          type="button"
          onClick={toggle}
          aria-expanded={open}
          aria-controls={panelId}
          className="w-full rounded-md border border-border-strong bg-surface-2 px-3 py-2 text-[0.82rem] font-semibold text-fg transition-colors hover:border-accent hover:text-accent-text"
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
