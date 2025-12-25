import { useState, useEffect, useCallback } from 'react';
import { fetchNews, createDataRefreshInterval } from '../lib/dataService';
import type { LiveNewsItem } from '../types/data';

const REFRESH_INTERVAL = 15 * 60 * 1000;

export function useLiveNews(query?: string) {
  const [news, setNews] = useState<LiveNewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const loadNews = useCallback(async () => {
    const response = await fetchNews(query);

    if (response.success && response.data) {
      setNews(response.data);
      setLastUpdated(new Date());
      setError(null);
    } else if (response.error) {
      setError(response.error);
    }

    setLoading(false);
  }, [query]);

  useEffect(() => {
    loadNews();
    const cleanup = createDataRefreshInterval(loadNews, REFRESH_INTERVAL);
    return cleanup;
  }, [loadNews]);

  return { news, loading, error, lastUpdated, refresh: loadNews };
}
