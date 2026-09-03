const DEFAULT_SITE_URL = 'https://cinegauge.netlify.app';

/**
 * 환경변수 값을 origin 문자열로 정규화한다.
 * 빈 문자열/공백/프로토콜 누락/잘못된 값은 모두 null 로 처리해
 * metadataBase 의 `new URL()` 이 빌드 중 터지지 않도록 한다.
 */
export function normalizeSiteUrl(value: string | undefined | null): string | null {
  const trimmed = value?.trim();
  if (!trimmed) return null;

  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;

  try {
    return new URL(withProtocol).origin;
  } catch {
    return null;
  }
}

/**
 * canonical / sitemap / OG 의 기준 URL.
 * NEXT_PUBLIC_SITE_URL 이 비어 있으면 호스팅 플랫폼이 주입하는 값으로 폴백한다.
 * (클라이언트 번들에서는 NEXT_PUBLIC_ 이외의 값이 undefined 이므로 기본값으로 떨어진다.)
 */
function resolveSiteUrl(): string {
  return (
    normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL) ??
    // Netlify
    normalizeSiteUrl(process.env.URL) ??
    normalizeSiteUrl(process.env.DEPLOY_PRIME_URL) ??
    // Vercel
    normalizeSiteUrl(process.env.VERCEL_PROJECT_PRODUCTION_URL) ??
    normalizeSiteUrl(process.env.VERCEL_URL) ??
    DEFAULT_SITE_URL
  );
}

export const SITE = {
  name: 'CineGauge',
  nameKo: '씨네게이지',
  wordmark: 'CineGauge',
  wordmarkKo: '씨네게이지',
  title: '오늘 영화 순위 TOP 10 | CineGauge 씨네게이지',
  description:
    '최신 국내 박스오피스 TOP 10과 순위 변동, 관객수, 흥행 온도를 한눈에 확인하세요.',
  url: resolveSiteUrl(),
} as const;

export const COPY = {
  heroTitle: '오늘 극장가, 뭐가 뜨고 있을까?',
  heroSubSuffix: '박스오피스 기준 · 영화진흥위원회 통합전산망 데이터',
  indicatorDescription:
    '흥행 온도는 현재 순위와 전일 대비 순위·관객 변화를 조합한 자체 지표입니다.',
  methodologyTitle: '흥행 온도는 어떻게 계산하나요?',
  methodologyBody:
    '흥행 온도는 현재 박스오피스 순위, 전일 대비 순위 변화, 관객수 증감률, 신규 진입 여부를 조합한 CineGauge의 자체 지표입니다. 현재 극장가에서의 흥행 강도와 움직임을 간단하게 비교하기 위한 값이며 향후 관객수나 최종 흥행 실적을 예측하는 지표는 아닙니다.',
  boxOfficeError:
    '현재 박스오피스 정보를 불러오지 못했습니다. 잠시 후 다시 확인해 주세요.',
  detailNotFound: '상세 영화정보를 찾지 못했습니다.',
  detailLoadFailed: '상세 영화정보를 불러오지 못했습니다.',
} as const;

export const FLAGS = {
  adsenseEnabled: process.env.NEXT_PUBLIC_ADSENSE_ENABLED === 'true',
  adsenseClient: process.env.NEXT_PUBLIC_ADSENSE_CLIENT ?? '',
} as const;
