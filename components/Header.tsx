import { SITE } from '@/lib/site';

/** 워드마크만 두고 별도 GNB 는 만들지 않는다. */
export default function Header() {
  return (
    <header className="sticky top-0 z-20 border-b border-border bg-surface/90 backdrop-blur">
      <div className="mx-auto flex max-w-content items-center gap-2 px-4 py-3.5">
        <span className="font-display text-xl leading-none tracking-tight text-accent-text">
          {SITE.wordmark}
        </span>
        <span className="text-xs font-normal text-fg-subtle">{SITE.wordmarkKo}</span>
      </div>
    </header>
  );
}
