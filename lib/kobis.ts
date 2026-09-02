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

/**
 * 최신 가용 박스오피스를 조회한다.
 * D-1 → D-2 → D-3 순으로 시도하며, 세 번 모두 비어 있거나 실패하면 null을 반환한다.
 * Production에서 오래된 mock 데이터로 대체하지 않는다.
 */
export async function fetchLatestBoxOffice(
  base: Date = new Date(),
): Promise<BoxOfficeSnapshot | null> {
  const candidates = getTargetDateCandidates(base);

  for (const targetDate of candidates) {
    try {
      const movies = await fetchDailyBoxOffice(targetDate);
      if (movies.length > 0) {
        return { targetDate, movies };
      }
    } catch (error) {
      console.error('[kobis]', (error as Error).message);
    }
  }

  return null;
}
