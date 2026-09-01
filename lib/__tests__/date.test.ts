import { describe, expect, it } from 'vitest';
import {
  formatOpenDate,
  formatTargetDate,
  getSeoulDateString,
  getTargetDateCandidates,
  getYear,
  toCompactDate,
  toIsoDate,
} from '@/lib/date';

describe('getSeoulDateString', () => {
  it('UTC 자정 직후에도 Asia/Seoul 기준 날짜를 사용한다', () => {
    // 2026-09-01T00:30Z === 2026-09-01 09:30 KST
    expect(getSeoulDateString(0, new Date('2026-09-01T00:30:00Z'))).toBe('20260901');
  });

  it('KST 로 날짜가 넘어간 경우를 반영한다', () => {
    // 2026-08-31T15:30Z === 2026-09-01 00:30 KST
    expect(getSeoulDateString(0, new Date('2026-08-31T15:30:00Z'))).toBe('20260901');
  });

  it('월/연 경계를 넘어 이동한다', () => {
    expect(getSeoulDateString(-1, new Date('2026-01-01T05:00:00Z'))).toBe('20251231');
  });
});

describe('getTargetDateCandidates', () => {
  it('D-1 → D-2 → D-3 순서로 후보를 만든다', () => {
    expect(getTargetDateCandidates(new Date('2026-09-01T05:00:00Z'))).toEqual([
      '20260831',
      '20260830',
      '20260829',
    ]);
  });

  it('최대 3일까지만 조회한다', () => {
    expect(getTargetDateCandidates()).toHaveLength(3);
  });
});

describe('formatters', () => {
  it('formatTargetDate', () => {
    expect(formatTargetDate('20260831')).toBe('2026.08.31');
  });

  it('toIsoDate', () => {
    expect(toIsoDate('20260831')).toBe('2026-08-31');
  });

  it('formatOpenDate', () => {
    expect(formatOpenDate('2026-08-26')).toBe('2026.08.26');
    expect(formatOpenDate(null)).toBeNull();
    expect(formatOpenDate('')).toBeNull();
  });

  it('toCompactDate', () => {
    expect(toCompactDate('2026-08-26')).toBe('20260826');
    expect(toCompactDate(null)).toBeNull();
  });

  it('getYear', () => {
    expect(getYear('2026-08-26')).toBe(2026);
    expect(getYear('2026')).toBe(2026);
    expect(getYear('')).toBeNull();
    expect(getYear(null)).toBeNull();
  });
});
