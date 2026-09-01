import { describe, expect, it } from 'vitest';
import { clamp, normalizeMovieTitle, toNumber, toTitleKey } from '@/lib/normalize';

describe('normalizeMovieTitle', () => {
  it('!HS / !HE 마커를 제거한다', () => {
    expect(normalizeMovieTitle('!HS 서울의 봄!HE')).toBe('서울의 봄');
  });

  it('HTML tag 를 제거한다', () => {
    expect(normalizeMovieTitle('<b>파묘</b>')).toBe('파묘');
  });

  it('연속 공백을 1개로 줄이고 trim 한다', () => {
    expect(normalizeMovieTitle('  범죄도시   4  ')).toBe('범죄도시 4');
  });

  it('빈 값은 빈 문자열을 반환한다', () => {
    expect(normalizeMovieTitle(null)).toBe('');
    expect(normalizeMovieTitle(undefined)).toBe('');
  });
});

describe('toTitleKey', () => {
  it('공백과 문장부호 차이를 흡수한다', () => {
    expect(toTitleKey('미션 임파서블: 파이널 레코닝')).toBe(
      toTitleKey('!HS 미션임파서블 파이널레코닝 !HE'),
    );
  });

  it('영문 대소문자를 흡수한다', () => {
    expect(toTitleKey('Dune')).toBe(toTitleKey('dune'));
  });

  it('서로 다른 제목은 다른 키를 만든다', () => {
    expect(toTitleKey('파묘')).not.toBe(toTitleKey('파도'));
  });
});

describe('toNumber', () => {
  it('쉼표가 포함된 문자열을 처리한다', () => {
    expect(toNumber('1,234,567')).toBe(1234567);
  });

  it('빈 문자열은 fallback 을 반환한다', () => {
    expect(toNumber('')).toBe(0);
    expect(toNumber('   ', -1)).toBe(-1);
  });

  it('음수 및 소수를 처리한다', () => {
    expect(toNumber('-18.4')).toBe(-18.4);
  });

  it('파싱 불가 값은 fallback 을 반환한다', () => {
    expect(toNumber('없음', 7)).toBe(7);
    expect(toNumber(null, 7)).toBe(7);
  });
});

describe('clamp', () => {
  it('범위를 벗어난 값을 자른다', () => {
    expect(clamp(5, -3, 3)).toBe(3);
    expect(clamp(-8, -3, 3)).toBe(-3);
    expect(clamp(2, -3, 3)).toBe(2);
  });

  it('NaN 은 min 으로 처리한다', () => {
    expect(clamp(Number.NaN, 0, 100)).toBe(0);
  });
});
