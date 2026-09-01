import { describe, expect, it } from 'vitest';
import { matchKmdbResult } from '@/lib/movie-match';
import type { KmdbResultItem } from '@/types/kmdb';

const item = (overrides: Partial<KmdbResultItem>): KmdbResultItem => ({
  title: '파묘',
  prodYear: '2024',
  repRlsDate: '20240222',
  ...overrides,
});

describe('matchKmdbResult', () => {
  it('제목 + 개봉일이 일치하면 매칭된다', () => {
    const result = matchKmdbResult([item({})], { title: '파묘', openDate: '2024-02-22' });
    expect(result.status).toBe('MATCHED');
  });

  it('!HS / !HE 가 포함된 제목도 매칭된다', () => {
    const result = matchKmdbResult([item({ title: '!HS 파묘!HE' })], {
      title: '파묘',
      openDate: '2024-02-22',
    });
    expect(result.status).toBe('MATCHED');
  });

  it('결과가 비어 있으면 NO_RESULT', () => {
    expect(matchKmdbResult([], { title: '파묘', openDate: '2024-02-22' })).toEqual({
      status: 'MATCH_FAILED',
      reason: 'NO_RESULT',
    });
    expect(matchKmdbResult(null, { title: '파묘', openDate: null })).toEqual({
      status: 'MATCH_FAILED',
      reason: 'NO_RESULT',
    });
  });

  it('제목이 다르면 TITLE_MISMATCH', () => {
    const result = matchKmdbResult([item({ title: '파묘 2' })], {
      title: '파묘',
      openDate: '2024-02-22',
    });
    expect(result).toEqual({ status: 'MATCH_FAILED', reason: 'TITLE_MISMATCH' });
  });

  it('개봉연도가 ±1년을 벗어나면 YEAR_MISMATCH', () => {
    const result = matchKmdbResult([item({ repRlsDate: '20200101', prodYear: '2020' })], {
      title: '파묘',
      openDate: '2024-02-22',
    });
    expect(result).toEqual({ status: 'MATCH_FAILED', reason: 'YEAR_MISMATCH' });
  });

  it('개봉연도가 ±1년 이내면 매칭된다 (재개봉 등)', () => {
    const result = matchKmdbResult([item({ repRlsDate: '20230222', prodYear: '2023' })], {
      title: '파묘',
      openDate: '2024-02-22',
    });
    expect(result.status).toBe('MATCHED');
  });

  it('동명 영화가 2개 남으면 임의 선택하지 않고 AMBIGUOUS', () => {
    const result = matchKmdbResult(
      [
        item({ repRlsDate: '20240222', prodYear: '2024' }),
        item({ repRlsDate: '20240901', prodYear: '2024' }),
      ],
      { title: '파묘', openDate: '2024-02-22' },
    );
    expect(result).toEqual({ status: 'MATCH_FAILED', reason: 'AMBIGUOUS' });
  });

  it('동명 영화 중 개봉연도로 하나만 남으면 매칭된다', () => {
    const result = matchKmdbResult(
      [
        item({ repRlsDate: '19900101', prodYear: '1990' }),
        item({ repRlsDate: '20240222', prodYear: '2024' }),
      ],
      { title: '파묘', openDate: '2024-02-22' },
    );
    expect(result).toEqual({ status: 'MATCHED', item: expect.objectContaining({ prodYear: '2024' }) });
  });

  it('연도를 확인할 수 없는 후보는 검증 실패로 처리한다', () => {
    const result = matchKmdbResult([item({ repRlsDate: '', prodYear: '' })], {
      title: '파묘',
      openDate: '2024-02-22',
    });
    expect(result).toEqual({ status: 'MATCH_FAILED', reason: 'YEAR_MISMATCH' });
  });

  it('KOBIS 개봉일이 없으면 연도 검증을 건너뛴다', () => {
    const result = matchKmdbResult([item({})], { title: '파묘', openDate: null });
    expect(result.status).toBe('MATCHED');
  });

  it('KOBIS 개봉일이 없고 후보가 2개면 AMBIGUOUS', () => {
    const result = matchKmdbResult([item({ prodYear: '1990' }), item({})], {
      title: '파묘',
      openDate: null,
    });
    expect(result).toEqual({ status: 'MATCH_FAILED', reason: 'AMBIGUOUS' });
  });
});
