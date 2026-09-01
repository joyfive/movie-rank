import Link from 'next/link';

export default function NotFound() {
  return (
    <section className="px-4 py-16 text-center">
      <h1 className="text-xl font-bold text-fg">페이지를 찾을 수 없습니다</h1>
      <p className="mt-4 text-sm text-fg-muted">요청하신 주소가 존재하지 않습니다.</p>
      <Link
        href="/"
        className="mt-6 inline-block rounded-md border border-border-strong bg-surface px-4 py-2 text-sm font-semibold text-fg hover:bg-surface-muted"
      >
        박스오피스 보러가기
      </Link>
    </section>
  );
}
