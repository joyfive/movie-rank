'use client';

import { useCallback, useEffect, useState } from 'react';
import { track } from '@/lib/analytics';
import { COPY, FLAGS } from '@/lib/site';
import type { MovieDetail as MovieDetailModel, MovieDetailResponse } from '@/types/kmdb';
import type { RankedMovie } from '@/types/movie';

type State =
  | { kind: 'loading' }
  | { kind: 'ready'; detail: MovieDetailModel }
  | { kind: 'not-found' }
  | { kind: 'error' };

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-3 py-1">
      <dt className="w-16 shrink-0 text-fg-subtle">{label}</dt>
      <dd className="min-w-0 flex-1 text-fg">{value}</dd>
    </div>
  );
}

/**
 * KMDb 상세정보 영역.
 * [정보 보기]로 펼쳐졌을 때에만 마운트되며 그 시점에 KMDb 를 1회 호출한다.
 * KMDb 장애는 이 영역에만 영향을 주고 KOBIS 순위 영역에는 영향을 주지 않는다.
 */
export default function MovieDetail({ movie }: { movie: RankedMovie }) {
  const [state, setState] = useState<State>({ kind: 'loading' });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const params = new URLSearchParams({ title: movie.title });
    if (movie.openDate) params.set('openDt', movie.openDate);

    const load = async () => {
      try {
        const response = await fetch(`/api/movie-detail?${params.toString()}`);
        const payload = (await response.json()) as MovieDetailResponse;
        if (cancelled) return;

        if (payload.status === 'OK') {
          setState({ kind: 'ready', detail: payload.detail });
          track('movie_detail_load_success', { movie_code: movie.movieCode, title: movie.title });
          return;
        }

        if (payload.status === 'MATCH_FAILED') {
          setState({ kind: 'not-found' });
          track('movie_detail_load_fail', {
            movie_code: movie.movieCode,
            title: movie.title,
            reason: 'MATCH_FAILED',
          });
          return;
        }

        setState({ kind: 'error' });
        track('movie_detail_load_fail', {
          movie_code: movie.movieCode,
          title: movie.title,
          reason: 'ERROR',
        });
      } catch {
        if (cancelled) return;
        setState({ kind: 'error' });
        track('movie_detail_load_fail', {
          movie_code: movie.movieCode,
          title: movie.title,
          reason: 'NETWORK',
        });
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [attempt, movie.movieCode, movie.openDate, movie.title]);

  const retry = useCallback(() => {
    setState({ kind: 'loading' });
    setAttempt((value) => value + 1);
  }, []);

  return (
    <div className="border-t border-border bg-surface-muted px-4 py-4 text-sm">
      <div className="mb-2 flex items-baseline justify-between gap-2">
        <h4 className="text-xs font-bold tracking-wide text-fg-muted">영화 정보</h4>
        <span className="text-xs text-fg-subtle">출처 KMDb</span>
      </div>

      {state.kind === 'loading' ? (
        <p className="py-2 text-fg-muted" role="status">
          영화 정보를 불러오는 중입니다…
        </p>
      ) : null}

      {state.kind === 'not-found' ? (
        <p className="py-2 text-fg-muted">{COPY.detailNotFound}</p>
      ) : null}

      {state.kind === 'error' ? (
        <div className="py-2">
          <p className="text-fg-muted">{COPY.detailLoadFailed}</p>
          <button
            type="button"
            onClick={retry}
            className="mt-2 rounded-md border border-border-strong bg-surface px-3 py-1.5 text-xs font-semibold text-fg hover:bg-surface-muted"
          >
            다시 시도
          </button>
        </div>
      ) : null}

      {state.kind === 'ready' ? <DetailBody detail={state.detail} title={movie.title} /> : null}
    </div>
  );
}

function DetailBody({ detail, title }: { detail: MovieDetailModel; title: string }) {
  const hasAny =
    detail.genre.length > 0 ||
    detail.runtimeMinutes !== null ||
    detail.directors.length > 0 ||
    detail.actors.length > 0 ||
    detail.rating !== null ||
    detail.plot !== null;

  if (!hasAny) {
    return <p className="py-2 text-fg-muted">{COPY.detailNotFound}</p>;
  }

  return (
    <div className="flex gap-4">
      {FLAGS.posterEnabled && detail.posterUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={detail.posterUrl}
          alt={`${title} 포스터`}
          className="h-auto w-20 shrink-0 rounded-md border border-border object-cover"
          loading="lazy"
        />
      ) : null}

      <div className="min-w-0 flex-1">
        <dl>
          {detail.genre.length > 0 ? <Row label="장르" value={detail.genre.join(', ')} /> : null}
          {detail.runtimeMinutes !== null ? (
            <Row label="러닝타임" value={`${detail.runtimeMinutes}분`} />
          ) : null}
          {detail.directors.length > 0 ? (
            <Row label="감독" value={detail.directors.join(', ')} />
          ) : null}
          {detail.actors.length > 0 ? <Row label="출연" value={detail.actors.join(', ')} /> : null}
          {detail.rating ? <Row label="관람등급" value={detail.rating} /> : null}
        </dl>

        {detail.plot ? (
          <p className="mt-3 leading-relaxed text-fg-muted">{detail.plot}</p>
        ) : null}
      </div>
    </div>
  );
}
