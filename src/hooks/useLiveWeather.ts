import { useState, useEffect, useCallback } from 'react';
import { fetchWeather, createDataRefreshInterval } from '../lib/dataService';
import type { WeatherData } from '../types/data';

const REFRESH_INTERVAL = 30 * 60 * 1000;

export function useLiveWeather(location?: string) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadWeather = useCallback(async () => {
    const response = await fetchWeather(location);

    if (response.success && response.data) {
      setWeather(response.data);
      setError(null);
    } else if (response.error) {
      setError(response.error);
    }

    setLoading(false);
  }, [location]);

  useEffect(() => {
    loadWeather();
    const cleanup = createDataRefreshInterval(loadWeather, REFRESH_INTERVAL);
    return cleanup;
  }, [loadWeather]);

  return { weather, loading, error, refresh: loadWeather };
}
