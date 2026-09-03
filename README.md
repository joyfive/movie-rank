# CineGauge 씨네게이지

오늘 극장가 박스오피스 TOP 10을 **순위**뿐 아니라 **지금 얼마나 뜨고 있는가**까지 한눈에 보여주는
단일 페이지 영화 흥행 현황 서비스.

- 일별 박스오피스 TOP 10 (KOBIS)
- 흥행 온도 0~100 및 상태 배지(신규 / 급상승 / 상승 / 유지 / 하락 / 급하락)
- 관객수 · 누적 관객수 · 증감률 · 순위 변동
- [정보 보기] 클릭 시에만 조회하는 KMDb 상세정보
- DB / 로그인 / 회원 / 개인화 없음

## 기술 스택

| 항목 | 값 |
|---|---|
| Framework | Next.js App Router (16) |
| Language | TypeScript |
| CSS | Tailwind CSS v4 |
| Test | Vitest |
| Hosting | Netlify |
| DB | 없음 |

## 디자인

라이트 테마 고정(`color-scheme: light`). **포스터 갤러리에서 한 편을 고르면 위쪽 스테이지가 바뀌는** 구조다.
동일한 상세 카드를 10번 반복하지 않는다.

```
Hero → Summary → Ad A → [스테이지: 선택된 1편] → 레일 1–5위 → Ad B → 레일 6–10위 → Methodology
```

- 갤러리는 `role="tablist"`, 스테이지는 `role="tabpanel"`. 좌우 방향키·Home·End 로 이동한다.
- 스테이지 10개를 모두 렌더하고 선택되지 않은 것은 `hidden` 으로 둔다.
  검색봇이 JavaScript 없이도 TOP 10 의 영화명과 지표를 읽어야 하기 때문이다(PRD 30).
- 시각 장치: 순위 고스트 숫자, 포스터에 겹쳐 뜨는 원형 흥행 온도 뱃지,
  선택된 포스터를 받치는 레드 블록.
- 레일은 레일 안에서만 가로 스크롤한다. 페이지는 320px 에서도 가로 스크롤이 없다.

| 항목 | 값 |
|---|---|
| 타이틀 | 양진체 (Yangjin) — 단일 weight, `.font-display` |
| 본문 | SUIT — 300 / 400 / 600 |
| 액센트 | `#e50914` (채움) / `#ff4b55` (텍스트) |
| 상태색 | 상승 레드 · 하락 블루 · 신규 골드 · 유지 그레이 (기호 병기) |

폰트는 `app/globals.css` 의 `@font-face` 에서 jsDelivr CDN 으로 불러오며 `font-display: swap` 이다.
색·간격·라운드는 모두 같은 파일의 `@theme` 토큰에 있으므로 스킨 변경은 이 블록만 수정하면 된다.
양진체는 weight 가 하나뿐이라 합성 bold 가 붙지 않도록 `.font-display` 에서 `font-weight: normal` 을 강제한다.

## 시작하기

```bash
npm install
cp .env.example .env.local   # KOBIS_API_KEY, KMDB_API_KEY 입력
npm run dev
```

`http://localhost:3000` 접속 시 어제(Asia/Seoul 기준 D-1) TOP 10이 표시된다.

### 스크립트

```bash
npm run dev        # 개발 서버
npm run build      # 프로덕션 빌드
npm run start      # 프로덕션 서버
npm run lint       # ESLint
npm run typecheck  # tsc --noEmit
npm test           # Vitest
```

## 환경변수

`.env.example` 참고.

| 이름 | 설명 |
|---|---|
| `KOBIS_API_KEY` | KOBIS OpenAPI key. **server-only** |
| `KMDB_API_KEY` | KMDb OpenAPI ServiceKey. **server-only** |
| `NEXT_PUBLIC_SITE_URL` | canonical / sitemap / OG 기준 URL. 비워두면 Netlify `URL` / `DEPLOY_PRIME_URL`, Vercel `VERCEL_URL` 순으로 폴백한다 |
| `NEXT_PUBLIC_ADSENSE_ENABLED` | `true` 일 때만 실제 광고 코드 렌더링 (기본 `false`) |
| `NEXT_PUBLIC_ADSENSE_CLIENT` | AdSense `ca-pub-...` |
| `NEXT_PUBLIC_ADSENSE_SLOT_A` / `_B` | 광고 슬롯 ID |
| `NEXT_PUBLIC_POSTER_ENABLED` | `true` 일 때만 포스터 노출 (기본 `false`) |
| `NEXT_PUBLIC_GA_ID` | GA4 측정 ID (선택) |
| `GOOGLE_SITE_VERIFICATION` | Search Console 소유 확인 (선택) |

> `NEXT_PUBLIC_KOBIS_API_KEY`, `NEXT_PUBLIC_KMDB_API_KEY` 는 절대 사용하지 않는다.
> 외부 API key는 반드시 server-only 이며 `lib/kobis.ts` / `lib/kmdb.ts` 는 `server-only` 로 가드되어 있다.

## 데이터 흐름

```
Request → KOBIS(일별 박스오피스, no-store) → normalize → heat score → SSR HTML
MovieCard → [정보 보기] → /api/movie-detail → KMDb → MovieDetail
```

- 기준일은 Asia/Seoul 기준 **D-1**. 데이터가 없으면 D-2, D-3까지만 fallback 하고 그 이후는 오류 화면.
- KOBIS 응답은 DB / Redis / 파일에 저장하지 않으며 장기 서버 캐싱도 하지 않는다.
- 초기 로딩에서 KMDb는 **0회** 호출된다. 상세를 3개 열면 KMDb 3회.

## 흥행 온도

0~100 사이의 **현재 흥행 강도 + 전일 모멘텀** 지표이며 미래 흥행을 예측하지 않는다.

| 구성 | 배점 | 비고 |
|---|---|---|
| 현재 순위 | 50 | `((11 - rank) / 10) * 50` |
| 순위 모멘텀 | 20 | `rankInten` ±3 clamp |
| 관객 모멘텀 | 25 | `audiChange` ±50% clamp |
| 신규 진입 | 5 | `rankOldAndNew === 'NEW'` |

라벨: `85~100 매우 뜨거움` / `70~84 흥행 강세` / `55~69 순항` / `40~54 관망` / `0~39 약세`

구현은 `lib/heat-score.ts`, 테스트는 `lib/__tests__/heat-score.test.ts`.

## KOBIS ↔ KMDb 매칭

두 시스템의 ID를 직접 매핑하지 않는다.

1. KOBIS `movieNm` + `openDt` 로 KMDb `title` + `releaseDts` 조회
2. 정규화한 제목 exact match
3. 개봉연도가 KOBIS 개봉연도 ±1년 이내인지 확인
4. 후보가 2개 이상 남으면 임의 선택하지 않고 `MATCH_FAILED`

**잘못된 영화 정보를 보여주는 것보다 없는 정보를 보여주는 것을 우선한다.**

## 배포 (Netlify)

`netlify.toml` 에 `@netlify/plugin-nextjs` 가 설정되어 있다.
Netlify 사이트의 Environment variables 에 위 환경변수를 등록한 뒤 배포한다.

## 트러블슈팅

### 화면에 "현재 박스오피스 정보를 불러오지 못했습니다" 만 보인다

KOBIS 조회가 D-1 ~ D-3 모두 실패했을 때의 정상 동작이다. 원인은 서버 로그의 `[kobis]` 라인에 남는다.

| 로그 | 원인 | 조치 |
|---|---|---|
| `[kobis] MISSING_API_KEY` | `KOBIS_API_KEY` 미설정 | 배포 환경변수에 키 등록 후 **재배포** |
| `[kobis] KOBIS 오류 (...): 잘못된 키값입니다.` | 키가 틀림 | KOBIS 발급 키 확인 |
| `[kobis] KOBIS 요청 실패 / HTTP 5xx` | KOBIS 장애 또는 아웃바운드 차단 | KOBIS 상태 및 호스팅 네트워크 확인 |
| `[kobis] NO_DATA` | D-1~D-3 데이터가 모두 비어 있음 | KOBIS 데이터 갱신 대기 |

- 로컬은 `.env.local`, 배포는 호스팅 대시보드의 Environment variables 에 키를 넣는다. `.env.local` 은 커밋되지 않으므로 **배포 환경에는 따로 등록해야 한다.**
- 환경변수는 빌드 시점에 주입되므로 값을 추가한 뒤에는 재배포가 필요하다.
- 개발 환경(`npm run dev`)에서는 오류 화면에 원인(`MISSING_API_KEY` 등)이 함께 표시된다. Production 에서는 노출되지 않는다.

## 라이선스 / Production Gate

개발은 진행하되 **광고 활성화는 별도 Gate** 다. 아래 확인 전까지 다음을 유지한다.

```
KOBIS 데이터 저장 금지
NEXT_PUBLIC_ADSENSE_ENABLED=false
NEXT_PUBLIC_POSTER_ENABLED=false
```

- KOBIS 일별 박스오피스 API를 무료 웹서비스에서 실시간 조회해 보여주고 해당 페이지에 AdSense를 게재할 수 있는지 서면 확인
- 하나의 카드에서 KOBIS 영역과 KMDb 영역을 구분하고 각 출처를 표기해 함께 제공할 수 있는지 서면 확인
- 포스터는 KMDb / 권리자 기준으로 광고형 웹페이지 사용범위 확인 후 활성화

원본 기획은 `PRD — 영화 온도 (가칭).md` 참고.
