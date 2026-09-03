import type { MovieStatus } from '@/types/movie';

const STYLES: Record<MovieStatus, string> = {
  신규: 'bg-new-soft text-new ring-new/30',
  급상승: 'bg-up-soft text-up ring-up/30',
  상승: 'bg-up-soft text-up ring-up/30',
  유지: 'bg-flat-soft text-flat ring-flat/30',
  하락: 'bg-down-soft text-down ring-down/30',
  급하락: 'bg-down-soft text-down ring-down/30',
};

/** 상승/하락을 색상으로만 표현하지 않도록 기호를 함께 노출한다. */
const MARKS: Record<MovieStatus, string> = {
  신규: 'NEW',
  급상승: '▲▲',
  상승: '▲',
  유지: '–',
  하락: '▼',
  급하락: '▼▼',
};

export default function StatusBadge({ status }: { status: MovieStatus }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${STYLES[status]}`}
    >
      <span aria-hidden="true">{MARKS[status]}</span>
      {status}
    </span>
  );
}
