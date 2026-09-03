'use client';

import Poster from '@/components/Poster';
import { formatHeat } from '@/lib/format';
import type { RankedMovie } from '@/types/movie';

interface PosterTileProps {
  movie: RankedMovie;
  posterUrl: string | null;
  selected: boolean;
  tabId: string;
  panelId: string;
  onSelect: () => void;
  onKeyDown: (event: React.KeyboardEvent<HTMLButtonElement>) => void;
  tileRef: (node: HTMLButtonElement | null) => void;
}

/**
 * 갤러리의 포스터 한 장. 탭 역할을 하며 선택 시 스테이지가 바뀐다.
 * 선택된 항목은 레드 블록 위로 올라와 한 장만 강조된다.
 * 제목은 검색봇과 스크린리더를 위해 항상 HTML 에 존재한다.
 */
export default function PosterTile({
  movie,
  posterUrl,
  selected,
  tabId,
  panelId,
  onSelect,
  onKeyDown,
  tileRef,
}: PosterTileProps) {
  return (
    <button
      ref={tileRef}
      type="button"
      role="tab"
      id={tabId}
      aria-selected={selected}
      aria-controls={panelId}
      tabIndex={selected ? 0 : -1}
      onClick={onSelect}
      onKeyDown={onKeyDown}
      className="group relative w-[96px] shrink-0 snap-start pt-3 pb-2 text-left sm:w-[124px] lg:w-auto"
    >
      {/* 선택된 한 장의 뒤를 레드 블록이 받친다. */}
      <span
        aria-hidden="true"
        className={`absolute inset-x-0 top-0 bottom-0 -z-10 bg-accent transition-opacity ${
          selected ? 'opacity-100' : 'opacity-0'
        }`}
      />

      <Poster
        src={posterUrl}
        alt=""
        rank={movie.rank}
        priority={movie.rank <= 3}
        className={`w-full transition-transform ${
          selected
            ? 'scale-[1.04] shadow-[0_6px_20px_rgba(16,16,20,0.28)]'
            : 'opacity-85 group-hover:opacity-100'
        }`}
      />

      <div className="mt-2 px-1.5">
        <p
          className={`tabular text-[0.7rem] leading-none font-semibold lg:text-xs ${
            selected ? 'text-white' : 'text-accent-text'
          }`}
        >
          {movie.rank}
          <span className="sr-only">위 </span>
          <span className={selected ? 'text-white/70' : 'text-fg-subtle'}>
            {' · '}
            {formatHeat(movie.heatScore)}
          </span>
        </p>
        <p
          className={`mt-1 line-clamp-2 text-[0.72rem] leading-snug lg:text-sm ${
            selected ? 'text-white' : 'text-fg-muted'
          }`}
        >
          {movie.title}
        </p>
      </div>
    </button>
  );
}
