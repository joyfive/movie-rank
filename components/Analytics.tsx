'use client';

import { useEffect } from 'react';
import Script from 'next/script';
import { track } from '@/lib/analytics';

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

/** page_view 를 포함한 최소 분석 이벤트를 초기화한다. */
export default function Analytics() {
  useEffect(() => {
    track('page_view', { page_path: '/' });
  }, []);

  if (!GA_ID) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          window.gtag = gtag;
          gtag('js', new Date());
          gtag('config', '${GA_ID}');
        `}
      </Script>
    </>
  );
}
