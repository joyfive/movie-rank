import { clamp, toNumber } from '@/lib/normalize';
import type { HeatLabel, MovieStatus } from '@/types/movie';

/** 흥행 온도 계산에 필요한 최소 입력. KOBIS 원본 문자열도 그대로 받을 수 있다. */
export interface HeatInput {
  rank: number | string;
  rankInten: number | string;
  audiChange: number | string;
  rankOldAndNew: 'OLD' | 'NEW' | string;
}

export const HEAT_WEIGHTS = {
  rank: 50,
  rankMomentum: 20,
  audienceMomentum: 25,
  newBonus: 5,
} as const;

export const RANK_INTEN_CLAMP = 3;
export const AUDI_CHANGE_CLAMP = 50;

/**
 * 흥행 온도(0~100).
 *
 * 현재 흥행 강도 + 전일 모멘텀 지표이며 미래 흥행을 예측하지 않는다.
 * 극단값의 영향을 줄이기 위해 순위 모멘텀은 ±3, 관객 증감률은 ±50%에서 clamp한다.
 */
export function calculateHeatScore(input: HeatInput): number {
  const rank = clamp(toNumber(input.rank, 10), 1, 10);
  const rankInten = clamp(toNumber(input.rankInten, 0), -RANK_INTEN_CLAMP, RANK_INTEN_CLAMP);
  const audiChange = clamp(toNumber(input.audiChange, 0), -AUDI_CHANGE_CLAMP, AUDI_CHANGE_CLAMP);

  const rankScore = ((11 - rank) / 10) * HEAT_WEIGHTS.rank;
  const rankMomentumScore = ((rankInten + 3) / 6) * HEAT_WEIGHTS.rankMomentum;
  const audienceMomentumScore = ((audiChange + 50) / 100) * HEAT_WEIGHTS.audienceMomentum;
  const newBonus = input.rankOldAndNew === 'NEW' ? HEAT_WEIGHTS.newBonus : 0;

  return Math.round(
    clamp(rankScore + rankMomentumScore + audienceMomentumScore + newBonus, 0, 100),
  );
}

/** 흥행 온도 라벨. */
export function getHeatLabel(heatScore: number): HeatLabel {
  if (heatScore >= 85) return '매우 뜨거움';
  if (heatScore >= 70) return '흥행 강세';
  if (heatScore >= 55) return '순항';
  if (heatScore >= 40) return '관망';
  return '약세';
}

/**
 * 흥행 상태 배지. 흥행 온도와 별도로 계산하며 판정 순서를 지킨다.
 */
export function getMovieStatus(input: HeatInput): MovieStatus {
  if (input.rankOldAndNew === 'NEW') return '신규';

  const rankInten = toNumber(input.rankInten, 0);
  const audiChange = toNumber(input.audiChange, 0);

  if (rankInten >= 2 || audiChange >= 25) return '급상승';
  if (rankInten >= 1 || audiChange >= 10) return '상승';
  if (rankInten <= -2 || audiChange <= -25) return '급하락';
  if (rankInten <= -1 || audiChange <= -10) return '하락';

  return '유지';
}
