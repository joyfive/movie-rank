import { NextResponse } from 'next/server';
import { fetchMovieDetail } from '@/lib/kmdb';
import { normalizeMovieTitle } from '@/lib/normalize';
import { COPY } from '@/lib/site';
import type { MovieDetailResponse } from '@/types/kmdb';

export const dynamic = 'force-dynamic';

const MAX_TITLE_LENGTH = 120;

/**
 * KMDb 상세정보 조회.
 * 사용자가 [정보 보기]를 눌렀을 때만 호출되며 API key 는 서버에만 존재한다.
 */
export async function GET(request: Request): Promise<NextResponse<MovieDetailResponse>> {
  const { searchParams } = new URL(request.url);

  const title = normalizeMovieTitle(searchParams.get('title')).slice(0, MAX_TITLE_LENGTH);
  const openDtRaw = searchParams.get('openDt');
  const openDate = openDtRaw && /^\d{4}-\d{2}-\d{2}$/.test(openDtRaw) ? openDtRaw : null;

  if (!title) {
    return NextResponse.json({ status: 'MATCH_FAILED' }, { status: 400 });
  }

  try {
    const outcome = await fetchMovieDetail(title, openDate);

    if (outcome.status === 'MATCH_FAILED') {
      // 잘못된 영화 정보를 보여주는 것보다 없는 정보를 보여주는 것을 우선한다.
      return NextResponse.json(
        { status: 'MATCH_FAILED' },
        { status: 200, headers: { 'Cache-Control': 'no-store' } },
      );
    }

    return NextResponse.json(
      { status: 'OK', detail: outcome.detail },
      { status: 200, headers: { 'Cache-Control': 'no-store' } },
    );
  } catch (error) {
    console.error('[kmdb]', (error as Error).message);

    return NextResponse.json(
      { status: 'ERROR', message: COPY.detailLoadFailed },
      { status: 502, headers: { 'Cache-Control': 'no-store' } },
    );
  }
}
