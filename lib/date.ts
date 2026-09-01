export const SEOUL_TIME_ZONE = 'Asia/Seoul';

/** 기준 timezone(Asia/Seoul)에서의 오늘 날짜 조각. */
function seoulParts(base: Date): { year: number; month: number; day: number } {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: SEOUL_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  const [year, month, day] = formatter.format(base).split('-').map(Number);
  return { year, month, day };
}

/** Asia/Seoul 기준 오늘에서 offsetDays 만큼 이동한 날짜를 YYYYMMDD로 반환한다. */
export function getSeoulDateString(offsetDays = 0, base: Date = new Date()): string {
  const { year, month, day } = seoulParts(base);
  const shifted = new Date(Date.UTC(year, month - 1, day + offsetDays));

  const yyyy = String(shifted.getUTCFullYear()).padStart(4, '0');
  const mm = String(shifted.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(shifted.getUTCDate()).padStart(2, '0');

  return `${yyyy}${mm}${dd}`;
}

/**
 * 조회 대상 날짜 후보. 기본은 D-1이며 데이터가 없으면 D-3까지만 내려간다.
 * KOBIS는 당일 데이터를 제공하지 않는다.
 */
export function getTargetDateCandidates(base: Date = new Date()): string[] {
  return [1, 2, 3].map((offset) => getSeoulDateString(-offset, base));
}

/** YYYYMMDD → YYYY.MM.DD */
export function formatTargetDate(targetDt: string): string {
  if (!/^\d{8}$/.test(targetDt)) return targetDt;
  return `${targetDt.slice(0, 4)}.${targetDt.slice(4, 6)}.${targetDt.slice(6, 8)}`;
}

/** YYYYMMDD → YYYY-MM-DD (JSON-LD / <time> 용) */
export function toIsoDate(targetDt: string): string {
  if (!/^\d{8}$/.test(targetDt)) return targetDt;
  return `${targetDt.slice(0, 4)}-${targetDt.slice(4, 6)}-${targetDt.slice(6, 8)}`;
}

/** KOBIS openDt(YYYY-MM-DD) → YYYY.MM.DD. 값이 없으면 null. */
export function formatOpenDate(openDate: string | null): string | null {
  if (!openDate) return null;
  const digits = openDate.replace(/\D/g, '');
  if (digits.length !== 8) return null;
  return formatTargetDate(digits);
}

/** KOBIS openDt(YYYY-MM-DD) → YYYYMMDD. KMDb releaseDts 파라미터용. */
export function toCompactDate(openDate: string | null): string | null {
  if (!openDate) return null;
  const digits = openDate.replace(/\D/g, '');
  return digits.length === 8 ? digits : null;
}

/** 개봉 연도 추출. 실패 시 null. */
export function getYear(dateLike: string | null | undefined): number | null {
  if (!dateLike) return null;
  const match = dateLike.replace(/\D/g, '').slice(0, 4);
  if (match.length !== 4) return null;
  const year = Number(match);
  return Number.isFinite(year) && year > 1800 ? year : null;
}
