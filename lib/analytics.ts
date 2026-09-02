'use client';

/** PRD 33 최소 이벤트 집합. */
export type AnalyticsEvent =
  | 'page_view'
  | 'movie_detail_open'
  | 'movie_detail_load_success'
  | 'movie_detail_load_fail';

type EventParams = Record<string, string | number | boolean | null>;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

/**
 * 분석 이벤트 전송.
 * GA/GTM 이 로드되지 않은 환경에서는 dataLayer 에만 쌓이고 조용히 무시된다.
 */
export function track(event: AnalyticsEvent, params: EventParams = {}): void {
  if (typeof window === 'undefined') return;

  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push({ event, ...params });

  window.gtag?.('event', event, params);
}
