import type { Metadata, Viewport } from 'next';
import AdSenseScript from '@/components/AdSenseScript';
import Analytics from '@/components/Analytics';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import { SITE } from '@/lib/site';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: SITE.title,
  description: SITE.description,
  applicationName: SITE.name,
  alternates: {
    canonical: '/',
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: SITE.url,
    siteName: `${SITE.name} ${SITE.nameKo}`,
    title: SITE.title,
    description: SITE.description,
  },
  twitter: {
    card: 'summary',
    title: SITE.title,
    description: SITE.description,
  },
  verification: process.env.GOOGLE_SITE_VERIFICATION
    ? { google: process.env.GOOGLE_SITE_VERIFICATION }
    : undefined,
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#08080a',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="min-h-dvh">
        {/* 폰트 CDN. React 19 가 head 로 hoist 한다. */}
        <link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="" />
        <Header />
        <main className="mx-auto max-w-content">{children}</main>
        <Footer />
        <Analytics />
        <AdSenseScript />
      </body>
    </html>
  );
}
