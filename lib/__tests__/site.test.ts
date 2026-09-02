import { describe, expect, it } from 'vitest';
import { normalizeSiteUrl } from '@/lib/site';

describe('normalizeSiteUrl', () => {
  it('정상 URL 은 origin 으로 정규화한다', () => {
    expect(normalizeSiteUrl('https://cinegauge.app')).toBe('https://cinegauge.app');
    expect(normalizeSiteUrl('https://cinegauge.app/')).toBe('https://cinegauge.app');
    expect(normalizeSiteUrl('https://cinegauge.app/path?q=1')).toBe('https://cinegauge.app');
  });

  it('배포 환경에서 비어 있는 값은 null 로 처리한다', () => {
    // 빈 문자열은 ?? 를 통과해 new URL('') 을 터뜨렸던 케이스다.
    expect(normalizeSiteUrl('')).toBeNull();
    expect(normalizeSiteUrl('   ')).toBeNull();
    expect(normalizeSiteUrl(undefined)).toBeNull();
    expect(normalizeSiteUrl(null)).toBeNull();
  });

  it('프로토콜이 없으면 https 를 붙인다', () => {
    expect(normalizeSiteUrl('cinegauge.netlify.app')).toBe('https://cinegauge.netlify.app');
  });

  it('공백이 섞인 값도 처리한다', () => {
    expect(normalizeSiteUrl('  https://cinegauge.app  ')).toBe('https://cinegauge.app');
  });

  it('잘못된 값은 null 을 반환한다', () => {
    expect(normalizeSiteUrl('http://')).toBeNull();
    expect(normalizeSiteUrl('://')).toBeNull();
  });
});
