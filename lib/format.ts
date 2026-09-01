const numberFormatter = new Intl.NumberFormat('ko-KR');

/** 243210 → "243,210" */
export function formatNumber(value: number): string {
  if (!Number.isFinite(value)) return '-';
  return numberFormatter.format(Math.round(value));
}

/** 243210 → "243,210명" */
export function formatAudience(value: number): string {
  return `${formatNumber(value)}명`;
}

/** 18.4 → "+18.4%", -5 → "-5.0%" */
export function formatPercent(value: number): string {
  if (!Number.isFinite(value)) return '-';
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(1)}%`;
}

/** 순위 변화 텍스트. 색상에만 의존하지 않도록 기호와 문구를 함께 제공한다. */
export function formatRankDelta(delta: number, isNew: boolean): {
  symbol: string;
  text: string;
  label: string;
} {
  if (isNew) {
    return { symbol: 'NEW', text: '신규 진입', label: '신규 진입' };
  }
  if (delta > 0) {
    return { symbol: '▲', text: `▲${delta}`, label: `${delta}계단 상승` };
  }
  if (delta < 0) {
    return { symbol: '▼', text: `▼${Math.abs(delta)}`, label: `${Math.abs(delta)}계단 하락` };
  }
  return { symbol: '–', text: '–', label: '순위 변화 없음' };
}

/** 흥행 온도 표기. 서비스 전체에서 "87°" 형식으로 통일한다. */
export function formatHeat(score: number): string {
  return `${Math.round(score)}°`;
}
