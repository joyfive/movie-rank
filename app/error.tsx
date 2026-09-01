'use client';

import { useEffect } from 'react';
import { COPY } from '@/lib/site';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="px-4 py-16 text-center">
      <h1 className="text-xl font-bold text-fg">잠시 문제가 발생했습니다</h1>
      <p className="mx-auto mt-4 max-w-sm text-sm leading-relaxed text-fg-muted">
        {COPY.boxOfficeError}
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-6 rounded-md border border-border-strong bg-surface px-4 py-2 text-sm font-semibold text-fg hover:bg-surface-muted"
      >
        다시 시도
      </button>
    </section>
  );
}
