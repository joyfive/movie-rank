import 'server-only';

import { toCompactDate } from '@/lib/date';
import { matchKmdbResult, type MatchFailureReason } from '@/lib/movie-match';
import { normalizeText, toNumber } from '@/lib/normalize';
import type { KmdbResponse, KmdbResultItem, MovieDetail } from '@/types/kmdb';

const KMDB_ENDPOINT =
  'https://api.koreafilm.or.kr/openapi-data2/wisenut/search_api/search_json2.jsp';

const REQUEST_TIMEOUT_MS = 8000;
const PLOT_MAX_LENGTH = 220;
const MAX_ACTORS = 3;
const LIST_COUNT = 10;

export class KmdbError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'KmdbError';
  }
}

export type MovieDetailOutcome =
  | { status: 'OK'; detail: MovieDetail }
  | { status: 'MATCH_FAILED'; reason: MatchFailureReason };

const posterEnabled = () => process.env.NEXT_PUBLIC_POSTER_ENABLED === 'true';

function pickPlot(item: KmdbResultItem): string | null {
  const plots = item.plots?.plot ?? [];
  const korean = plots.find((entry) => entry.plotLang === '한국어' && entry.plotText);
  const chosen = korean ?? plots.find((entry) => entry.plotText);

  const text = normalizeText(chosen?.plotText);
  if (!text) return null;

  return text.length > PLOT_MAX_LENGTH ? `${text.slice(0, PLOT_MAX_LENGTH)}…` : text;
}

function pickRating(item: KmdbResultItem): string | null {
  const fromRatings = item.ratings?.rating?.find((entry) => normalizeText(entry.ratingGrade));
  const value = normalizeText(fromRatings?.ratingGrade) || normalizeText(item.rating);
  return value || null;
}

function pickPoster(item: KmdbResultItem): string | null {
  // 포스터는 권리 확인 전까지 서버에서도 반환하지 않는다.
  if (!posterEnabled()) return null;

  const first = (item.posters ?? '').split('|').map((url) => url.trim()).find(Boolean);
  if (!first) return null;

  return first.startsWith('http') ? first : null;
}

function splitNames(values: Array<string | undefined>): string[] {
  return values
    .map((value) => normalizeText(value))
    .filter((value): value is string => value.length > 0);
}

/** KMDb 항목 → 내부 MovieDetail 모델. metadata 일부가 null이어도 안전하게 동작한다. */
export function toMovieDetail(item: KmdbResultItem): MovieDetail {
  const runtime = toNumber(normalizeText(item.runtime), 0);

  return {
    genre: normalizeText(item.genre)
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean),
    runtimeMinutes: runtime > 0 ? runtime : null,
    directors: splitNames((item.directors?.director ?? []).map((entry) => entry.directorNm)),
    actors: splitNames((item.actors?.actor ?? []).map((entry) => entry.actorNm)).slice(0, MAX_ACTORS),
    rating: pickRating(item),
    plot: pickPlot(item),
    posterUrl: pickPoster(item),
    source: 'KMDb',
  };
}

async function searchKmdb(params: Record<string, string>): Promise<KmdbResultItem[]> {
  const apiKey = process.env.KMDB_API_KEY;
  if (!apiKey) {
    throw new KmdbError('KMDB_API_KEY 환경변수가 설정되지 않았습니다.');
  }

  const url = new URL(KMDB_ENDPOINT);
  url.searchParams.set('collection', 'kmdb_new2');
  url.searchParams.set('detail', 'Y');
  url.searchParams.set('listCount', String(LIST_COUNT));
  url.searchParams.set('ServiceKey', apiKey);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  let response: Response;
  try {
    response = await fetch(url, {
      cache: 'no-store',
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      headers: { Accept: 'application/json' },
    });
  } catch (error) {
    throw new KmdbError(`KMDb 요청 실패: ${(error as Error).message}`);
  }

  if (!response.ok) {
    throw new KmdbError(`KMDb 응답 오류: HTTP ${response.status}`);
  }

  let payload: KmdbResponse;
  try {
    payload = (await response.json()) as KmdbResponse;
  } catch {
    throw new KmdbError('KMDb 응답 파싱 실패');
  }

  return payload.Data?.flatMap((entry) => entry.Result ?? []) ?? [];
}

/**
 * 제목 + 개봉일로 KMDb 상세정보를 조회한다.
 * 사용자가 [정보 보기]를 눌렀을 때만 호출한다. TOP 10 선조회는 하지 않는다.
 *
 * @throws {KmdbError} KMDb 장애. 해당 영화 상세에만 영향을 준다.
 */
export async function fetchMovieDetail(
  title: string,
  openDate: string | null,
): Promise<MovieDetailOutcome> {
  const releaseDts = toCompactDate(openDate);

  const primary = await searchKmdb(
    releaseDts ? { title, releaseDts } : { title },
  );

  let outcome = matchKmdbResult(primary, { title, openDate });

  // 개봉일 기준 조회에서 후보를 찾지 못한 경우에만 제목 단독으로 한 번 더 확인한다.
  // 검증 규칙(제목 exact match + 개봉연도 ±1년)은 동일하게 적용한다.
  if (outcome.status === 'MATCH_FAILED' && outcome.reason !== 'AMBIGUOUS' && releaseDts) {
    const fallback = await searchKmdb({ title });
    outcome = matchKmdbResult(fallback, { title, openDate });
  }

  if (outcome.status === 'MATCH_FAILED') {
    return outcome;
  }

  return { status: 'OK', detail: toMovieDetail(outcome.item) };
}
