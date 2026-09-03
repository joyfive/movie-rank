'use client';

import { useCallback, useId, useRef, useState, type ReactNode } from 'react';
import MovieStage from '@/components/MovieStage';
import PosterTile from '@/components/PosterTile';
import type { RankedMovie } from '@/types/movie';

interface BoxOfficeGalleryProps {
  movies: RankedMovie[];
  /** movieCode → 포스터 URL. 포스터가 OFF 이거나 매칭에 실패하면 비어 있다. */
  posters: Record<string, string>;
  /** 5위와 6위 사이에 들어가는 광고 슬롯. 서버 컴포넌트를 그대로 받는다. */
  adSlot?: ReactNode;
}

/**
 * 포스터 갤러리에서 한 편을 고르면 위쪽 스테이지가 그 영화로 바뀐다.
 *
 * - 갤러리는 tablist, 스테이지는 tabpanel 이다. 좌우 방향키로 이동한다.
 * - 스테이지 10개를 모두 렌더하고 선택되지 않은 것은 hidden 으로 둔다.
 *   검색봇이 JavaScript 없이도 TOP 10 을 읽을 수 있어야 하기 때문이다.
 * - 광고 Slot B 는 5위와 6위 사이에 들어간다.
 */
export default function BoxOfficeGallery({ movies, posters, adSlot }: BoxOfficeGalleryProps) {
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
    <section aria-label="박스오피스 TOP 10">
      <div className="px-4">
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

      <div className="mt-8">
        <div className="flex items-baseline justify-between px-4">
          <h2 className="font-display text-sm text-fg">
            TOP 10 <span className="text-fg-subtle">1–5위</span>
          </h2>
          <p className="text-[0.68rem] text-fg-subtle">포스터를 눌러 자세히 보기</p>
        </div>

        <Rail label="1위부터 5위까지">{head.map(renderTile)}</Rail>
      </div>

      {tail.length > 0 ? (
        <>
          <div className="my-5">{adSlot}</div>

          <h2 className="font-display px-4 text-sm text-fg">
            TOP 10 <span className="text-fg-subtle">6–10위</span>
          </h2>
          <Rail label="6위부터 10위까지">{tail.map((movie, index) => renderTile(movie, index + 5))}</Rail>
        </>
      ) : null}
    </section>
  );
}

/** 가로 레일. 페이지가 아니라 레일 안에서만 스크롤한다. */
function Rail({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div
      role="tablist"
      aria-label={label}
      aria-orientation="horizontal"
      className="mt-2.5 flex snap-x snap-mandatory gap-2 overflow-x-auto px-4 pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      {children}
    </div>
  );
}
