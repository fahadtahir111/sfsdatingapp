"use client";

import { useEffect, useState, useCallback, useRef } from "react";

/**
 * useRealTime Polling Hook
 * @param action - The server action or fetcher function to call.
 * @param interval - Polling interval in milliseconds (default 3s).
 * @param dependencies - Optional array of dependencies to restart the loop.
 */
export function useRealTime<T>(
  action: () => Promise<T>,
  interval: number = 3000,
  dependencies: unknown[] = [],
  enabled: boolean = true
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<unknown>(null);
  const isMounted = useRef(true);

  const fetchData = useCallback(async () => {
    if (!enabled) return;
    if (typeof document !== "undefined" && document.visibilityState === "hidden") return;
    if (typeof navigator !== "undefined" && !navigator.onLine) return;
    try {
      const result = await action();
      if (isMounted.current) {
        setData(result);
        setError(null);
      }
    } catch (err) {
      if (isMounted.current) setError(err);
    } finally {
      if (isMounted.current) setLoading(false);
    }
  }, [action, enabled]);

  useEffect(() => {
    isMounted.current = true;
    fetchData();

    const timer = setInterval(fetchData, interval);
    const onVisible = () => {
      if (document.visibilityState === "visible") fetchData();
    };
    const onOnline = () => fetchData();
    if (typeof document !== "undefined") {
      document.addEventListener("visibilitychange", onVisible);
    }
    if (typeof window !== "undefined") {
      window.addEventListener("online", onOnline);
    }

    return () => {
      isMounted.current = false;
      clearInterval(timer);
      if (typeof document !== "undefined") {
        document.removeEventListener("visibilitychange", onVisible);
      }
      if (typeof window !== "undefined") {
        window.removeEventListener("online", onOnline);
      }
    };
  }, [fetchData, interval, ...dependencies]); // eslint-disable-line react-hooks/exhaustive-deps

  const refresh = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return { data, setData, loading, error, refresh };
}
