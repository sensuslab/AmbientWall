import { useState, useEffect, useCallback } from 'react';
import { fetchPhotos, createDataRefreshInterval } from '../lib/dataService';
import type { PhotoData } from '../types/data';

const REFRESH_INTERVAL = 60 * 60 * 1000;

export function useLivePhotos(query?: string) {
  const [photos, setPhotos] = useState<PhotoData[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPhotos = useCallback(async () => {
    const response = await fetchPhotos(query);

    if (response.success && response.data) {
      setPhotos(response.data);
      setError(null);
    } else if (response.error) {
      setError(response.error);
    }

    setLoading(false);
  }, [query]);

  useEffect(() => {
    loadPhotos();
    const cleanup = createDataRefreshInterval(loadPhotos, REFRESH_INTERVAL);
    return cleanup;
  }, [loadPhotos]);

  const nextPhoto = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % Math.max(1, photos.length));
  }, [photos.length]);

  const prevPhoto = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + photos.length) % Math.max(1, photos.length));
  }, [photos.length]);

  const currentPhoto = photos[currentIndex] || null;

  return {
    photos,
    currentPhoto,
    currentIndex,
    loading,
    error,
    nextPhoto,
    prevPhoto,
    refresh: loadPhotos,
  };
}
