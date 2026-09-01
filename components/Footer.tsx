import Link from 'next/link';
import { SITE } from '@/lib/site';

export default function Footer() {
  return (
    <footer className="mt-4 border-t border-border bg-surface">
      <div className="mx-auto max-w-content px-4 py-8 text-xs leading-relaxed text-fg-subtle">
        <p className="font-semibold text-fg-muted">
          {SITE.wordmark} {SITE.wordmarkKo}
        </p>

        <p className="mt-2">
          박스오피스 데이터 출처 · 영화진흥위원회 영화관입장권 통합전산망(KOBIS)
          <br />
          영화 상세정보 출처 · 한국영화데이터베이스(KMDb)
        </p>

        <p className="mt-2">
          본 서비스는 각 기관의 공개 API를 실시간으로 조회해 보여주며 데이터를 별도로 저장하지
          않습니다. 흥행 온도는 {SITE.name}의 자체 지표이며 각 기관의 공식 지표가 아닙니다.
        </p>

        <nav className="mt-4 flex gap-4" aria-label="footer">
          <Link href="/privacy" className="underline underline-offset-2 hover:text-fg">
            개인정보처리방침
          </Link>
          <a
            href="https://www.kobis.or.kr"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 hover:text-fg"
          >
            KOBIS
          </a>
          <a
            href="https://www.kmdb.or.kr"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 hover:text-fg"
          >
            KMDb
          </a>
        </nav>
      </div>
    </footer>
  );
}
