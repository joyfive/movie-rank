import { COPY } from '@/lib/site';

const BANDS = [
  { range: '85 – 100', label: '매우 뜨거움' },
  { range: '70 – 84', label: '흥행 강세' },
  { range: '55 – 69', label: '순항' },
  { range: '40 – 54', label: '관망' },
  { range: '0 – 39', label: '약세' },
];

export default function Methodology() {
  return (
    <section className="px-4 py-8" aria-labelledby="methodology-title">
      <div className="rounded-card border border-border bg-surface p-5">
        <h2 id="methodology-title" className="text-base font-bold text-fg">
          {COPY.methodologyTitle}
        </h2>

        <p className="mt-3 text-sm leading-relaxed text-fg-muted">{COPY.methodologyBody}</p>

        <dl className="mt-4 grid grid-cols-1 gap-x-4 gap-y-1.5 text-sm sm:grid-cols-2">
          {BANDS.map((band) => (
            <div key={band.range} className="flex items-center justify-between gap-3">
              <dt className="tabular text-fg-subtle">{band.range}</dt>
              <dd className="font-semibold text-fg">{band.label}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
