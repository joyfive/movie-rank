import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fetchMovieDetail, KmdbError, toMovieDetail } from '@/lib/kmdb';
import type { KmdbResultItem } from '@/types/kmdb';

const item = (overrides: Partial<KmdbResultItem> = {}): KmdbResultItem => ({
  title: '파묘',
  prodYear: '2024',
  repRlsDate: '20240222',
  genre: '미스터리,공포',
  runtime: '134',
  posters: 'https://example.com/a.jpg|https://example.com/b.jpg',
  plots: { plot: [{ plotLang: '한국어', plotText: '!HS 미국 LA 거액의 의뢰를 받은 무당 화림.!HE' }] },
  directors: { director: [{ directorNm: '장재현' }] },
  actors: { actor: [{ actorNm: '최민식' }, { actorNm: '김고은' }, { actorNm: '유해진' }, { actorNm: '이도현' }] },
  ratings: { rating: [{ ratingGrade: '15세이상관람가' }] },
  ...overrides,
});

function jsonResponse(results: KmdbResultItem[], status = 200): Response {
  return new Response(
    JSON.stringify({ TotalCount: results.length, Data: [{ Result: results }] }),
    { status, headers: { 'Content-Type': 'application/json' } },
  );
}

let fetchMock: ReturnType<typeof vi.fn>;

beforeEach(() => {
  process.env.KMDB_API_KEY = 'test-key';
  process.env.NEXT_PUBLIC_POSTER_ENABLED = 'false';
  fetchMock = vi.fn();
  vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('toMovieDetail', () => {
  it('KMDb 항목을 내부 모델로 변환한다', () => {
    const detail = toMovieDetail(item());

    expect(detail.genre).toEqual(['미스터리', '공포']);
    expect(detail.runtimeMinutes).toBe(134);
    expect(detail.directors).toEqual(['장재현']);
    expect(detail.rating).toBe('15세이상관람가');
    expect(detail.source).toBe('KMDb');
  });

  it('배우는 최대 3명까지만 노출한다', () => {
    expect(toMovieDetail(item()).actors).toEqual(['최민식', '김고은', '유해진']);
  });

  it('줄거리의 !HS / !HE 를 제거한다', () => {
    expect(toMovieDetail(item()).plot).toBe('미국 LA 거액의 의뢰를 받은 무당 화림.');
  });

  it('줄거리를 220자로 자른다', () => {
    const long = 'ㄱ'.repeat(500);
    const detail = toMovieDetail(item({ plots: { plot: [{ plotLang: '한국어', plotText: long }] } }));
    expect(detail.plot).toHaveLength(221); // 220자 + 말줄임표
  });

  it('metadata 일부가 없어도 안전하게 동작한다', () => {
    const detail = toMovieDetail({ title: '무제' });

    expect(detail).toEqual({
      genre: [],
      runtimeMinutes: null,
      directors: [],
      actors: [],
      rating: null,
      plot: null,
      posterUrl: null,
      source: 'KMDb',
    });
  });

  it('포스터가 OFF 면 URL 을 반환하지 않는다', () => {
    expect(toMovieDetail(item()).posterUrl).toBeNull();
  });

  it('포스터가 ON 이면 첫 번째 URL 을 사용한다', () => {
    process.env.NEXT_PUBLIC_POSTER_ENABLED = 'true';
    expect(toMovieDetail(item()).posterUrl).toBe('https://example.com/a.jpg');
  });
});

describe('fetchMovieDetail', () => {
  it('제목 + 개봉일 exact match 는 상세정보를 반환한다', async () => {
    fetchMock.mockResolvedValue(jsonResponse([item()]));

    const outcome = await fetchMovieDetail('파묘', '2024-02-22');

    expect(outcome.status).toBe('OK');
    const [url] = fetchMock.mock.calls[0];
    expect((url as URL).searchParams.get('title')).toBe('파묘');
    expect((url as URL).searchParams.get('releaseDts')).toBe('20240222');
    expect((url as URL).searchParams.get('collection')).toBe('kmdb_new2');
    expect((url as URL).searchParams.get('ServiceKey')).toBe('test-key');
  });

  it('동명 영화 2개가 남으면 정보를 노출하지 않는다', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse([item({ repRlsDate: '20240222' }), item({ repRlsDate: '20240901' })]),
    );

    const outcome = await fetchMovieDetail('파묘', '2024-02-22');

    expect(outcome).toEqual({ status: 'MATCH_FAILED', reason: 'AMBIGUOUS' });
  });

  it('결과가 비면 제목 단독으로 한 번 더 조회한다', async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse([]))
      .mockResolvedValueOnce(jsonResponse([item()]));

    const outcome = await fetchMovieDetail('파묘', '2024-02-22');

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect((fetchMock.mock.calls[1][0] as URL).searchParams.get('releaseDts')).toBeNull();
    expect(outcome.status).toBe('OK');
  });

  it('개봉일이 전혀 맞지 않으면 MATCH_FAILED', async () => {
    // 개봉일 조회 실패 후 제목 단독 재조회까지 매번 새 Response 를 만든다.
    fetchMock.mockImplementation(async () =>
      jsonResponse([item({ repRlsDate: '19900101', prodYear: '1990' })]),
    );

    const outcome = await fetchMovieDetail('파묘', '2024-02-22');

    expect(outcome).toEqual({ status: 'MATCH_FAILED', reason: 'YEAR_MISMATCH' });
  });

  it('Result 가 완전히 비면 MATCH_FAILED', async () => {
    fetchMock.mockImplementation(async () => jsonResponse([]));

    const outcome = await fetchMovieDetail('없는영화', null);

    expect(outcome).toEqual({ status: 'MATCH_FAILED', reason: 'NO_RESULT' });
  });

  it('HTTP 오류는 KmdbError 로 던진다', async () => {
    fetchMock.mockResolvedValue(new Response('boom', { status: 503 }));

    await expect(fetchMovieDetail('파묘', '2024-02-22')).rejects.toBeInstanceOf(KmdbError);
  });

  it('API key 가 없으면 KmdbError', async () => {
    delete process.env.KMDB_API_KEY;
    await expect(fetchMovieDetail('파묘', null)).rejects.toBeInstanceOf(KmdbError);
  });
});
