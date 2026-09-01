import { getYear } from '@/lib/date';
import { toTitleKey } from '@/lib/normalize';
import type { KmdbResultItem } from '@/types/kmdb';

export type MatchFailureReason =
  | 'NO_RESULT'
  | 'TITLE_MISMATCH'
  | 'YEAR_MISMATCH'
  | 'AMBIGUOUS';

export type MatchOutcome =
  | { status: 'MATCHED'; item: KmdbResultItem }
  | { status: 'MATCH_FAILED'; reason: MatchFailureReason };

export interface MatchTarget {
  /** KOBIS movieNm */
  title: string;
  /** KOBIS openDt (YYYY-MM-DD). 값이 없으면 연도 검증을 건너뛴다. */
  openDate: string | null;
}

const YEAR_TOLERANCE = 1;

/** KMDb 항목의 개봉 연도. repRlsDate 우선, 없으면 prodYear. */
function getCandidateYear(item: KmdbResultItem): number | null {
  return getYear(item.repRlsDate) ?? getYear(item.prodYear);
}

/**
 * KOBIS 영화와 KMDb 검색 결과를 매칭한다.
 *
 * 두 시스템의 ID를 직접 매핑하지 않으며 다음 순서로 검증한다.
 *   1차 title + releaseDts 로 조회한 결과 집합 (호출부에서 수행)
 *   2차 정규화한 제목 exact match
 *   3차 개봉연도가 KOBIS 개봉연도 ±1년 범위인지 확인
 *
 * 후보가 2개 이상 남으면 임의로 선택하지 않고 MATCH_FAILED 로 처리한다.
 * 잘못된 영화 정보를 보여주는 것보다 없는 정보를 보여주는 것을 우선한다.
 */
export function matchKmdbResult(
  results: KmdbResultItem[] | null | undefined,
  target: MatchTarget,
): MatchOutcome {
  if (!results || results.length === 0) {
    return { status: 'MATCH_FAILED', reason: 'NO_RESULT' };
  }

  // 2차: 정규화한 제목 exact match
  const targetKey = toTitleKey(target.title);
  if (!targetKey) {
    return { status: 'MATCH_FAILED', reason: 'TITLE_MISMATCH' };
  }

  const titleMatched = results.filter((item) => toTitleKey(item.title) === targetKey);
  if (titleMatched.length === 0) {
    return { status: 'MATCH_FAILED', reason: 'TITLE_MISMATCH' };
  }

  // 3차: 개봉연도 ±1년
  const targetYear = getYear(target.openDate);
  const yearMatched =
    targetYear === null
      ? titleMatched
      : titleMatched.filter((item) => {
          const candidateYear = getCandidateYear(item);
          // 연도를 확인할 수 없는 후보는 검증 실패로 간주한다.
          if (candidateYear === null) return false;
          return Math.abs(candidateYear - targetYear) <= YEAR_TOLERANCE;
        });

  if (yearMatched.length === 0) {
    return { status: 'MATCH_FAILED', reason: 'YEAR_MISMATCH' };
  }

  if (yearMatched.length > 1) {
    return { status: 'MATCH_FAILED', reason: 'AMBIGUOUS' };
  }

  return { status: 'MATCHED', item: yearMatched[0] };
}
