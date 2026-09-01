/** KOBIS 일별 박스오피스 API 원본 응답 타입 (모든 수치가 문자열로 내려온다). */
export interface KobisMovie {
  rank: string;
  rankInten: string;
  rankOldAndNew: 'OLD' | 'NEW';

  movieCd: string;
  movieNm: string;
  openDt: string;

  audiCnt: string;
  audiInten: string;
  audiChange: string;
  audiAcc: string;

  scrnCnt: string;
  showCnt: string;
}

export interface KobisBoxOfficeResult {
  boxofficeType: string;
  showRange: string;
  dailyBoxOfficeList: KobisMovie[];
}

export interface KobisSuccessResponse {
  boxOfficeResult: KobisBoxOfficeResult;
}

export interface KobisFaultResponse {
  faultInfo: {
    message: string;
    errorCode: string;
  };
}

export type KobisResponse = Partial<KobisSuccessResponse> & Partial<KobisFaultResponse>;
