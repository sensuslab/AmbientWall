import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Camera, Loader2 } from 'lucide-react';
import { useLivePhotos } from '../../hooks/useLivePhotos';
import type { WidgetComponentProps } from '../../types';

const SLIDESHOW_INTERVAL = 30000;

export function PhotoWidget({ isAmbient, settings }: WidgetComponentProps) {
  const query = (settings?.query as string) || 'nature landscape';
  const { photos, currentPhoto, currentIndex, loading, nextPhoto, prevPhoto } = useLivePhotos(query);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    if (photos.length <= 1) return;
    const interval = setInterval(nextPhoto, SLIDESHOW_INTERVAL);
    return () => clearInterval(interval);
  }, [photos.length, nextPhoto]);

  useEffect(() => {
    setImageLoaded(false);
  }, [currentPhoto?.id]);

  if (loading || !currentPhoto) {
    return (
      <div className="relative w-80 h-52 rounded-2xl overflow-hidden">
        <div className="absolute inset-0 bg-white/25 backdrop-blur-glass border border-white/40" style={{
          boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.5), 0 8px 32px rgba(0, 0, 0, 0.06)'
        }} />
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-80 rounded-2xl overflow-hidden group">
      <div className="absolute inset-0 bg-white/25 backdrop-blur-glass border border-white/40 rounded-2xl" style={{
        boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.5), 0 8px 32px rgba(0, 0, 0, 0.06)'
      }} />

      <div className="relative aspect-[16/10] overflow-hidden rounded-t-2xl">
        <div
          className="absolute inset-0 transition-opacity duration-500"
          style={{
            backgroundColor: currentPhoto.avgColor || '#e5e7eb',
            opacity: imageLoaded ? 0 : 1,
          }}
        />
        <img
          src={currentPhoto.url}
          alt={currentPhoto.alt}
          className={`w-full h-full object-cover transition-opacity duration-500 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={() => setImageLoaded(true)}
        />

        {!isAmbient && (
          <>
            <button
              onClick={prevPhoto}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/20 backdrop-blur-sm text-white/80 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/30"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextPhoto}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/20 backdrop-blur-sm text-white/80 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/30"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </>
        )}
      </div>

      <div className="relative p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Camera className="w-3.5 h-3.5 text-gray-400/70" strokeWidth={1.5} />
            <a
              href={currentPhoto.photographerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-light text-gray-500/70 hover:text-gray-700 transition-colors"
            >
              {currentPhoto.photographer}
            </a>
          </div>

          <div className="flex gap-1">
            {photos.slice(0, 5).map((_, idx) => (
              <div
                key={idx}
                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                  idx === currentIndex
                    ? 'bg-teal-500/60 w-3'
                    : 'bg-gray-300/50'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
