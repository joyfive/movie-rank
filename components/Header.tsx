import Wordmark from '@/components/Wordmark';

/**
 * 다크 밴드 헤더.
 * MVP 라우트가 `/` 하나뿐이라 별도 GNB 는 두지 않는다(PRD 4.1).
 */
export default function Header() {
  return (
    <header className="bg-ink">
      <div className="gutter flex items-center justify-between py-4">
        <Wordmark />
        <p className="text-[0.7rem] tracking-widest text-ink-subtle uppercase">Daily Box Office</p>
      </div>
    </header>
  );
}
