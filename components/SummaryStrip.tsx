import Poster from '@/components/Poster';
import { formatAudience, formatHeat } from '@/lib/format';
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

/** 가장 높은 순위로 진입한 신규 영화. 신규가 없으면 null. */
export function pickNewEntry(movies: RankedMovie[]): RankedMovie | null {
  return movies.filter((movie) => movie.isNew).sort((a, b) => a.rank - b.rank)[0] ?? null;
}

interface CardProps {
  icon: string;
  label: string;
  tone: 'accent' | 'up' | 'new';
  movie: RankedMovie | null;
  posterUrl: string | null;
  rows: Array<{ label: string; value: string; strong?: boolean }>;
  empty?: string;
}

const TONE: Record<CardProps['tone'], string> = {
  accent: 'bg-accent-soft text-accent-text',
  up: 'bg-up-soft text-up',
  new: 'bg-new-soft text-new',
};

function Card({ icon, label, tone, movie, posterUrl, rows, empty }: CardProps) {
  return (
    <div className="rounded-card border border-border bg-surface p-4">
      <p className="flex items-center gap-2">
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[0.68rem] font-bold ${TONE[tone]}`}
        >
          <span aria-hidden="true">{icon}</span>
          {label}
        </span>
      </p>

      {movie ? (
        <div className="mt-3 flex gap-3">
          <Poster
            src={posterUrl}
            alt=""
            rank={movie.rank}
            className="w-[72px] shrink-0 sm:w-[88px]"
          />

          <div className="flex min-w-0 flex-1 flex-col">
            <p className="font-display truncate text-[0.95rem] text-fg" title={movie.title}>
              {movie.title}
            </p>

            <dl className="mt-2 space-y-1 text-[0.75rem]">
              {rows.map((row) => (
                <div key={row.label} className="flex items-baseline justify-between gap-2">
                  <dt className="shrink-0 text-fg-subtle">{row.label}</dt>
                  <dd
                    className={`tabular truncate text-right font-semibold ${
                      row.strong ? 'text-accent-text' : 'text-fg'
                    }`}
                  >
                    {row.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      ) : (
        <p className="mt-4 text-sm text-fg-subtle">{empty}</p>
      )}
    </div>
  );
}

export default function SummaryStrip({
  movies,
  posters,
}: {
  movies: RankedMovie[];
  posters: Record<string, string>;
}) {
  const top = pickTopMovie(movies);
  const riser = pickBiggestRiser(movies);
  const fresh = pickNewEntry(movies);
  const newCount = countNewEntries(movies);

  if (!top) return null;

  const poster = (movie: RankedMovie | null) =>
    movie ? (posters[movie.movieCode] ?? null) : null;

  return (
    <section aria-label="오늘의 요약" className="gutter -mt-6 relative z-10">
      <div className="grid gap-3 lg:grid-cols-3">
        <Card
          icon="👑"
          label="오늘 1위"
          tone="accent"
          movie={top}
          posterUrl={poster(top)}
          rows={[
            { label: '어제 관객', value: formatAudience(top.audienceToday) },
            { label: '흥행 온도', value: formatHeat(top.heatScore), strong: true },
          ]}
        />

        <Card
          icon="▲"
          label="가장 급상승"
          tone="up"
          movie={riser}
          posterUrl={poster(riser)}
          rows={[
            {
              label: '순위 상승',
              value: riser && riser.rankDelta > 0 ? `▲ ${riser.rankDelta}` : '변동 없음',
            },
            {
              label: '흥행 온도',
              value: riser ? formatHeat(riser.heatScore) : '-',
              strong: true,
            },
          ]}
          empty="상승한 영화가 없습니다."
        />

        <Card
          icon="NEW"
          label={`신규 진입 ${newCount}편`}
          tone="new"
          movie={fresh}
          posterUrl={poster(fresh)}
          rows={[
            { label: '순위', value: fresh ? `${fresh.rank}위` : '-' },
            {
              label: '흥행 온도',
              value: fresh ? formatHeat(fresh.heatScore) : '-',
              strong: true,
            },
          ]}
          empty="오늘은 신규 진입작이 없습니다."
        />
      </div>
    </section>
  );
}
