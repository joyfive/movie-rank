import { FLAGS } from '@/lib/site';

interface AdSlotProps {
  /** AdSense data-ad-slot 값 */
  slotId?: string;
  label: string;
  /** CLS 방지를 위해 광고 비활성 상태에서도 유지하는 높이 */
  minHeight?: number;
}

/**
 * 광고 슬롯.
 * 광고가 비활성화되어 있어도 공간은 유지해 활성화 시 레이아웃 변경을 최소화한다.
 * 실제 광고 코드는 NEXT_PUBLIC_ADSENSE_ENABLED=true 일 때만 렌더링한다.
 */
export default function AdSlot({ slotId, label, minHeight = 100 }: AdSlotProps) {
  const enabled = FLAGS.adsenseEnabled && FLAGS.adsenseClient && slotId;

  return (
    <div className="px-4" aria-label={label} role="complementary">
      <div
        className="flex items-center justify-center overflow-hidden rounded-card border border-dashed border-border bg-surface-2"
        style={{ minHeight }}
      >
        {enabled ? (
          <ins
            className="adsbygoogle block w-full"
            style={{ display: 'block', minHeight }}
            data-ad-client={FLAGS.adsenseClient}
            data-ad-slot={slotId}
            data-ad-format="auto"
            data-full-width-responsive="true"
          />
        ) : (
          <span className="text-[0.7rem] tracking-widest text-fg-subtle uppercase">Ad</span>
        )}
      </div>
    </div>
  );
}
