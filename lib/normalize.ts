/** 값을 [min, max] 범위로 자른다. NaN은 min으로 취급하지 않고 0으로 정규화한 뒤 자른다. */
export function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  return Math.min(Math.max(value, min), max);
}

/**
 * KOBIS는 모든 수치를 문자열로 내려주며 값이 비어 있는 경우도 있다.
 * 파싱 불가 값은 fallback으로 대체한다.
 */
export function toNumber(value: unknown, fallback = 0): number {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : fallback;
  }
  if (typeof value !== 'string') return fallback;

  const cleaned = value.replace(/,/g, '').trim();
  if (cleaned === '') return fallback;

  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : fallback;
}

/**
 * KMDb 검색 결과에 포함될 수 있는 가공 문자열을 제거한다.
 * - !HS / !HE 마커 제거
 * - HTML tag 제거
 * - 연속 공백 → 공백 1개
 * - trim
 */
export function normalizeMovieTitle(raw: string | null | undefined): string {
  if (!raw) return '';

  return raw
    .replace(/!HS/g, ' ')
    .replace(/!HE/g, ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * 제목 비교용 키. 표기 차이(공백/문장부호/대소문자)를 흡수한다.
 * 표시용 문자열로는 사용하지 않는다.
 */
export function toTitleKey(raw: string | null | undefined): string {
  return normalizeMovieTitle(raw)
    .toLowerCase()
    .replace(/[\s:;,.!?'"`~/\\|·ㆍ_\-–—()[\]{}<>]/g, '');
}

/** KMDb plot 등 자유 텍스트에서 마크업/공백 노이즈를 제거한다. */
export function normalizeText(raw: string | null | undefined): string {
  return normalizeMovieTitle(raw);
}
