'use client';

import { useState } from 'react';

interface PosterProps {
  src: string | null;
  alt: string;
  rank: number;
  /** 첫 화면에 보이는 포스터는 eager 로 받는다. */
  priority?: boolean;
  className?: string;
}

/**
 * 2:3 포스터 슬롯.
 *
 * 포스터가 없거나(권리 확인 전 / 매칭 실패) 로드에 실패하면
 * 순위 숫자를 쓴 플레이스홀더로 대체한다.
 * 포스터가 전부 없는 상태에서도 레이아웃이 성립해야 한다.
 */
export default function Poster({ src, alt, rank, priority = false, className = '' }: PosterProps) {
  const [failed, setFailed] = useState(false);
  const showImage = Boolean(src) && !failed;

  return (
    <div
      className={`relative aspect-[2/3] shrink-0 overflow-hidden rounded-lg bg-surface-muted ring-1 ring-border ring-inset ${className}`}
    >
      {showImage ? (
        // KMDb 포스터는 외부 호스트에서 오며 도메인이 고정적이지 않다.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src as string}
          alt={alt}
          className="h-full w-full object-cover"
          loading={priority ? 'eager' : 'lazy'}
          fetchPriority={priority ? 'high' : 'auto'}
          onError={() => setFailed(true)}
        />
      ) : (
        <div
          aria-hidden="true"
          className="flex h-full w-full items-center justify-center bg-gradient-to-br from-surface-muted to-surface-2"
        >
          <span className="font-display tabular text-2xl text-border-strong">
            {String(rank).padStart(2, '0')}
          </span>
        </div>
      )}
    </div>
  );
}
