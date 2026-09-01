import type { Metadata } from 'next';
import { SITE } from '@/lib/site';

export const metadata: Metadata = {
  title: `개인정보처리방침 | ${SITE.name} ${SITE.nameKo}`,
  description: `${SITE.name}의 개인정보처리방침 및 광고 쿠키 정책 안내입니다.`,
  alternates: { canonical: '/privacy' },
};

export default function PrivacyPage() {
  return (
    <article className="px-4 py-10 text-sm leading-relaxed text-fg-muted">
      <h1 className="text-xl font-bold text-fg">개인정보처리방침</h1>

      <section className="mt-6">
        <h2 className="text-base font-bold text-fg">1. 수집하는 개인정보</h2>
        <p className="mt-2">
          {SITE.name}({SITE.nameKo})은 회원가입, 로그인 기능을 제공하지 않으며 이용자로부터 이름,
          연락처, 이메일 등 개인정보를 직접 수집하지 않습니다. 서비스는 데이터베이스를 운영하지
          않으며 이용자의 개인정보를 저장하지 않습니다.
        </p>
      </section>

      <section className="mt-6">
        <h2 className="text-base font-bold text-fg">2. 쿠키 및 광고</h2>
        <p className="mt-2">
          본 서비스는 Google AdSense 등 제3자 광고를 게재할 수 있습니다. 광고 제공자는 이용자의
          관심 기반 광고를 제공하기 위해 쿠키를 사용할 수 있으며, 이용자는 브라우저 설정 또는
          Google 광고 설정에서 이를 거부할 수 있습니다.
        </p>
      </section>

      <section className="mt-6">
        <h2 className="text-base font-bold text-fg">3. 분석 도구</h2>
        <p className="mt-2">
          서비스 개선을 위해 페이지 조회수 등 익명 통계를 수집할 수 있습니다. 이 정보는 개인을
          식별할 수 있는 형태로 처리되지 않습니다.
        </p>
      </section>

      <section className="mt-6">
        <h2 className="text-base font-bold text-fg">4. 데이터 출처</h2>
        <p className="mt-2">
          박스오피스 데이터는 영화진흥위원회 영화관입장권 통합전산망(KOBIS) 공개 API를, 영화
          상세정보는 한국영화데이터베이스(KMDb) 공개 API를 실시간으로 조회해 제공하며 별도로
          저장하지 않습니다.
        </p>
      </section>

      <section className="mt-6">
        <h2 className="text-base font-bold text-fg">5. 문의</h2>
        <p className="mt-2">
          개인정보 처리와 관련한 문의는 서비스 운영자에게 전달해 주시기 바랍니다.
        </p>
      </section>
    </article>
  );
}
