import 'server-only';

import { getTargetDateCandidates } from '@/lib/date';
import { calculateHeatScore, getHeatLabel, getMovieStatus } from '@/lib/heat-score';
import { normalizeMovieTitle, toNumber } from '@/lib/normalize';
import type { KobisMovie, KobisResponse } from '@/types/kobis';
import type { BoxOfficeSnapshot, RankedMovie } from '@/types/movie';

const KOBIS_ENDPOINT =
  'https://www.kobis.or.kr/kobisopenapi/webservice/rest/boxoffice/searchDailyBoxOfficeList.json';

const REQUEST_TIMEOUT_MS = 8000;

export class KobisError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'KobisError';
  }
}

/** KOBIS 원본 → 내부 RankedMovie 모델. 문자열 수치를 number로 변환한다. */
export function toRankedMovie(raw: KobisMovie): RankedMovie {
  const isNew = raw.rankOldAndNew === 'NEW';
  const heatScore = calculateHeatScore({
    rank: raw.rank,
    rankInten: raw.rankInten,
    audiChange: raw.audiChange,
    rankOldAndNew: raw.rankOldAndNew,
  });

  const openDateDigits = (raw.openDt ?? '').replace(/\D/g, '');

  return {
    rank: toNumber(raw.rank, 0),
    rankDelta: toNumber(raw.rankInten, 0),
    isNew,

    movieCode: raw.movieCd ?? '',
    title: normalizeMovieTitle(raw.movieNm),

    openDate: openDateDigits.length === 8 ? raw.openDt : null,

    audienceToday: toNumber(raw.audiCnt, 0),
    audienceChange: toNumber(raw.audiChange, 0),
    audienceTotal: toNumber(raw.audiAcc, 0),

    screenCount: toNumber(raw.scrnCnt, 0),
    showCount: toNumber(raw.showCnt, 0),

    heatScore,
    heatLabel: getHeatLabel(heatScore),
    status: getMovieStatus({
      rank: raw.rank,
      rankInten: raw.rankInten,
      audiChange: raw.audiChange,
      rankOldAndNew: raw.rankOldAndNew,
    }),
  };
}

/**
 * 특정 날짜의 일별 박스오피스를 조회한다.
 * 반드시 서버에서만 호출한다. API key를 브라우저로 전달하지 않는다.
 *
 * @returns 해당 일자의 TOP 10. 데이터가 없으면 빈 배열.
 * @throws {KobisError} 네트워크/HTTP/응답 오류.
 */
export async function fetchDailyBoxOffice(targetDt: string): Promise<RankedMovie[]> {
  const apiKey = process.env.KOBIS_API_KEY;
  if (!apiKey) {
    throw new KobisError('KOBIS_API_KEY 환경변수가 설정되지 않았습니다.');
  }

  const url = new URL(KOBIS_ENDPOINT);
  url.searchParams.set('key', apiKey);
  url.searchParams.set('targetDt', targetDt);

  let response: Response;
  try {
    response = await fetch(url, {
      // 장기 서버 캐싱/저장을 하지 않는다.
      cache: 'no-store',
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      headers: { Accept: 'application/json' },
    });
  } catch (error) {
    throw new KobisError(`KOBIS 요청 실패 (${targetDt}): ${(error as Error).message}`);
  }

  if (!response.ok) {
    throw new KobisError(`KOBIS 응답 오류 (${targetDt}): HTTP ${response.status}`);
  }

  let payload: KobisResponse;
  try {
    payload = (await response.json()) as KobisResponse;
  } catch {
    throw new KobisError(`KOBIS 응답 파싱 실패 (${targetDt})`);
  }

  if (payload.faultInfo) {
    throw new KobisError(`KOBIS 오류 (${targetDt}): ${payload.faultInfo.message}`);
  }

  const list = payload.boxOfficeResult?.dailyBoxOfficeList;
  if (!Array.isArray(list)) {
    throw new KobisError(`KOBIS 응답 형식 오류 (${targetDt})`);
  }

  return list.map(toRankedMovie);
}

export type BoxOfficeFailureReason = 'MISSING_API_KEY' | 'NO_DATA' | 'API_ERROR';

export interface BoxOfficeFailure {
  reason: BoxOfficeFailureReason;
  /** 서버 로그 및 개발 환경 화면에만 노출한다. 사용자에게는 PRD 문구만 보여준다. */
  detail: string;
}

export type BoxOfficeResult =
  | { status: 'OK'; snapshot: BoxOfficeSnapshot }
  | { status: 'FAILED'; failure: BoxOfficeFailure };

/**
 * 최신 가용 박스오피스를 조회한다.
 * D-1 → D-2 → D-3 순으로 시도하며 최대 3일까지만 내려간다.
 * Production 에서 오래된 mock 데이터로 대체하지 않는다.
 *
 * 실패 시 사용자에게는 단일 문구만 보여주되, 원인을 구분해 서버 로그에 남긴다.
 */
export async function fetchLatestBoxOffice(base: Date = new Date()): Promise<BoxOfficeResult> {
  // 키가 없으면 3일치를 헛돌 이유가 없다. 배포 환경변수 누락을 즉시 드러낸다.
  if (!process.env.KOBIS_API_KEY) {
    const detail = 'KOBIS_API_KEY 환경변수가 설정되지 않았습니다. 배포 환경변수를 확인하세요.';
    console.error('[kobis] MISSING_API_KEY:', detail);
    return { status: 'FAILED', failure: { reason: 'MISSING_API_KEY', detail } };
  }

  const candidates = getTargetDateCandidates(base);
  const errors: string[] = [];

  for (const targetDate of candidates) {
    try {
      const movies = await fetchDailyBoxOffice(targetDate);
      if (movies.length > 0) {
        return { status: 'OK', snapshot: { targetDate, movies } };
      }
      console.warn(`[kobis] ${targetDate} 데이터가 비어 있어 이전 날짜로 넘어갑니다.`);
    } catch (error) {
      const message = (error as Error).message;
      errors.push(message);
      console.error('[kobis]', message);
    }
  }

  if (errors.length > 0) {
    const detail = errors.join(' / ');
    console.error(`[kobis] API_ERROR: ${candidates.join(', ')} 조회 실패 — ${detail}`);
    return { status: 'FAILED', failure: { reason: 'API_ERROR', detail } };
  }

  const detail = `${candidates.join(', ')} 모두 데이터가 없습니다.`;
  console.error('[kobis] NO_DATA:', detail);
  return { status: 'FAILED', failure: { reason: 'NO_DATA', detail } };
}
