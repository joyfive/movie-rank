'use client';

import { useId, useState } from 'react';
import HeatScore from '@/components/HeatScore';
import MovieDetail from '@/components/MovieDetail';
import StatusBadge from '@/components/StatusBadge';
import { track } from '@/lib/analytics';
import { formatOpenDate } from '@/lib/date';
import { formatAudience, formatPercent, formatRankDelta } from '@/lib/format';
import type { RankedMovie } from '@/types/movie';

function Stat({
  label,
  value,
  srValue,
}: {
  label: string;
  value: string;
  srValue?: string;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3 py-1">
      <span className="shrink-0 text-fg-subtle">{label}</span>
      <span className="tabular min-w-0 truncate text-right font-semibold text-fg">
        {value}
        {srValue ? <span className="sr-only"> {srValue}</span> : null}
      </span>
    </div>
  );
}

/**
 * 세로형 영화 카드.
 * 카드 전체를 클릭영역으로 만들지 않고 [정보 보기] 버튼을 명시한다.
 * KOBIS 영역과 KMDb 영역의 출처를 분리해 표기한다.
 */
export default function MovieCard({ movie }: { movie: RankedMovie }) {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  const delta = formatRankDelta(movie.rankDelta, movie.isNew);
  const openDate = formatOpenDate(movie.openDate);

  const toggle = () => {
    const next = !open;
    setOpen(next);
    if (next) {
      track('movie_detail_open', { movie_code: movie.movieCode, title: movie.title });
    }
  };

  return (
    <li className="overflow-hidden rounded-card border border-border bg-surface">
      <div className="px-4 pt-4 pb-3">
        <div className="mb-2 flex items-baseline justify-between gap-2">
          <h3 className="text-xs font-bold tracking-wide text-fg-muted">박스오피스</h3>
          <span className="text-xs text-fg-subtle">출처 KOBIS</span>
        </div>

        <div className="flex items-start gap-3">
          <span
            className="tabular w-11 shrink-0 text-3xl leading-none font-extrabold text-fg"
            aria-hidden="true"
          >
            {movie.rank}
          </span>

          <div className="min-w-0 flex-1">
            <h2 className="text-base leading-snug font-bold break-keep text-fg">
              <span className="sr-only">{movie.rank}위 </span>
              {movie.title}
            </h2>

            <div className="mt-2">
              <StatusBadge status={movie.status} />
            </div>
          </div>

          <HeatScore score={movie.heatScore} label={movie.heatLabel} />
        </div>

        <dl className="mt-3 border-t border-border pt-2 text-sm">
          <Stat label="순위 변화" value={delta.text} srValue={delta.label} />
          <Stat label="어제 관객" value={formatAudience(movie.audienceToday)} />
          <Stat label="누적 관객" value={formatAudience(movie.audienceTotal)} />
          <Stat label="관객 변화" value={formatPercent(movie.audienceChange)} />
          {openDate ? <Stat label="개봉" value={openDate} /> : null}
        </dl>
      </div>

      <div className="px-4 pb-4">
        <button
          type="button"
          onClick={toggle}
          aria-expanded={open}
          aria-controls={panelId}
          className="w-full rounded-md border border-border-strong bg-surface-muted px-3 py-2.5 text-sm font-semibold text-fg hover:bg-surface"
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
