import { describe, expect, it } from 'vitest';
import { calculateHeatScore, getHeatLabel, getMovieStatus } from '@/lib/heat-score';

const base = { rank: 5, rankInten: 0, audiChange: 0, rankOldAndNew: 'OLD' as const };

describe('calculateHeatScore', () => {
  it('1위 / 변화 없음', () => {
    // rank 50 + momentum 10 + audience 12.5 = 72.5 → 73
    expect(calculateHeatScore({ ...base, rank: 1 })).toBe(73);
  });

  it('10위 / 변화 없음', () => {
    // rank 5 + momentum 10 + audience 12.5 = 27.5 → 28
    expect(calculateHeatScore({ ...base, rank: 10 })).toBe(28);
  });

  it('신규 진입은 5점 보너스를 받는다', () => {
    const old = calculateHeatScore({ ...base, rank: 7 });
    const fresh = calculateHeatScore({ ...base, rank: 7, rankOldAndNew: 'NEW' });
    expect(fresh - old).toBe(5);
  });

  it('rankInten +5 는 +3 으로 clamp 된다', () => {
    expect(calculateHeatScore({ ...base, rankInten: 5 })).toBe(
      calculateHeatScore({ ...base, rankInten: 3 }),
    );
  });

  it('rankInten -8 은 -3 으로 clamp 된다', () => {
    expect(calculateHeatScore({ ...base, rankInten: -8 })).toBe(
      calculateHeatScore({ ...base, rankInten: -3 }),
    );
  });

  it('audiChange +200 은 +50 으로 clamp 된다', () => {
    expect(calculateHeatScore({ ...base, audiChange: 200 })).toBe(
      calculateHeatScore({ ...base, audiChange: 50 }),
    );
  });

  it('audiChange -95 는 -50 으로 clamp 된다', () => {
    expect(calculateHeatScore({ ...base, audiChange: -95 })).toBe(
      calculateHeatScore({ ...base, audiChange: -50 }),
    );
  });

  it('KOBIS 원본 문자열 입력을 그대로 처리한다', () => {
    expect(
      calculateHeatScore({ rank: '1', rankInten: '0', audiChange: '0', rankOldAndNew: 'OLD' }),
    ).toBe(73);
  });

  it('숫자 필드가 비어 있어도 계산된다', () => {
    expect(
      calculateHeatScore({ rank: '3', rankInten: '', audiChange: '', rankOldAndNew: 'OLD' }),
    ).toBe(calculateHeatScore({ rank: 3, rankInten: 0, audiChange: 0, rankOldAndNew: 'OLD' }));
  });

  it('항상 0~100 범위를 벗어나지 않는다', () => {
    const max = calculateHeatScore({
      rank: 1,
      rankInten: 99,
      audiChange: 999,
      rankOldAndNew: 'NEW',
    });
    const min = calculateHeatScore({
      rank: 10,
      rankInten: -99,
      audiChange: -999,
      rankOldAndNew: 'OLD',
    });
    expect(max).toBeLessThanOrEqual(100);
    expect(min).toBeGreaterThanOrEqual(0);
    expect(max).toBe(100);
    expect(min).toBe(5);
  });
});

describe('getHeatLabel', () => {
  it.each([
    [100, '매우 뜨거움'],
    [85, '매우 뜨거움'],
    [84, '흥행 강세'],
    [70, '흥행 강세'],
    [69, '순항'],
    [55, '순항'],
    [54, '관망'],
    [40, '관망'],
    [39, '약세'],
    [0, '약세'],
  ])('%i → %s', (score, label) => {
    expect(getHeatLabel(score)).toBe(label);
  });
});

describe('getMovieStatus', () => {
  it('신규 진입이 최우선으로 판정된다', () => {
    expect(getMovieStatus({ ...base, rankInten: -5, rankOldAndNew: 'NEW' })).toBe('신규');
  });

  it('rankInten >= 2 는 급상승', () => {
    expect(getMovieStatus({ ...base, rankInten: 2 })).toBe('급상승');
  });

  it('audiChange >= 25 는 급상승', () => {
    expect(getMovieStatus({ ...base, audiChange: 25 })).toBe('급상승');
  });

  it('rankInten 1 은 상승', () => {
    expect(getMovieStatus({ ...base, rankInten: 1 })).toBe('상승');
  });

  it('audiChange 10 은 상승', () => {
    expect(getMovieStatus({ ...base, audiChange: 10 })).toBe('상승');
  });

  it('rankInten -2 는 급하락', () => {
    expect(getMovieStatus({ ...base, rankInten: -2 })).toBe('급하락');
  });

  it('audiChange -25 는 급하락', () => {
    expect(getMovieStatus({ ...base, audiChange: -25 })).toBe('급하락');
  });

  it('rankInten -1 은 하락', () => {
    expect(getMovieStatus({ ...base, rankInten: -1 })).toBe('하락');
  });

  it('audiChange -10 은 하락', () => {
    expect(getMovieStatus({ ...base, audiChange: -10 })).toBe('하락');
  });

  it('변화가 없으면 유지', () => {
    expect(getMovieStatus(base)).toBe('유지');
  });

  it('상승 신호가 하락 신호보다 먼저 판정된다', () => {
    expect(getMovieStatus({ ...base, rankInten: 2, audiChange: -40 })).toBe('급상승');
  });
});
