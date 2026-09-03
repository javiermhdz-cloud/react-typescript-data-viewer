import { useEffect, useState } from "react";

type UseFetchResult<T> = {
  data: T | null;
  loading: boolean;
  error: string | null;
};

export function useFetch<T>(url: string): UseFetchResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadData() {
      setLoading(true);
      setError(null);
      setData(null);

      try {
        const response = await fetch(url, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Error HTTP: ${response.status}`);
        }

        const result = (await response.json()) as T;
        setData(result);
      } catch (caughtError: unknown) {
        if (
          caughtError instanceof DOMException &&
          caughtError.name === "AbortError"
        ) {
          return;
        }

        setError(
          caughtError instanceof Error
            ? caughtError.message
            : "No fue posible cargar los datos"
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    void loadData();

    return () => {
      controller.abort();
    };
  }, [url]);

  return { data, loading, error };
}