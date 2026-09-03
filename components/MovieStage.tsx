'use client';

import { useId, useState } from 'react';
import HeatBadge from '@/components/HeatBadge';
import MovieDetail from '@/components/MovieDetail';
import Poster from '@/components/Poster';
import StatusBadge from '@/components/StatusBadge';
import { track } from '@/lib/analytics';
import { formatOpenDate } from '@/lib/date';
import { formatAudience, formatPercent, formatRankDelta } from '@/lib/format';
import type { RankedMovie } from '@/types/movie';

/**
 * 통계 한 줄.
 * 모바일은 좌우 정렬 행, PC 는 라벨 위 / 값 아래의 블록이 된다.
 * 풀폭에서 값이 화면 끝까지 늘어지지 않도록 하기 위함이다.
 */
function Row({ label, value, srValue }: { label: string; value: string; srValue?: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-border/70 py-1.5 lg:flex-col lg:items-start lg:gap-1 lg:border-b-0 lg:border-l lg:border-border lg:py-0 lg:pl-3">
      <dt className="shrink-0 text-fg-subtle lg:text-xs">{label}</dt>
      <dd className="tabular min-w-0 text-right font-semibold text-fg lg:text-left lg:text-lg">
        {value}
        {srValue ? <span className="sr-only"> {srValue}</span> : null}
      </dd>
    </div>
  );
}

/**
 * 갤러리에서 선택된 한 편을 크게 보여주는 스테이지.
 *
 * 10편의 스테이지를 모두 렌더하고 선택되지 않은 것은 hidden 으로 둔다.
 * 검색봇이 JavaScript 실행 없이도 TOP 10 의 영화명과 지표를 읽을 수 있어야 하기 때문이다.
 */
export default function MovieStage({
  movie,
  posterUrl,
  panelId,
  tabId,
  hidden,
}: {
  movie: RankedMovie;
  posterUrl: string | null;
  panelId: string;
  tabId: string;
  hidden: boolean;
}) {
  const [open, setOpen] = useState(false);
  const detailId = useId();

  const delta = formatRankDelta(movie.rankDelta, movie.isNew);
  const openDate = formatOpenDate(movie.openDate);

  const toggle = () => {
    const next = !open;
    setOpen(next);
    if (next) track('movie_detail_open', { movie_code: movie.movieCode, title: movie.title });
  };

  return (
    <div role="tabpanel" id={panelId} aria-labelledby={tabId} hidden={hidden}>
      <div className="stage relative">
        {/* 순위를 고스트 숫자로 크게 깐다. 포스터와 텍스트가 그 위에 얹힌다. */}
        <span
          aria-hidden="true"
          className="font-display tabular pointer-events-none absolute right-0 bottom-2 z-0 text-[6.5rem] leading-[0.8] text-surface-muted select-none sm:text-[10rem] lg:top-0 lg:bottom-auto lg:text-[16rem]"
        >
          {String(movie.rank).padStart(2, '0')}
        </span>

        <div className="stage-poster relative z-10 mb-7">
          <Poster
            src={posterUrl}
            alt={`${movie.title} 포스터`}
            rank={movie.rank}
            priority={movie.rank === 1}
            className="w-full shadow-[0_8px_28px_rgba(16,16,20,0.16)]"
          />
          <div className="absolute -right-4 -bottom-5 sm:-right-6 lg:-right-7">
            <HeatBadge score={movie.heatScore} label={movie.heatLabel} />
          </div>
        </div>

        <div className="stage-title relative z-10 min-w-0 pt-1">
          <div className="flex items-center gap-2">
            <span className="tabular bg-accent px-1.5 py-0.5 text-[0.7rem] font-semibold text-white">
              {movie.rank}위
            </span>
            <StatusBadge status={movie.status} />
          </div>

          <h2 className="font-display mt-2.5 text-[1.6rem] leading-[1.1] text-fg sm:text-4xl lg:text-6xl">
            {movie.title}
          </h2>

          <p className="mt-2 text-xs font-semibold text-fg-muted lg:mt-4 lg:text-sm">
            {movie.heatLabel}
            {openDate ? <span className="text-fg-subtle"> · {openDate} 개봉</span> : null}
          </p>
        </div>

        <dl className="stage-stats relative z-10 mt-4 text-[0.85rem] lg:mt-9 lg:grid lg:max-w-3xl lg:grid-cols-4 lg:gap-x-6">
          <Row label="순위 변화" value={delta.text} srValue={delta.label} />
          <Row label="어제 관객" value={formatAudience(movie.audienceToday)} />
          <Row label="누적 관객" value={formatAudience(movie.audienceTotal)} />
          <Row label="관객 변화" value={formatPercent(movie.audienceChange)} />
        </dl>

        <div className="stage-cta relative z-10">
          <p className="mt-2 text-[0.68rem] text-fg-subtle">출처 KOBIS</p>

          <button
            type="button"
            onClick={toggle}
            aria-expanded={open}
            aria-controls={detailId}
            className="mt-4 w-full rounded-full bg-accent px-5 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 sm:w-auto sm:min-w-[220px]"
          >
            {open ? '영화 정보 닫기' : '영화 정보 보기'}
            <span className="sr-only"> — {movie.title}</span>
          </button>

          <div id={detailId} hidden={!open} className="mt-4 lg:max-w-3xl">
            {open ? (
              <div className="overflow-hidden rounded-card border border-border">
                <MovieDetail movie={movie} />
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
