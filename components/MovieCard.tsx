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
    <div className="flex items-baseline justify-between gap-3 py-[3px]">
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
 * 포스터가 OFF 인 상태이므로 대형 순위 숫자와 흥행 온도가 시각적 앵커 역할을 한다.
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
      <div className="px-4 pt-3.5 pb-3">
        <div className="mb-2.5 flex items-center justify-between gap-2">
          <h3 className="text-[0.68rem] tracking-widest text-fg-subtle uppercase">Box Office</h3>
          <span className="text-[0.68rem] text-fg-subtle">출처 KOBIS</span>
        </div>

        <div className="flex items-start gap-3">
          <span
            className="font-display tabular w-12 shrink-0 text-[2.75rem] leading-[0.85] text-accent"
            aria-hidden="true"
          >
            {String(movie.rank).padStart(2, '0')}
          </span>

          <div className="min-w-0 flex-1">
            <h2 className="font-display text-[1.05rem] leading-snug break-keep text-fg">
              <span className="sr-only">{movie.rank}위 </span>
              {movie.title}
            </h2>

            <div className="mt-2">
              <StatusBadge status={movie.status} />
            </div>
          </div>

          <HeatScore score={movie.heatScore} label={movie.heatLabel} />
        </div>

        <dl className="mt-3.5 border-t border-border pt-2.5 text-[0.82rem]">
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
          className="w-full rounded-md border border-border-strong bg-surface-2 px-3 py-2.5 text-sm font-semibold text-fg transition-colors hover:border-accent hover:text-accent-text"
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
