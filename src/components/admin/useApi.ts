"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Data hooks for the dashboard. Everything comes from the JSON APIs — the same
 * endpoints the tests exercise — and every response has already been
 * authorized on the server. Stale responses (a slow request that finishes after
 * a newer one) are discarded.
 */

export class ApiFailure extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

async function getJson<T>(url: string, signal: AbortSignal): Promise<T> {
  const response = await fetch(url, { credentials: "same-origin", cache: "no-store", signal });
  const body = (await response.json().catch(() => ({}))) as { error?: string } & T;
  if (!response.ok) {
    throw new ApiFailure(
      response.status === 401
        ? "Your session has expired. Please sign in again."
        : (body.error ?? "Something went wrong. Please try again."),
      response.status,
    );
  }
  return body;
}

export function useApi<T>(url: string | null) {
  const [state, setState] = useState<{
    data: T | null;
    error: ApiFailure | null;
    loading: boolean;
  }>({ data: null, error: null, loading: url !== null });
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (url === null) return;
    const controller = new AbortController();
    setState((previous) => ({ ...previous, loading: true, error: null }));
    getJson<T>(url, controller.signal)
      .then((data) => setState({ data, error: null, loading: false }))
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        setState((previous) => ({
          data: previous.data,
          error: error instanceof ApiFailure ? error : new ApiFailure("Network error.", 0),
          loading: false,
        }));
      });
    return () => controller.abort();
  }, [url, tick]);

  const reload = useCallback(() => setTick((value) => value + 1), []);
  return { ...state, reload };
}

type Paged<K extends string, T> = { [P in K]: T[] } & {
  nextCursor: string | null;
  total?: number | null;
  eventTypes?: string[];
};

/** Cursor pagination with "load more": the first page resets whenever `base` changes. */
export function usePaged<K extends string, T>(base: string | null, key: K) {
  const [items, setItems] = useState<T[]>([]);
  const [next, setNext] = useState<string | null>(null);
  const [total, setTotal] = useState<number | null>(null);
  const [extra, setExtra] = useState<{ eventTypes?: string[] }>({});
  const [loading, setLoading] = useState(base !== null);
  const [error, setError] = useState<ApiFailure | null>(null);
  const [tick, setTick] = useState(0);
  const generation = useRef(0);
  const baseRef = useRef(base);
  baseRef.current = base;

  const fetchPage = useCallback(
    async (cursor: string | null, append: boolean, current: number, signal: AbortSignal) => {
      const url = baseRef.current;
      if (url === null) return;
      setLoading(true);
      setError(null);
      try {
        const separator = url.includes("?") ? "&" : "?";
        const data = await getJson<Paged<K, T>>(
          cursor ? `${url}${separator}cursor=${encodeURIComponent(cursor)}` : url,
          signal,
        );
        if (current !== generation.current) return;
        setItems((previous) => (append ? [...previous, ...data[key]] : data[key]));
        setNext(data.nextCursor);
        if (!append) {
          setTotal(data.total ?? null);
          setExtra(data.eventTypes ? { eventTypes: data.eventTypes } : {});
        }
      } catch (caught) {
        if (signal.aborted || current !== generation.current) return;
        setError(caught instanceof ApiFailure ? caught : new ApiFailure("Network error.", 0));
      } finally {
        if (current === generation.current) setLoading(false);
      }
    },
    [key],
  );

  useEffect(() => {
    generation.current += 1;
    const controller = new AbortController();
    setItems([]);
    setNext(null);
    void fetchPage(null, false, generation.current, controller.signal);
    return () => controller.abort();
  }, [base, tick, fetchPage]);

  const loadMore = useCallback(() => {
    if (!next) return;
    const controller = new AbortController();
    void fetchPage(next, true, generation.current, controller.signal);
  }, [next, fetchPage]);

  const reload = useCallback(() => setTick((value) => value + 1), []);
  return { items, total, loading, error, hasMore: next !== null, loadMore, reload, ...extra };
}

/** Builds `?a=1&b=2`, skipping empty values. */
export function withParams(path: string, params: Record<string, string | number | undefined>) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") search.set(key, String(value));
  }
  const query = search.toString();
  return query ? `${path}?${query}` : path;
}

export function useDebounced<T>(value: T, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const handle = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handle);
  }, [value, delay]);
  return debounced;
}
