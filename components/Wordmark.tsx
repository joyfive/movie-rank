'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SITE } from '@/lib/site';

/**
 * 워드마크. 서비스명 변경이 쉽도록 텍스트 기반으로 둔다(PRD 4.1).
 *
 * 홈에서 누르면 서버 왕복 없이 최상단으로 스크롤한다.
 * 홈은 force-dynamic 이라 같은 경로로 이동하면 KOBIS 를 다시 조회하게 되기 때문이다.
 * 다른 경로에서는 평범한 링크로 동작한다.
 */
export default function Wordmark() {
  const pathname = usePathname();

  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    // 새 탭/새 창으로 여는 조작은 그대로 둔다.
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) {
      return;
    }
    if (pathname !== '/') return;

    event.preventDefault();

    const prefersReducedMotion =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
  };

  return (
    <Link
      href="/"
      onClick={handleClick}
      aria-label={`${SITE.name} ${SITE.nameKo} 홈으로`}
      className="flex items-baseline gap-2"
    >
      <span className="font-display text-xl leading-none text-ink-fg">
        Cine<span className="text-accent-text">Gauge</span>
      </span>
      <span className="text-xs text-ink-subtle">{SITE.wordmarkKo}</span>
    </Link>
  );
}
