# PRD — 영화 온도 (가칭)

**버전:** v0.1  
**제품 유형:** 광고형 웹 마이크로서비스  
**상태:** 개발 착수 가능 / Production 광고 활성화 전 라이선스 확인 필요

## 1. 제품 정의

### 한 줄 정의

현재 극장 박스오피스 TOP 10을 단순 순위가 아니라 **“지금 얼마나 뜨고 있는가”​**까지 한눈에 보여주는 단일 페이지 영화 흥행 현황 서비스.

### 핵심 사용자 가치

사용자는 페이지 진입 후 10초 안에 다음을 알 수 있어야 한다.

- 지금 가장 많이 보는 영화
- 어제보다 뜨고 있는 영화
- 하락하고 있는 영화
- 새로 순위에 진입한 영화
- 해당 영화가 어떤 작품인지

### 포지셔닝

> 영화 순위를 보여주는 사이트가 아니라, **오늘 극장가의 흥행 흐름을 읽어주는 사이트**.

---

# 2. MVP 원칙

**한다**

- 일별 박스오피스 TOP 10
- 흥행 온도 0~100
- 신규 / 급상승 / 상승 / 유지 / 하락 / 급하락
- 관객수 / 누적 관객수 / 증감률
- KMDb 영화 상세정보
- AdSense 삽입 구조
- SSR
- Search Console 대응

**하지 않는다**

- DB
- 로그인
- 회원
- 리뷰/별점
- 댓글
- 개인화 추천
- 영화 예매
- OTT 정보
- LLM
- TMDB
- 흥행 예측
- 천만 관객 예측
- 과거 데이터 축적
- 3일/7일 차트
- 주간 박스오피스
- 개별 영화 상세 URL

---

# 3. 사용자 플로우

```text
검색 / 직접 유입
        ↓
      홈
        ↓
박스오피스 TOP 10
        ↓
흥행 온도 / 상승·하락 확인
        ↓
관심 영화 [정보 보기]
        ↓
KMDb 상세정보 Lazy Load
        ↓
장르 / 감독 / 배우 / 줄거리 확인
```

주요 사용자 액션은 **스크롤과 상세 펼치기** 두 개뿐이다.

---

# 4. 화면 구조

MVP 라우트:

```text
/
```

## 4.1 Header

워드마크:

**영화 온도**

가칭이며 개발 중 변경 가능하도록 텍스트 기반으로 구현한다.

별도 GNB는 만들지 않는다.

---

## 4.2 Hero

### Main Copy

**오늘 극장가, 뭐가 뜨고 있을까?**

### Sub Copy

`YYYY.MM.DD 박스오피스 기준 · 영화진흥위원회 통합전산망 데이터`

### Indicator Description

`흥행 온도는 현재 순위와 전일 대비 순위·관객 변화를 조합한 자체 지표입니다.`

---

# 5. Summary Strip

TOP 10 결과를 바탕으로 별도 API 호출 없이 계산한다.

### 노출 항목

**오늘 1위**

현재 `rank === 1`

**가장 급상승**

`rankInten`이 가장 큰 영화.

동점이면 현재 순위가 높은 영화를 우선한다.

**신규 진입**

`rankOldAndNew === "NEW"`인 영화 개수.

---

# 6. 광고 슬롯

## Slot A

Hero / Summary Strip 아래.

## Slot B

5위와 6위 사이.

### 광고 구현 조건

광고가 아직 활성화되지 않았어도 슬롯 공간은 유지한다.

목적:

- CLS 방지
- 광고 활성화 후 레이아웃 변경 최소화

공통 컴포넌트:

```text
AdSlot
```

환경변수:

```text
NEXT_PUBLIC_ADSENSE_ENABLED=false
```

`true`일 때만 실제 광고 코드가 렌더링된다.

---

# 7. MovieCard

TOP 10을 세로형 카드로 출력한다.

## 기본 노출

```text
1

영화 제목

[급상승]       흥행 온도 87

순위        ▲2
어제 관객   243,210명
누적 관객   3,124,521명
관객 변화   +18.4%
개봉        2026.08.26

[정보 보기]
```

### 필드

- 현재 순위
- 영화명
- 상태 배지
- 흥행 온도
- 순위 변화
- 전일 관객수
- 누적 관객수
- 관객 증감률
- 개봉일
- 정보 보기

---

# 8. 영화 상세 영역

`정보 보기` 클릭 시에만 KMDb API를 호출한다.

초기 페이지 로딩에서는 KMDb를 호출하지 않는다.

## 상세정보 우선순위

1. 장르
2. 러닝타임
3. 감독
4. 주요 배우 최대 3명
5. 관람등급
6. 줄거리 최대 220자
7. 포스터

포스터는 별도 라이선스 확인 전 비활성화한다.

```text
NEXT_PUBLIC_POSTER_ENABLED=false
```

### 매칭 실패

```text
상세 영화정보를 찾지 못했습니다.
```

KOBIS 순위 영역에는 영향을 주지 않는다.

---

# 9. 데이터 출처 — KOBIS

## 역할

KOBIS가 서비스의 메인 데이터 소스다.

사용 데이터:

- 일별 박스오피스
- 순위
- 순위 변동
- 신규 진입 여부
- 일일 관객
- 관객 증감
- 누적 관객
- 개봉일
- 스크린수
- 상영횟수

REST Host:

```text
www.kobis.or.kr
```

Path:

```text
/kobisopenapi/webservice/rest/boxoffice/searchDailyBoxOfficeList.json
```

요청:

```text
key
targetDt=YYYYMMDD
```

---

# 10. 기준 날짜

기준 timezone:

```text
Asia/Seoul
```

기본:

```text
오늘 - 1일
```

예:

```text
2026-09-01 접속
→ targetDt=20260831
```

데이터 미제공 시 fallback:

```text
D-1
 ↓ empty
D-2
 ↓ empty
D-3
 ↓ empty
Error
```

최대 3일까지만 조회한다.

---

# 11. KOBIS 타입

```ts
interface KobisMovie {
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
```

---

# 12. KOBIS 호출 정책

반드시 서버에서 호출한다.

API key를 브라우저로 전달하지 않는다.

```ts
fetch(url, {
  cache: 'no-store',
});
```

하지 않는 것:

```text
DB 저장
Redis 저장
파일 저장
API 원 응답 누적
장기간 서버 캐싱
```

---

# 13. KMDb

## 역할

KOBIS가 제공하지 않는 작품 소개 정보를 가져온다.

- 장르
- 러닝타임
- 감독
- 배우
- 관람등급
- 줄거리
- 포스터 URL

Host:

```text
api.koreafilm.or.kr
```

Path:

```text
/openapi-data2/wisenut/search_api/search_json2.jsp
```

기본 파라미터:

```text
collection=kmdb_new2
detail=Y
title={movieNm}
releaseDts={YYYYMMDD}
ServiceKey={KMDB_API_KEY}
```

---

# 14. KMDb 호출 방식

초기 페이지:

```text
KOBIS 1회
KMDb 0회
```

사용자가 영화 3개의 상세정보를 열었다면:

```text
KOBIS 1회
KMDb 3회
```

TOP 10 전체에 대한 KMDb 선조회는 금지한다.

이 구조의 목적:

- 초기 속도 개선
- API 호출량 감소
- 오류 격리
- 포스터/상세정보에 대한 의존성 감소

---

# 15. KOBIS ↔ KMDb 매칭

두 시스템의 ID를 직접 매핑하지 않는다.

## 매칭 순서

### 1차

KOBIS:

```text
movieNm
openDt
```

KMDb 조회:

```text
title
releaseDts
```

### 2차 검증

정규화한 제목 exact match.

### 3차

개봉연도가 KOBIS 개봉연도 ±1년 범위인지 확인.

### 실패

2개 이상의 후보가 남는 경우 임의 선택하지 않는다.

```text
MATCH_FAILED
```

처리한다.

**잘못된 영화 정보를 보여주는 것보다 없는 정보를 보여주는 것을 우선한다.**

---

# 16. 제목 정규화

KMDb 검색 결과에 포함될 수 있는 가공 문자열을 제거한다.

처리:

```text
trim
연속 공백 → 공백 1개
!HS 제거
!HE 제거
HTML tag 제거
```

정규화 함수:

```text
normalizeMovieTitle()
```

---

# 17. 흥행 온도

## 정의

0~100 사이의 **현재 흥행 강도 + 전일 모멘텀 지표**.

중요:

> 흥행 온도는 미래 흥행을 예측하지 않는다.

---

# 18. 흥행 온도 계산식

```ts
const rank = Number(movie.rank);

const rankInten = clamp(
  Number(movie.rankInten),
  -3,
  3
);

const audiChange = clamp(
  Number(movie.audiChange),
  -50,
  50
);
```

## 현재 순위

최대 50점.

```ts
const rankScore =
  ((11 - rank) / 10) * 50;
```

예:

```text
1위  → 50
5위  → 30
10위 → 5
```

---

## 순위 모멘텀

최대 20점.

```ts
const rankMomentumScore =
  ((rankInten + 3) / 6) * 20;
```

---

## 관객 모멘텀

최대 25점.

```ts
const audienceMomentumScore =
  ((audiChange + 50) / 100) * 25;
```

극단값 영향을 줄이기 위해 ±50%에서 clamp한다.

---

## 신규 진입

```ts
const newBonus =
  movie.rankOldAndNew === 'NEW'
    ? 5
    : 0;
```

---

## 최종

```ts
const heatScore = Math.round(
  clamp(
    rankScore +
      rankMomentumScore +
      audienceMomentumScore +
      newBonus,
    0,
    100
  )
);
```

---

# 19. 흥행 상태

흥행 온도와 별도로 계산한다.

판정 순서:

```ts
if (rankOldAndNew === 'NEW') {
  return '신규';
}

if (
  rankInten >= 2 ||
  audiChange >= 25
) {
  return '급상승';
}

if (
  rankInten >= 1 ||
  audiChange >= 10
) {
  return '상승';
}

if (
  rankInten <= -2 ||
  audiChange <= -25
) {
  return '급하락';
}

if (
  rankInten <= -1 ||
  audiChange <= -10
) {
  return '하락';
}

return '유지';
```

---

# 20. 흥행 온도 라벨

```text
85~100  매우 뜨거움
70~84   흥행 강세
55~69   순항
40~54   관망
0~39    약세
```

UI에서는:

```text
🔥 87
매우 뜨거움
```

형태로 사용할 수 있다.

---

# 21. Methodology 영역

페이지 하단에 별도 섹션을 둔다.

제목:

**흥행 온도는 어떻게 계산하나요?**

설명:

> 흥행 온도는 현재 박스오피스 순위, 전일 대비 순위 변화, 관객수 증감률, 신규 진입 여부를 조합한 영화 온도의 자체 지표입니다. 현재 극장가에서의 흥행 강도와 움직임을 간단하게 비교하기 위한 값이며 향후 관객수나 최종 흥행 실적을 예측하는 지표는 아닙니다.

---

# 22. 기술 스택

```text
Next.js App Router
TypeScript
Tailwind CSS
Netlify

DB 없음
Supabase 없음
Auth 없음
LLM 없음
```

---

# 23. Rendering

홈:

```text
Server Component
```

처리:

```text
Request
 ↓
KOBIS
 ↓
normalize
 ↓
heat score
 ↓
SSR
 ↓
HTML
```

KMDb:

```text
MovieCard
 ↓
정보 보기
 ↓
Route Handler
 ↓
KMDb
 ↓
MovieDetail
```

---

# 24. 권장 폴더 구조

```text
app/
├─ page.tsx
├─ layout.tsx
├─ globals.css
│
├─ api/
│  └─ movie-detail/
│     └─ route.ts
│
├─ privacy/
│  └─ page.tsx
│
└─ error.tsx

components/
├─ Hero.tsx
├─ SummaryStrip.tsx
├─ MovieList.tsx
├─ MovieCard.tsx
├─ MovieDetail.tsx
├─ HeatScore.tsx
├─ StatusBadge.tsx
├─ AdSlot.tsx
├─ Methodology.tsx
└─ Footer.tsx

lib/
├─ kobis.ts
├─ kmdb.ts
├─ movie-match.ts
├─ heat-score.ts
├─ normalize.ts
├─ date.ts
└─ format.ts

types/
├─ kobis.ts
├─ kmdb.ts
└─ movie.ts
```

---

# 25. 환경변수

```text
KOBIS_API_KEY=
KMDB_API_KEY=

NEXT_PUBLIC_ADSENSE_ENABLED=false
NEXT_PUBLIC_POSTER_ENABLED=false

NEXT_PUBLIC_ADSENSE_CLIENT=
```

금지:

```text
NEXT_PUBLIC_KOBIS_API_KEY
NEXT_PUBLIC_KMDB_API_KEY
```

외부 API key는 반드시 server-only다.

---

# 26. 내부 RankedMovie 모델

페이지 컴포넌트에서 KOBIS response를 직접 사용하지 않는다.

```ts
interface RankedMovie {
  rank: number;

  rankDelta: number;
  isNew: boolean;

  movieCode: string;
  title: string;

  openDate: string | null;

  audienceToday: number;
  audienceChange: number;
  audienceTotal: number;

  screenCount: number;
  showCount: number;

  heatScore: number;
  heatLabel: string;

  status:
    | '신규'
    | '급상승'
    | '상승'
    | '유지'
    | '하락'
    | '급하락';
}
```

---

# 27. MovieDetail 모델

```ts
interface MovieDetail {
  genre: string[];

  runtimeMinutes: number | null;

  directors: string[];

  actors: string[];

  rating: string | null;

  plot: string | null;

  posterUrl: string | null;

  source: 'KMDb';
}
```

---

# 28. API 오류 처리

## KOBIS

```text
D-1
 ↓ 실패 / Empty
D-2
 ↓ 실패 / Empty
D-3
 ↓ 실패 / Empty
Error Page
```

문구:

> 현재 박스오피스 정보를 불러오지 못했습니다. 잠시 후 다시 확인해 주세요.

Production에서는 임의의 오래된 mock 데이터를 보여주지 않는다.

---

## KMDb

KMDb 장애는 해당 영화 상세에만 영향을 준다.

```text
영화 순위 → 정상 노출
영화 상세 → Error
```

문구:

> 상세 영화정보를 불러오지 못했습니다.

선택적으로 재시도 버튼을 제공한다.

---

# 29. SEO

## Title

```text
오늘 영화 순위 TOP 10 | 영화 온도
```

## Description

```text
최신 국내 박스오피스 TOP 10과 순위 변동, 관객수, 흥행 온도를 한눈에 확인하세요.
```

---

# 30. SEO 필수 구현

```text
SSR
canonical
robots.txt
sitemap.xml
Search Console
Open Graph
```

검색봇이 JavaScript 실행 없이도 영화 TOP 10을 읽을 수 있어야 한다.

HTML source에 영화명이 존재해야 한다.

---

# 31. Structured Data

홈페이지에:

```text
ItemList
```

JSON-LD 적용.

각 item:

```text
position
name
```

MVP에서는 개별 상세 URL이 없으므로 `Movie` JSON-LD는 적용하지 않는다.

---

# 32. 광고 수익화

수익 모델:

```text
Google AdSense
```

광고 위치:

```text
Hero
 ↓
Summary
 ↓
Ad A
 ↓
1
2
3
4
5
 ↓
Ad B
 ↓
6
7
8
9
10
```

광고는 콘텐츠보다 먼저 나오지 않는다.

---

# 33. Analytics

최소 이벤트:

```text
page_view

movie_detail_open

movie_detail_load_success

movie_detail_load_fail
```

Search Console:

```text
impressions
clicks
CTR
query
average position
```

초기 검증에서는 **광고 매출보다 Google 검색 노출 발생 여부를 먼저 본다.**

---

# 34. 라이선스 / Production Gate

개발은 즉시 진행한다.

광고 활성화는 별도 Gate다.

## KOBIS 확인 항목

Production 전에 서면 확인한다.

### 문의 1

> KOBIS 일별 박스오피스 API를 무료 웹서비스에서 실시간 조회하여 보여주고 해당 페이지에 Google AdSense 광고를 게재할 수 있는가?

### 문의 2

> 하나의 영화 카드에서 KOBIS 박스오피스 데이터 영역과 KMDb 영화 상세정보 영역을 명확히 구분하고 각 출처를 표기하여 함께 제공할 수 있는가?

승인 전:

```text
KOBIS 저장 금지
AdSense OFF
```

---

# 35. 출처 분리 UI

KOBIS 약관 대응을 위해 하나의 카드 안에서도 데이터를 혼합된 문장으로 재작성하지 않는다.

예:

```text
──────────────
박스오피스

1위
누적 320만
▲2

출처 KOBIS
──────────────

영화 정보

감독 OOO
장르 드라마
러닝타임 124분

출처 KMDb
──────────────
```

즉 UI 카드가 하나여도 **데이터 영역은 source별로 명확하게 구분한다.**

---

# 36. 포스터

포스터 URL이 API 응답에 있더라도 바로 사용하지 않는다.

기본:

```text
NEXT_PUBLIC_POSTER_ENABLED=false
```

KMDb/권리자 기준으로 광고형 웹페이지 사용범위를 확인한 뒤 켠다.

포스터 없이도 MVP 디자인이 성립하도록 구현한다.

---

# 37. 모바일

Mobile First.

콘텐츠 최대폭:

```text
약 760px
```

최소 대응:

```text
320px
```

요구사항:

- 가로 스크롤 없음
- MovieCard 전체를 클릭영역으로 만들지 않음
- 정보 보기 버튼 명시
- 상승/하락을 색상으로만 표현하지 않음
- `aria-expanded` 사용
- keyboard focus 지원

---

# 38. 숫자 포맷

기본 숫자:

```text
243,210명
3,120,432명
```

흥행 온도:

```text
87°
```

또는

```text
87 / 100
```

둘 중 하나를 디자인 시 선택하되 서비스 전체에서 통일한다.

---

# 39. 구현 순서

## Step 1

프로젝트 생성.

```text
Next.js
TypeScript
Tailwind
Netlify
```

환경변수 생성.

---

## Step 2

KOBIS 연동.

구현:

```text
lib/kobis.ts
```

완료 조건:

```text
localhost 접속
→ 어제 TOP 10 출력
```

---

## Step 3

ViewModel 생성.

```text
KobisMovie
 ↓
RankedMovie
```

문자열 숫자를 number로 변환한다.

---

## Step 4

흥행 온도 구현.

```text
lib/heat-score.ts
```

unit test 작성.

---

## Step 5

UI.

```text
Hero
SummaryStrip
MovieList
MovieCard
HeatScore
StatusBadge
Methodology
Footer
```

이 시점까지는 **KOBIS만으로 서비스 기본 화면이 완성되어야 한다.**

---

## Step 6

KMDb 연동.

```text
/api/movie-detail
```

제목 + 개봉일 매칭.

---

## Step 7

Movie Detail Accordion.

클릭 시 Lazy Load.

---

## Step 8

SEO.

```text
metadata
robots
sitemap
canonical
OG
ItemList JSON-LD
```

---

## Step 9

Analytics.

---

## Step 10

AdSlot placeholder.

실제 AdSense는 OFF 상태로 배포 가능하게 한다.

---

# 40. 테스트

## Heat Score

반드시 테스트:

```text
1위 / 변화 없음

10위 / 변화 없음

신규 진입

rankInten +5
→ +3으로 clamp

rankInten -8
→ -3으로 clamp

audiChange +200
→ +50으로 clamp

audiChange -95
→ -50으로 clamp
```

---

## KOBIS

```text
정상 TOP 10

D-1 empty
→ D-2 조회

D-1~D-3 전체 empty

API 500

숫자 필드 empty
```

---

## KMDb

```text
제목 + 개봉일 exact match

동명 영화 2개

개봉일 불일치

Result empty

metadata 일부 null

!HS / !HE 포함
```

---

# 41. Definition of Done

- `/` 접속 시 최신 가용 박스오피스 TOP 10이 표시된다.
- DB를 사용하지 않는다.
- 순위가 정확하게 표시된다.
- 일일 관객수가 표시된다.
- 누적 관객수가 표시된다.
- 순위 변화가 표시된다.
- 관객 증감률이 표시된다.
- 흥행 온도가 계산된다.
- 상태 배지가 계산된다.
- 신규 진입을 식별한다.
- KMDb는 상세 버튼 클릭 전 호출되지 않는다.
- 상세정보 클릭 시 영화정보가 표시된다.
- 동명 영화 매칭이 불명확하면 정보를 노출하지 않는다.
- KOBIS API key가 브라우저에 노출되지 않는다.
- KMDb API key가 브라우저에 노출되지 않는다.
- KOBIS 결과를 영구 저장하지 않는다.
- KOBIS와 KMDb 영역의 출처가 구분된다.
- API 실패 상태가 구현되어 있다.
- TOP 10 영화명이 SSR HTML에 존재한다.
- sitemap이 존재한다.
- robots가 존재한다.
- canonical이 존재한다.
- OG가 존재한다.
- 광고 OFF 상태에서 레이아웃이 정상이다.
- 포스터 OFF 상태에서 레이아웃이 정상이다.
- 모바일 320px에서 가로 스크롤이 없다.
- Production AdSense 활성화가 feature flag 뒤에 있다.

---

# 42. MVP 완료 이후

트래픽 신호가 확인되었을 때만 확장한다.

### v1.1 후보

```text
주간 순위

3일 / 7일 트렌드

역주행 영화

신규 영화

한국 / 해외 영화 필터

/daily/[date]

/movie/[slug]
```

과거 KOBIS 데이터를 저장해야 하는 기능은 **저장 허가 또는 저장 가능한 별도 데이터 소스 확보 이후에만 진행한다.**

---

# 43. 최종 구현 결정

| 항목 | 결정 |
|---|---|
| 형태 | 단일 페이지 웹 |
| 수익 | AdSense |
| 핵심 가치 | 최신 영화 순위 + 흥행 흐름 |
| 차별화 | 흥행 온도 + 상태 배지 |
| Framework | Next.js App Router |
| Language | TypeScript |
| CSS | Tailwind |
| Hosting | Netlify |
| DB | 없음 |
| Supabase | 없음 |
| KOBIS | 페이지 진입 시 서버 조회 |
| KOBIS Cache | no-store |
| KMDb | 상세 클릭 시 조회 |
| TMDB | 사용 안 함 |
| 과거 데이터 저장 | 안 함 |
| 사용자 계정 | 없음 |
| 사용자 데이터 | 없음 |
| LLM | 없음 |
| Poster | 권리 확인 전 OFF |
| AdSense | API 사용범위 확인 전 OFF |
| MVP URL | `/` |