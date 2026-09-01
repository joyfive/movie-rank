import { formatHeat } from '@/lib/format';
import type { HeatLabel } from '@/types/movie';

interface HeatScoreProps {
  score: number;
  label: HeatLabel;
}

/** 흥행 온도 표기는 서비스 전체에서 "87°" 형식으로 통일한다. */
export default function HeatScore({ score, label }: HeatScoreProps) {
  return (
    <div className="shrink-0 text-right">
      <div className="flex items-baseline justify-end gap-1">
        <span className="text-xs font-medium text-fg-subtle">흥행 온도</span>
        <span className="tabular text-2xl font-extrabold text-accent">{formatHeat(score)}</span>
      </div>
      <div className="mt-0.5 text-xs font-semibold text-fg-muted">{label}</div>

      <div
        className="mt-1.5 h-1 w-20 overflow-hidden rounded-full bg-surface-muted"
        role="img"
        aria-label={`흥행 온도 100점 만점에 ${score}점, ${label}`}
      >
        <div className="h-full rounded-full bg-accent" style={{ width: `${score}%` }} />
      </div>
    </div>
  );
}
