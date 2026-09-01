/** KMDb search_json2 응답 중 실제로 사용하는 필드만 정의한다. */
export interface KmdbResultItem {
  title?: string;
  titleEng?: string;
  prodYear?: string;
  repRlsDate?: string;
  rating?: string;
  genre?: string;
  runtime?: string;
  posters?: string;
  plots?: {
    plot?: Array<{ plotLang?: string; plotText?: string }>;
  };
  directors?: {
    director?: Array<{ directorNm?: string }>;
  };
  actors?: {
    actor?: Array<{ actorNm?: string }>;
  };
  ratings?: {
    rating?: Array<{ ratingGrade?: string; ratingDate?: string }>;
  };
}

export interface KmdbResponse {
  TotalCount?: number;
  Data?: Array<{
    TotalCount?: number;
    Count?: number;
    Result?: KmdbResultItem[];
  }>;
}

/** 상세 영역이 사용하는 내부 모델. */
export interface MovieDetail {
  genre: string[];
  runtimeMinutes: number | null;
  directors: string[];
  actors: string[];
  rating: string | null;
  plot: string | null;
  posterUrl: string | null;
  source: 'KMDb';
}

/** /api/movie-detail 응답 계약. */
export type MovieDetailResponse =
  | { status: 'OK'; detail: MovieDetail }
  | { status: 'MATCH_FAILED' }
  | { status: 'ERROR'; message: string };
