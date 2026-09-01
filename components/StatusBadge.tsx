import type { MovieStatus } from '@/types/movie';

const STYLES: Record<MovieStatus, string> = {
  신규: 'bg-new-soft text-new',
  급상승: 'bg-up-soft text-up',
  상승: 'bg-up-soft text-up',
  유지: 'bg-flat-soft text-flat',
  하락: 'bg-down-soft text-down',
  급하락: 'bg-down-soft text-down',
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
      className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${STYLES[status]}`}
    >
      <span aria-hidden="true">{MARKS[status]}</span>
      {status}
    </span>
  );
}
