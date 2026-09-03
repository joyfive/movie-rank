import AdSlot from '@/components/AdSlot';
import FeatureCard from '@/components/FeatureCard';
import MovieCard from '@/components/MovieCard';
import type { RankedMovie } from '@/types/movie';

interface MovieListProps {
  movies: RankedMovie[];
  /** movieCode → 포스터 URL. 포스터가 OFF 이거나 매칭에 실패하면 비어 있다. */
  posters: Record<string, string>;
}

/**
 * TOP 10 목록. 1위는 피처 카드로 크게, 나머지는 가로형 행으로 노출한다.
 * 광고 Slot B 는 5위와 6위 사이에 들어가며 콘텐츠보다 먼저 나오지 않는다.
 */
export default function MovieList({ movies, posters }: MovieListProps) {
  const [feature, ...rest] = movies;
  if (!feature) return null;

  const head = rest.slice(0, 4);
  const tail = rest.slice(4);

  return (
    <section className="px-4 py-2" aria-label="박스오피스 TOP 10">
      <ol className="flex flex-col gap-3">
        <FeatureCard movie={feature} posterUrl={posters[feature.movieCode] ?? null} />
        {head.map((movie) => (
          <MovieCard
            key={movie.movieCode || movie.rank}
            movie={movie}
            posterUrl={posters[movie.movieCode] ?? null}
          />
        ))}
      </ol>

      {tail.length > 0 ? (
        <div className="-mx-4 my-3">
          <AdSlot
            slotId={process.env.NEXT_PUBLIC_ADSENSE_SLOT_B}
            label="광고 영역 B"
            minHeight={250}
          />
        </div>
      ) : null}

      <ol className="flex flex-col gap-3" start={movies.length - tail.length + 1}>
        {tail.map((movie) => (
          <MovieCard
            key={movie.movieCode || movie.rank}
            movie={movie}
            posterUrl={posters[movie.movieCode] ?? null}
          />
        ))}
      </ol>
    </section>
  );
}
