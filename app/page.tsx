import AdSlot from '@/components/AdSlot';
import Hero from '@/components/Hero';
import Methodology from '@/components/Methodology';
import MovieList from '@/components/MovieList';
import SummaryStrip from '@/components/SummaryStrip';
import { toIsoDate } from '@/lib/date';
import { fetchLatestBoxOffice } from '@/lib/kobis';
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

function BoxOfficeError() {
  return (
    <section className="px-4 py-16 text-center">
      <h1 className="text-xl font-bold text-fg">{COPY.heroTitle}</h1>
      <p className="mx-auto mt-4 max-w-sm text-sm leading-relaxed text-fg-muted">
        {COPY.boxOfficeError}
      </p>
    </section>
  );
}

export default async function HomePage() {
  const snapshot = await fetchLatestBoxOffice();

  if (!snapshot) {
    return <BoxOfficeError />;
  }

  const { targetDate, movies } = snapshot;

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
