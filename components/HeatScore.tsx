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
      <div className="font-display tabular text-4xl leading-none text-accent-text">
        {formatHeat(score)}
      </div>
      <div className="mt-1 text-[0.7rem] font-semibold tracking-wide text-fg-muted">{label}</div>

      <div
        className="mt-2 h-[3px] w-20 overflow-hidden rounded-full bg-surface-muted"
        role="img"
        aria-label={`흥행 온도 100점 만점에 ${score}점, ${label}`}
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-accent to-new"
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}
