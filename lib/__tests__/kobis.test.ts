import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fetchDailyBoxOffice, fetchLatestBoxOffice, KobisError, toRankedMovie } from '@/lib/kobis';
import type { KobisMovie } from '@/types/kobis';

const BASE_DATE = new Date('2026-09-01T05:00:00Z');

const rawMovie = (overrides: Partial<KobisMovie> = {}): KobisMovie => ({
  rank: '1',
  rankInten: '2',
  rankOldAndNew: 'OLD',
  movieCd: '20260001',
  movieNm: '  테스트   영화 ',
  openDt: '2026-08-26',
  audiCnt: '243210',
  audiInten: '37800',
  audiChange: '18.4',
  audiAcc: '3124521',
  scrnCnt: '1200',
  showCnt: '5400',
  ...overrides,
});

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

const okPayload = (list: KobisMovie[]) => ({
  boxOfficeResult: {
    boxofficeType: '일별 박스오피스',
    showRange: '20260831~20260831',
    dailyBoxOfficeList: list,
  },
});

let fetchMock: ReturnType<typeof vi.fn>;

beforeEach(() => {
  process.env.KOBIS_API_KEY = 'test-key';
  fetchMock = vi.fn();
  vi.stubGlobal('fetch', fetchMock);
  vi.spyOn(console, 'error').mockImplementation(() => {});
  vi.spyOn(console, 'warn').mockImplementation(() => {});
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('toRankedMovie', () => {
  it('문자열 수치를 number 로 변환하고 제목을 정규화한다', () => {
    const movie = toRankedMovie(rawMovie());

    expect(movie).toMatchObject({
      rank: 1,
      rankDelta: 2,
      isNew: false,
      movieCode: '20260001',
      title: '테스트 영화',
      openDate: '2026-08-26',
      audienceToday: 243210,
      audienceChange: 18.4,
      audienceTotal: 3124521,
      screenCount: 1200,
      showCount: 5400,
      status: '급상승',
    });
    expect(movie.heatScore).toBeGreaterThan(0);
    expect(movie.heatLabel).toBeTruthy();
  });

  it('숫자 필드가 비어 있어도 0 으로 처리한다', () => {
    const movie = toRankedMovie(
      rawMovie({ audiCnt: '', audiAcc: '', audiChange: '', scrnCnt: '', showCnt: '' }),
    );

    expect(movie.audienceToday).toBe(0);
    expect(movie.audienceTotal).toBe(0);
    expect(movie.audienceChange).toBe(0);
  });

  it('개봉일이 없으면 null 로 둔다', () => {
    expect(toRankedMovie(rawMovie({ openDt: '' })).openDate).toBeNull();
  });

  it('신규 진입을 식별한다', () => {
    const movie = toRankedMovie(rawMovie({ rankOldAndNew: 'NEW' }));
    expect(movie.isNew).toBe(true);
    expect(movie.status).toBe('신규');
  });
});

describe('fetchDailyBoxOffice', () => {
  it('API key 를 query 로 전달하고 no-store 로 호출한다', async () => {
    fetchMock.mockResolvedValue(jsonResponse(okPayload([rawMovie()])));

    await fetchDailyBoxOffice('20260831');

    const [url, init] = fetchMock.mock.calls[0];
    expect((url as URL).toString()).toContain('searchDailyBoxOfficeList.json');
    expect((url as URL).searchParams.get('key')).toBe('test-key');
    expect((url as URL).searchParams.get('targetDt')).toBe('20260831');
    expect(init.cache).toBe('no-store');
  });

  it('정상 TOP 10 을 반환한다', async () => {
    const list = Array.from({ length: 10 }, (_, index) =>
      rawMovie({ rank: String(index + 1), movieCd: `2026000${index}` }),
    );
    fetchMock.mockResolvedValue(jsonResponse(okPayload(list)));

    const movies = await fetchDailyBoxOffice('20260831');

    expect(movies).toHaveLength(10);
    expect(movies.map((movie) => movie.rank)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  });

  it('API key 가 없으면 KobisError', async () => {
    delete process.env.KOBIS_API_KEY;
    await expect(fetchDailyBoxOffice('20260831')).rejects.toBeInstanceOf(KobisError);
  });

  it('HTTP 500 이면 KobisError', async () => {
    fetchMock.mockResolvedValue(new Response('boom', { status: 500 }));
    await expect(fetchDailyBoxOffice('20260831')).rejects.toBeInstanceOf(KobisError);
  });

  it('faultInfo 응답이면 KobisError', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({ faultInfo: { message: '잘못된 키값입니다.', errorCode: '320001' } }),
    );
    await expect(fetchDailyBoxOffice('20260831')).rejects.toBeInstanceOf(KobisError);
  });
});

describe('fetchLatestBoxOffice', () => {
  it('D-1 이 비어 있으면 D-2 를 조회한다', async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse(okPayload([])))
      .mockResolvedValueOnce(jsonResponse(okPayload([rawMovie()])));

    const result = await fetchLatestBoxOffice(BASE_DATE);

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(result.status).toBe('OK');
    if (result.status !== 'OK') return;
    expect(result.snapshot.targetDate).toBe('20260830');
    expect(result.snapshot.movies).toHaveLength(1);
  });

  it('D-1 실패 후 D-2 로 넘어간다', async () => {
    fetchMock
      .mockRejectedValueOnce(new Error('network'))
      .mockResolvedValueOnce(jsonResponse(okPayload([rawMovie()])));

    const result = await fetchLatestBoxOffice(BASE_DATE);

    expect(result.status).toBe('OK');
    if (result.status !== 'OK') return;
    expect(result.snapshot.targetDate).toBe('20260830');
  });

  it('D-1~D-3 이 모두 비면 NO_DATA 로 실패한다', async () => {
    // 3회 조회마다 새 Response 를 만든다 (body 는 한 번만 읽을 수 있다).
    fetchMock.mockImplementation(async () => jsonResponse(okPayload([])));

    const result = await fetchLatestBoxOffice(BASE_DATE);

    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(result).toEqual({
      status: 'FAILED',
      failure: { reason: 'NO_DATA', detail: expect.stringContaining('20260831') },
    });
  });

  it('최대 3일까지만 조회하고 API_ERROR 로 실패한다', async () => {
    fetchMock.mockRejectedValue(new Error('down'));

    const result = await fetchLatestBoxOffice(BASE_DATE);

    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(result.status).toBe('FAILED');
    if (result.status !== 'FAILED') return;
    expect(result.failure.reason).toBe('API_ERROR');
  });

  it('API key 가 없으면 호출 없이 MISSING_API_KEY 로 즉시 실패한다', async () => {
    delete process.env.KOBIS_API_KEY;

    const result = await fetchLatestBoxOffice(BASE_DATE);

    expect(fetchMock).not.toHaveBeenCalled();
    expect(result.status).toBe('FAILED');
    if (result.status !== 'FAILED') return;
    expect(result.failure.reason).toBe('MISSING_API_KEY');
  });
});
