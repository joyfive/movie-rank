import { HEAT_WEIGHTS } from '@/lib/heat-score';
import { COPY } from '@/lib/site';

/**
 * 흥행 온도의 실제 구성요소.
 * 계산에 쓰이지 않는 항목(예매율·평점·SNS·검색 트렌드 등)은 넣지 않는다.
 * 지표 설명은 lib/heat-score.ts 의 실제 배점과 일치해야 한다.
 */
const FACTORS = [
  {
    icon: (
      <path d="M4 19h4V9H4v10Zm6 0h4V4h-4v15Zm6 0h4v-7h-4v7Z" />
    ),
    title: '현재 순위',
    weight: HEAT_WEIGHTS.rank,
    description: '오늘 박스오피스에서 몇 위인지를 반영합니다. 1위가 가장 높습니다.',
  },
  {
    icon: <path d="m4 15 6-6 4 4 6-7" strokeWidth="2" fill="none" strokeLinecap="round" />,
    title: '순위 모멘텀',
    weight: HEAT_WEIGHTS.rankMomentum,
    description: '전일 대비 순위가 몇 계단 올랐는지를 ±3계단 범위에서 반영합니다.',
  },
  {
    icon: (
      <path d="M12 3a9 9 0 1 0 9 9h-9V3Z" />
    ),
    title: '관객 모멘텀',
    weight: HEAT_WEIGHTS.audienceMomentum,
    description: '전일 대비 관객수 증감률을 ±50% 범위에서 반영합니다.',
  },
  {
    icon: <path d="M12 2 9 9l-7 .8 5.3 4.6L5.7 22 12 18l6.3 4-1.6-7.6L22 9.8 15 9l-3-7Z" />,
    title: '신규 진입',
    weight: HEAT_WEIGHTS.newBonus,
    description: '오늘 TOP 10에 처음 진입한 영화에 가산점을 줍니다.',
  },
];

const BANDS = [
  { range: '85 – 100', label: '매우 뜨거움' },
  { range: '70 – 84', label: '흥행 강세' },
  { range: '55 – 69', label: '순항' },
  { range: '40 – 54', label: '관망' },
  { range: '0 – 39', label: '약세' },
];

export default function Methodology() {
  return (
    <section className="gutter py-12 lg:py-20" aria-labelledby="methodology-title">
      <h2 id="methodology-title" className="font-display text-2xl text-fg lg:text-3xl">
        {COPY.methodologyTitle}
      </h2>
      <p className="mt-2 max-w-3xl text-sm leading-relaxed text-fg-muted">
        흥행 온도는 영화진흥위원회 통합전산망(KOBIS)의 일별 박스오피스 데이터만으로 계산하는
        CineGauge의 자체 지표입니다. 100점 만점이며 아래 네 가지를 조합합니다.
      </p>

      <div className="mt-7 grid gap-6 lg:grid-cols-[1fr_320px] lg:items-start">
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {FACTORS.map((factor) => (
            <li key={factor.title} className="rounded-card border border-border bg-surface p-4">
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
                className="h-6 w-6 fill-accent stroke-accent text-accent"
              >
                {factor.icon}
              </svg>

              <p className="mt-3 flex items-baseline gap-2">
                <span className="font-display text-base text-fg">{factor.title}</span>
                <span className="tabular text-xs font-semibold text-accent-text">
                  최대 {factor.weight}점
                </span>
              </p>

              <p className="mt-1.5 text-[0.8rem] leading-relaxed text-fg-muted">
                {factor.description}
              </p>
            </li>
          ))}
        </ul>

        <aside className="rounded-card border border-border bg-surface-2 p-5">
          <h3 className="font-display text-base text-fg">흥행 온도란?</h3>
          <p className="mt-2 text-[0.8rem] leading-relaxed text-fg-muted">
            0°부터 100°까지의 지수로, 높을수록 지금 극장가에서 더 많이 보고 더 빠르게 오르고 있는
            영화를 뜻합니다.{' '}
            <strong className="font-semibold text-fg">
              향후 관객수나 최종 흥행 실적을 예측하는 지표는 아닙니다.
            </strong>
          </p>

          <dl className="mt-4 space-y-1.5 text-sm">
            {BANDS.map((band) => (
              <div
                key={band.range}
                className="flex items-center justify-between gap-3 border-b border-border/70 pb-1.5 last:border-b-0"
              >
                <dt className="tabular text-fg-subtle">{band.range}</dt>
                <dd className="font-semibold text-fg">{band.label}</dd>
              </div>
            ))}
          </dl>
        </aside>
      </div>
    </section>
  );
}
