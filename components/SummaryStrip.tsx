import { formatHeat } from '@/lib/format';
import type { RankedMovie } from '@/types/movie';

/** TOP 10 결과만으로 계산한다. 별도 API 호출을 하지 않는다. */
export function pickTopMovie(movies: RankedMovie[]): RankedMovie | null {
  return movies.find((movie) => movie.rank === 1) ?? movies[0] ?? null;
}

/** rankInten 이 가장 큰 영화. 동점이면 현재 순위가 높은 영화를 우선한다. */
export function pickBiggestRiser(movies: RankedMovie[]): RankedMovie | null {
  const candidates = movies.filter((movie) => !movie.isNew);
  const pool = candidates.length > 0 ? candidates : movies;

  return pool.reduce<RankedMovie | null>((best, movie) => {
    if (!best) return movie;
    if (movie.rankDelta > best.rankDelta) return movie;
    if (movie.rankDelta === best.rankDelta && movie.rank < best.rank) return movie;
    return best;
  }, null);
}

export function countNewEntries(movies: RankedMovie[]): number {
  return movies.filter((movie) => movie.isNew).length;
}

function Cell({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="min-w-0 flex-1 px-2.5 py-3.5 text-center lg:py-5">
      <div className="text-[0.68rem] tracking-wide text-fg-subtle lg:text-sm">{label}</div>
      <div className="font-display mt-1.5 truncate text-sm text-fg lg:text-xl" title={value}>
        {value}
      </div>
      {sub ? <div className="tabular mt-1 text-[0.7rem] text-accent-text">{sub}</div> : null}
    </div>
  );
}

export default function SummaryStrip({ movies }: { movies: RankedMovie[] }) {
  const top = pickTopMovie(movies);
  const riser = pickBiggestRiser(movies);
  const newCount = countNewEntries(movies);

  if (!top) return null;

  return (
    <section aria-label="오늘의 요약" className="gutter">
      <div className="flex divide-x divide-border rounded-card border border-border bg-surface">
        <Cell label="오늘 1위" value={top.title} sub={formatHeat(top.heatScore)} />
        <Cell
          label="가장 급상승"
          value={riser ? riser.title : '-'}
          sub={riser && riser.rankDelta > 0 ? `▲${riser.rankDelta}계단` : '변동 없음'}
        />
        <Cell label="신규 진입" value={`${newCount}편`} />
      </div>
    </section>
  );
}
