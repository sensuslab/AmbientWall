import type { LiveNewsItem, WeatherData, PhotoData, ApiResponse } from '../types/data';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

async function fetchFromEdgeFunction<T>(
  functionName: string,
  params?: Record<string, string>
): Promise<ApiResponse<T>> {
  try {
    const queryString = params
      ? '?' + new URLSearchParams(params).toString()
      : '';

    const response = await fetch(
      `${SUPABASE_URL}/functions/v1/${functionName}${queryString}`,
      {
        headers: {
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const data = await response.json();
    return data as ApiResponse<T>;
  } catch (error) {
    console.error(`Error fetching from ${functionName}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function fetchNews(query?: string): Promise<ApiResponse<LiveNewsItem[]>> {
  return fetchFromEdgeFunction<LiveNewsItem[]>('fetch-news', query ? { q: query } : undefined);
}

export async function fetchWeather(location?: string): Promise<ApiResponse<WeatherData>> {
  return fetchFromEdgeFunction<WeatherData>('fetch-weather', location ? { location } : undefined);
}

export async function fetchPhotos(query?: string): Promise<ApiResponse<PhotoData[]>> {
  return fetchFromEdgeFunction<PhotoData[]>('fetch-photos', query ? { q: query } : undefined);
}

export function createDataRefreshInterval(
  callback: () => void,
  intervalMs: number
): () => void {
  const intervalId = setInterval(callback, intervalMs);
  return () => clearInterval(intervalId);
}
