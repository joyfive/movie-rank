'use client';

import { useCallback, useId, useRef, useState, type ReactNode } from 'react';
import MovieStage from '@/components/MovieStage';
import PosterTile from '@/components/PosterTile';
import { formatTargetDate } from '@/lib/date';
import type { RankedMovie } from '@/types/movie';

interface BoxOfficeGalleryProps {
  movies: RankedMovie[];
  /** movieCode → 포스터 URL. 포스터가 OFF 이거나 매칭에 실패하면 비어 있다. */
  posters: Record<string, string>;
  targetDate: string;
  /** 5위와 6위 사이에 들어가는 광고 슬롯. 서버 컴포넌트를 그대로 받는다. */
  adSlot?: ReactNode;
}

/**
 * 포스터를 골라 위쪽 대형 카드를 바꾸는 TOP 10 영역.
 *
 * - 포스터 줄은 tablist, 대형 카드는 tabpanel 이다. 좌우 방향키로 이동한다.
 * - 대형 카드 10개를 모두 렌더하고 선택되지 않은 것은 hidden 으로 둔다.
 *   검색봇이 JavaScript 없이도 TOP 10 을 읽을 수 있어야 하기 때문이다.
 * - 광고 Slot B 는 5위와 6위 사이에 들어간다.
 */
export default function BoxOfficeGallery({
  movies,
  posters,
  targetDate,
  adSlot,
}: BoxOfficeGalleryProps) {
  const [selected, setSelected] = useState(0);
  const baseId = useId();
  const tileRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const tabId = (index: number) => `${baseId}-tab-${index}`;
  const panelId = (index: number) => `${baseId}-panel-${index}`;

  const focusTile = useCallback((index: number) => {
    setSelected(index);
    const node = tileRefs.current[index];
    node?.focus();
    node?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }, []);

  const handleKeyDown = useCallback(
    (index: number) => (event: React.KeyboardEvent<HTMLButtonElement>) => {
      const last = movies.length - 1;

      switch (event.key) {
        case 'ArrowRight':
          event.preventDefault();
          focusTile(index === last ? 0 : index + 1);
          break;
        case 'ArrowLeft':
          event.preventDefault();
          focusTile(index === 0 ? last : index - 1);
          break;
        case 'Home':
          event.preventDefault();
          focusTile(0);
          break;
        case 'End':
          event.preventDefault();
          focusTile(last);
          break;
        default:
          break;
      }
    },
    [focusTile, movies.length],
  );

  const renderTile = (movie: RankedMovie, index: number) => (
    <PosterTile
      key={movie.movieCode || movie.rank}
      movie={movie}
      posterUrl={posters[movie.movieCode] ?? null}
      selected={index === selected}
      tabId={tabId(index)}
      panelId={panelId(index)}
      onSelect={() => setSelected(index)}
      onKeyDown={handleKeyDown(index)}
      tileRef={(node) => {
        tileRefs.current[index] = node;
      }}
    />
  );

  const head = movies.slice(0, 5);
  const tail = movies.slice(5);

  return (
    <section id="box-office" aria-label="박스오피스 TOP 10" className="pt-10 lg:pt-16">
      <div className="gutter flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="font-display text-2xl text-fg lg:text-3xl">박스오피스 TOP 10</h2>
          <p className="mt-1 text-xs text-fg-muted">
            포스터를 선택하면 해당 영화의 지표를 볼 수 있습니다.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <p className="tabular text-xs text-fg-subtle">{formatTargetDate(targetDate)} 기준</p>
          <ArrowButton
            direction="prev"
            disabled={selected === 0}
            onClick={() => focusTile(Math.max(0, selected - 1))}
          />
          <ArrowButton
            direction="next"
            disabled={selected === movies.length - 1}
            onClick={() => focusTile(Math.min(movies.length - 1, selected + 1))}
          />
        </div>
      </div>

      <div className="gutter mt-4">
        {movies.map((movie, index) => (
          <MovieStage
            key={movie.movieCode || movie.rank}
            movie={movie}
            posterUrl={posters[movie.movieCode] ?? null}
            panelId={panelId(index)}
            tabId={tabId(index)}
            hidden={index !== selected}
          />
        ))}
      </div>

      <div className="mt-5">
        <Rail label="1위부터 5위까지">{head.map(renderTile)}</Rail>

        {tail.length > 0 ? (
          <>
            <div className="my-4">{adSlot}</div>
            <Rail label="6위부터 10위까지">
              {tail.map((movie, index) => renderTile(movie, index + 5))}
            </Rail>
          </>
        ) : null}
      </div>

      <ol className="mt-4 flex items-center justify-center gap-1.5" aria-hidden="true">
        {movies.map((movie, index) => (
          <li
            key={movie.movieCode || movie.rank}
            className={`h-1.5 rounded-full transition-all ${
              index === selected ? 'w-5 bg-accent' : 'w-1.5 bg-border-strong'
            }`}
          />
        ))}
      </ol>
    </section>
  );
}

function ArrowButton({
  direction,
  disabled,
  onClick,
}: {
  direction: 'prev' | 'next';
  disabled: boolean;
  onClick: () => void;
}) {
  const isPrev = direction === 'prev';

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={isPrev ? '이전 영화' : '다음 영화'}
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-surface text-fg-muted transition-colors hover:border-accent hover:text-accent-text disabled:opacity-30 disabled:hover:border-border disabled:hover:text-fg-muted"
    >
      <span aria-hidden="true">{isPrev ? '‹' : '›'}</span>
    </button>
  );
}

/**
 * 포스터 줄.
 * 모바일은 줄 안에서만 가로 스크롤하고, PC 는 5열 그리드로 폭을 채운다.
 */
function Rail({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div
      role="tablist"
      aria-label={label}
      aria-orientation="horizontal"
      className="gutter flex snap-x snap-mandatory gap-2 overflow-x-auto pb-1 sm:px-0 lg:grid lg:grid-cols-5 lg:gap-4 lg:overflow-visible [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      {children}
    </div>
  );
}
