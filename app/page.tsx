import AdSlot from '@/components/AdSlot';
import Hero from '@/components/Hero';
import Methodology from '@/components/Methodology';
import MovieList from '@/components/MovieList';
import SummaryStrip from '@/components/SummaryStrip';
import { toIsoDate } from '@/lib/date';
import { fetchLatestBoxOffice, type BoxOfficeFailure } from '@/lib/kobis';
import { COPY, SITE } from '@/lib/site';
import type { RankedMovie } from '@/types/movie';

// KOBIS 는 요청 시점마다 서버에서 조회한다. 장기 서버 캐싱을 하지 않는다.
export const dynamic = 'force-dynamic';
export const revalidate = 0;

/** 검색봇이 JavaScript 실행 없이도 TOP 10 을 읽을 수 있도록 ItemList JSON-LD 를 넣는다. */
function itemListJsonLd(movies: RankedMovie[], targetDate: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `${toIsoDate(targetDate)} 박스오피스 TOP 10`,
    url: `${SITE.url}/`,
    numberOfItems: movies.length,
    itemListOrder: 'https://schema.org/ItemListOrderAscending',
    itemListElement: movies.map((movie) => ({
      '@type': 'ListItem',
      position: movie.rank,
      name: movie.title,
    })),
  };
}

/**
 * Production 에서는 PRD 문구만 노출한다.
 * 원인은 서버 로그에 남고, 개발 환경에서만 화면에도 함께 보여준다.
 */
function BoxOfficeError({ failure }: { failure: BoxOfficeFailure }) {
  const showDetail = process.env.NODE_ENV !== 'production';

  return (
    <section className="px-4 py-16 text-center">
      <h1 className="font-display text-2xl text-fg">{COPY.heroTitle}</h1>
      <p className="mx-auto mt-4 max-w-sm text-sm leading-relaxed text-fg-muted">
        {COPY.boxOfficeError}
      </p>

      {showDetail ? (
        <p className="mx-auto mt-6 max-w-md rounded-card border border-dashed border-border bg-surface-muted px-4 py-3 text-left text-xs leading-relaxed text-fg-subtle">
          <span className="font-bold">[개발 전용] {failure.reason}</span>
          <br />
          {failure.detail}
        </p>
      ) : null}
    </section>
  );
}

export default async function HomePage() {
  const result = await fetchLatestBoxOffice();

  if (result.status === 'FAILED') {
    return <BoxOfficeError failure={result.failure} />;
  }

  const { targetDate, movies } = result.snapshot;

  return (
    <>
      <script
        type="application/ld+json"
        // JSON-LD 는 서버에서 생성한 정적 데이터다.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd(movies, targetDate)) }}
      />

      <Hero targetDate={targetDate} />
      <SummaryStrip movies={movies} />

      <div className="py-4">
        <AdSlot slotId={process.env.NEXT_PUBLIC_ADSENSE_SLOT_A} label="광고 영역 A" minHeight={100} />
      </div>

      <MovieList movies={movies} />
      <Methodology />
    </>
  );
}
