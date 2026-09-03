import { formatHeat } from '@/lib/format';
import type { HeatLabel } from '@/types/movie';

/**
 * 아트워크 위에 겹쳐 뜨는 원형 흥행 온도 뱃지.
 * 레퍼런스의 평점 뱃지 자리를 흥행 온도가 대신한다.
 */
export default function HeatBadge({
  score,
  label,
  size = 'md',
}: {
  score: number;
  label: HeatLabel;
  size?: 'sm' | 'md';
}) {
  const box = size === 'md' ? 'h-16 w-16 sm:h-20 sm:w-20' : 'h-11 w-11';
  const num = size === 'md' ? 'text-xl sm:text-2xl' : 'text-sm';

  return (
    <div
      className={`${box} flex flex-col items-center justify-center rounded-full bg-surface shadow-[0_4px_16px_rgba(16,16,20,0.18)] ring-1 ring-border`}
      role="img"
      aria-label={`흥행 온도 100점 만점에 ${score}점, ${label}`}
    >
      <span className={`font-display tabular leading-none text-accent-text ${num}`}>
        {formatHeat(score)}
      </span>
      {size === 'md' ? (
        <span className="mt-0.5 text-[0.55rem] leading-none text-fg-subtle">흥행 온도</span>
      ) : null}
    </div>
  );
}
