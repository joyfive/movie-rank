import { SITE } from '@/lib/site';

/** 워드마크만 두고 별도 GNB 는 만들지 않는다. */
export default function Header() {
  return (
    <header className="border-b border-border bg-surface">
      <div className="mx-auto flex max-w-content items-baseline gap-2 px-4 py-4">
        <span className="text-lg font-extrabold tracking-tight text-fg">{SITE.wordmark}</span>
        <span className="text-sm font-medium text-fg-subtle">{SITE.wordmarkKo}</span>
      </div>
    </header>
  );
}
