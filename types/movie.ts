/** 흥행 상태 배지. 흥행 온도와 별도로 계산한다. */
export type MovieStatus = '신규' | '급상승' | '상승' | '유지' | '하락' | '급하락';

/** 흥행 온도 라벨. */
export type HeatLabel = '매우 뜨거움' | '흥행 강세' | '순항' | '관망' | '약세';

/**
 * 페이지 컴포넌트가 사용하는 내부 모델.
 * KOBIS 원본 응답을 컴포넌트에서 직접 사용하지 않는다.
 */
export interface RankedMovie {
  rank: number;

  rankDelta: number;
  isNew: boolean;

  movieCode: string;
  title: string;

  /** YYYY-MM-DD. KOBIS가 값을 주지 않으면 null. */
  openDate: string | null;

  audienceToday: number;
  audienceChange: number;
  audienceTotal: number;

  screenCount: number;
  showCount: number;

  heatScore: number;
  heatLabel: HeatLabel;

  status: MovieStatus;
}

/** 홈 화면이 필요로 하는 박스오피스 스냅샷. */
export interface BoxOfficeSnapshot {
  /** 실제로 데이터를 얻은 기준일 (YYYYMMDD). */
  targetDate: string;
  movies: RankedMovie[];
}
