"use client";

import { useEffect, useState } from "react";

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

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    let isMounted = true;

    async function fetchData() {
      try {
        const result = await action();
        if (isMounted) {
          setData(result);
          setError(null);
        }
      } catch (err) {
        if (isMounted) setError(err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    // Initial fetch
    fetchData();

    // Set up interval
    const timer = setInterval(fetchData, interval);

    return () => {
      isMounted = false;
      clearInterval(timer);
    };
  }, [action, interval, ...dependencies, enabled]); // eslint-disable-line react-hooks/exhaustive-deps

  return { data, setData, loading, error };
}
