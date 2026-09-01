import AdSlot from '@/components/AdSlot';
import MovieCard from '@/components/MovieCard';
import type { RankedMovie } from '@/types/movie';

/**
 * TOP 10 목록.
 * 광고 Slot B 는 5위와 6위 사이에 들어가며 콘텐츠보다 먼저 나오지 않는다.
 */
export default function MovieList({ movies }: { movies: RankedMovie[] }) {
  const head = movies.slice(0, 5);
  const tail = movies.slice(5);

  return (
    <section className="px-4 py-2" aria-label="박스오피스 TOP 10">
      <ol className="flex flex-col gap-3">
        {head.map((movie) => (
          <MovieCard key={movie.movieCode || movie.rank} movie={movie} />
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

      <ol className="flex flex-col gap-3" start={head.length + 1}>
        {tail.map((movie) => (
          <MovieCard key={movie.movieCode || movie.rank} movie={movie} />
        ))}
      </ol>
    </section>
  );
}
