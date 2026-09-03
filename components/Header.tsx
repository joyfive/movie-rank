import Link from 'next/link';
import { SITE } from '@/lib/site';

/**
 * 다크 밴드 헤더.
 * MVP 라우트가 `/` 하나뿐이라 별도 GNB 는 두지 않는다(PRD 4.1).
 * 워드마크는 텍스트 기반이라 서비스명 변경이 쉽다.
 */
export default function Header() {
  return (
    <header className="bg-ink">
      <div className="gutter flex items-center justify-between py-4">
        <Link href="/" className="flex items-baseline gap-2">
          <span className="font-display text-xl leading-none text-ink-fg">
            Cine<span className="text-accent-text">Gauge</span>
          </span>
          <span className="text-xs text-ink-subtle">{SITE.wordmarkKo}</span>
        </Link>

        <p className="text-[0.7rem] tracking-widest text-ink-subtle uppercase">Daily Box Office</p>
      </div>
    </header>
  );
}
