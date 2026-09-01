import Script from 'next/script';
import { FLAGS } from '@/lib/site';

/**
 * AdSense 로더.
 * Production 활성화는 feature flag 뒤에 있으며 기본값은 OFF 다.
 */
export default function AdSenseScript() {
  if (!FLAGS.adsenseEnabled || !FLAGS.adsenseClient) return null;

  return (
    <Script
      id="adsbygoogle-init"
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${FLAGS.adsenseClient}`}
      crossOrigin="anonymous"
      strategy="afterInteractive"
    />
  );
}
