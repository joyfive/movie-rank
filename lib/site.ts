/** 서비스 전역 상수. 워드마크는 텍스트 기반으로 두어 변경이 쉽도록 한다. */
export const SITE = {
  name: 'CineGauge',
  nameKo: '씨네게이지',
  wordmark: 'CineGauge',
  wordmarkKo: '씨네게이지',
  title: '오늘 영화 순위 TOP 10 | CineGauge 씨네게이지',
  description:
    '최신 국내 박스오피스 TOP 10과 순위 변동, 관객수, 흥행 온도를 한눈에 확인하세요.',
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://cinegauge.netlify.app').replace(/\/$/, ''),
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
  posterEnabled: process.env.NEXT_PUBLIC_POSTER_ENABLED === 'true',
} as const;
